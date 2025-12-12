import User from "../shared/models/user.model.js";
import Function from "../shared/models/function.model.js";
import Log from "../shared/models/log.model.js";
import Usage from "../shared/models/usage.model.js";
import {
  readBundle,
  readOriginalFiles,
  uploadBundle,
} from "../shared/services/storage.service.js";
import bundleCode from "../shared/services/bundler.service.js";
import { generateHash } from "../shared/utils/crypto.utils.js";
import { executeFunction } from "./sandbox.service.js";
import crypto from "crypto";

const gatewayService = async (username, functionName, requestContext) => {
  try {
    const user = await User.findOne({ userName: username });
    if (!user) {
      return { status: 404, message: "User not found" };
    }

    const func = await Function.findOne({
      user: user._id,
      name: functionName,
    });

    if (!func) {
      return { status: 404, message: "Function not found" };
    }

    if (func.isActive === false) {
      return { status: 503, message: "Function is currently inactive" };
    }

    let code;
    try {
      code = await readBundle(func._id.toString());
    } catch (err) {
      console.error("Error reading function bundle:", err);
      return { status: 500, message: "Error reading function code" };
    }

    const currentHash = generateHash(code);

    if (currentHash !== func.bundleHash) {
      console.warn("Hash mismatch detected! Initiating auto-rebundle...", {
        current: currentHash,
        expected: func.bundleHash,
      });

      try {
        // 1. Fetch original code
        const files = await readOriginalFiles(func._id.toString());
        if (!files || files.length === 0) {
          throw new Error("Source files not found for re-bundling");
        }

        const mainFile = files.find((f) => f.name === "index.js") || files[0];
        const sourceCode = mainFile.content;

        // 2. Bundle code
        const bundledCode = await bundleCode(sourceCode);

        // 3. Generate new hash
        const newBundleHash = generateHash(bundledCode);

        // 4. Upload new bundle
        await uploadBundle(func._id.toString(), bundledCode);

        // 5. Update DB
        await Function.findByIdAndUpdate(func._id, {
          bundleHash: newBundleHash,
          $inc: { version: 1 },
        });

        console.log("Auto-rebundle successful. Proceeding with execution.");
        code = bundledCode; // Use new code for execution
      } catch (rebundleError) {
        console.error("Auto-rebundle failed:", rebundleError);
        return {
          status: 500,
          message: "Integrity check failed and re-bundling failed",
        };
      }
    }

    const executionId = crypto.randomUUID();
    const startTime = new Date();

    // Call Sandbox Service via Client Wrapper
    const executionResult = await executeFunction(
      func._id.toString(),
      requestContext
    );

    const endTime = new Date();
    const duration = endTime - startTime;

    // Create Log entry
    const memoryUsed = executionResult.memoryUsage
      ? Math.round(executionResult.memoryUsage.heapUsed / 1024 / 1024) // Convert to MB
      : 0;

    await Log.create({
      functionId: func._id,
      executionId,
      logs: executionResult.logs || [],
      status: executionResult.success ? "success" : "error",
      startTime,
      endTime,
      duration,
      memoryUsed,
      error: executionResult.error,
    });

    // Create Usage entry
    await Usage.create({
      functionId: func._id,
      userId: user._id,
      executionId,
      duration,
      memoryUsed,
      timestamp: endTime,
      status: executionResult.success ? "success" : "error",
      error: executionResult.error,
    });

    // Calculate new stats
    const totalExecuted = (func.stats?.executed || 0) + 1;
    const oldAvgLatency = func.stats?.avgLatency || 0;
    const newAvgLatency = Math.round(
      (oldAvgLatency * (totalExecuted - 1) + duration) / totalExecuted
    );

    const oldAvgMemory = func.stats?.avgMemory || 0;
    const newAvgMemory = Math.round(
      (oldAvgMemory * (totalExecuted - 1) + memoryUsed) / totalExecuted
    );

    const isError = !executionResult.success;

    await Function.findByIdAndUpdate(func._id, {
      $inc: {
        "stats.executed": 1,
        "stats.errors": isError ? 1 : 0,
      },
      $set: {
        "stats.lastExecuted": new Date(),
        "stats.avgLatency": newAvgLatency,
        "stats.avgMemory": newAvgMemory,
      },
    });

    await User.findByIdAndUpdate(user._id, {
      $inc: { "usage.executed": 1 },
      $set: { "usage.lastExecuted": new Date() },
    });

    if (executionResult.success) {
      return { status: 200, data: executionResult };
    } else {
      return { status: 500, data: executionResult };
    }
  } catch (error) {
    console.error("Gateway service error:", error);
    return { status: 500, message: "Internal server error" };
  }
};

export default gatewayService;
