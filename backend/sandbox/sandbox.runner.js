import { fork, execSync } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import {
  readPackageJson,
  readBundle,
  readDependencyCache,
  uploadDependencyCache,
} from "../shared/services/storage.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const executeFunction = (functionId, context) => {
  return new Promise(async (resolve) => {
    // 1. Create a temp directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sandbox-"));

    try {
      // 2. Fetch bundled code
      const bundledCode = await readBundle(functionId);
      const codeFilePath = path.join(tempDir, "index.js");
      fs.writeFileSync(codeFilePath, bundledCode);

      // 3. Fetch package.json (created during deploy)
      const packageJsonContent = await readPackageJson(functionId);

      if (packageJsonContent) {
        fs.writeFileSync(
          path.join(tempDir, "package.json"),
          packageJsonContent
        );

        // Try to fetch dependency cache
        let cacheHit = false;
        try {
          const cacheStream = await readDependencyCache(functionId);
          if (cacheStream) {
            const tarPath = path.join(tempDir, "node_modules.tar.gz");
            const writeStream = fs.createWriteStream(tarPath);

            await new Promise((resolve, reject) => {
              cacheStream.pipe(writeStream);
              writeStream.on("finish", resolve);
              writeStream.on("error", reject);
            });

            execSync("tar -xzf node_modules.tar.gz", { cwd: tempDir });
            cacheHit = true;
          }
        } catch (err) {
          console.warn("Cache fetch failed:", err.message);
        }

        if (!cacheHit) {
          try {
            // 4. Install dependencies inside tempDir
            execSync("npm install --production", {
              cwd: tempDir,
              stdio: "ignore",
            });

            // Create cache
            console.log("Creating dependency cache...");
            execSync("tar -czf node_modules.tar.gz node_modules", {
              cwd: tempDir,
            });
            const cacheBuffer = fs.readFileSync(
              path.join(tempDir, "node_modules.tar.gz")
            );
            await uploadDependencyCache(functionId, cacheBuffer);
            console.log("Cache uploaded.");
          } catch (err) {
            console.error("Dependency installation failed:", err.message);
          }
        }
      }

      // 5. Fork worker
      const workerPath = path.join(__dirname, "sandbox.worker.js");
      const child = fork(workerPath);

      let isDone = false;

      const timeout = setTimeout(() => {
        if (!isDone) {
          child.kill();
          isDone = true;
          resolve({
            success: false,
            error: "Execution timed out",
            logs: [],
          });
        }
      }, 6000);

      // 6. Handle worker messages
      child.on("message", (message) => {
        if (!isDone) {
          clearTimeout(timeout);
          isDone = true;
          resolve(message);
        }
      });

      child.on("error", (error) => {
        if (!isDone) {
          clearTimeout(timeout);
          isDone = true;
          resolve({
            success: false,
            error: `Worker error: ${error.message}`,
            logs: [],
          });
        }
      });

      child.on("exit", (code) => {
        if (!isDone && code !== 0) {
          clearTimeout(timeout);
          isDone = true;
          resolve({
            success: false,
            error: `Worker exited with code ${code}`,
            logs: [],
          });
        }
      });

      // 7. Send only context + root path — NOT CODE
      child.send({ type: "execute", context, root: tempDir });
    } catch (err) {
      resolve({
        success: false,
        error: `Sandbox setup failed: ${err.message}`,
        logs: [],
      });
    }
  });
};
