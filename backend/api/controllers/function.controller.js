import Function from "../../shared/models/function.model.js";
import Log from "../../shared/models/log.model.js";
import Usage from "../../shared/models/usage.model.js";
import bundleCode from "../../shared/services/bundler.service.js";
import { generateHash } from "../../shared/utils/crypto.utils.js";
import {
  uploadOriginalCode,
  uploadBundle,
  readOriginalFiles,
  deleteFunctionFolder,
} from "../../shared/services/storage.service.js";
import mongoose from "mongoose";

const functionDeploy = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Source code is required" });
    }

    const user = req.user;

    const functionId = new mongoose.Types.ObjectId();
    const sourceHash = generateHash(code);

    // Upload original code
    // Assuming code is a single file content for now, or we can handle multiple files if req.body has them
    // For now, treating 'code' as the content of 'index.js'
    const sourcePath = await uploadOriginalCode(functionId.toString(), [
      { name: "index.js", content: code },
    ]);

    const bundledCode = await bundleCode(code);
    const bundleHash = generateHash(bundledCode);

    const bundlePath = await uploadBundle(functionId.toString(), bundledCode);

    const endpoint = `${process.env.FAAS_URL}/run/${user.userName}/${name}`;

    const newFunction = new Function({
      _id: functionId,
      user: user._id,
      name,
      sourcePath, // This will be "functionId/src/"
      bundlePath, // This will be "functionId/bundle/bundle.js"
      sourceHash,
      bundleHash,
      endpoint,
      version: 1,
      stats: {
        executed: 0,
        avgLatency: 0,
        lastExecuted: null,
      },
    });

    await newFunction.save();

    res.json(newFunction);
  } catch (error) {
    console.error("Function deployment error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Function name already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFunctions = async (req, res) => {
  try {
    const functions = await Function.find({ user: req.user._id });

    res.json({ functions });
  } catch (error) {
    console.error("Get functions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFunctionWithId = async (req, res) => {
  try {
    const functionWithId = await Function.findById(req.params.id);
    if (!functionWithId) {
      return res.status(404).json({ message: "Function not found" });
    }

    let code = "";
    try {
      const files = await readOriginalFiles(functionWithId._id.toString());
      // Assuming single file for now or finding index.js
      const mainFile = files.find((f) => f.name === "index.js") || files[0];
      if (mainFile) {
        code = mainFile.content;
      }
    } catch (err) {
      console.error("Error reading source:", err);
    }

    const result = functionWithId.toObject();
    result.code = code;

    res.json(result);
  } catch (error) {
    console.error("Get function error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteFunction = async (req, res) => {
  try {
    const functionWithId = await Function.findByIdAndDelete(req.params.id);
    if (functionWithId) {
      await deleteFunctionFolder(req.params.id);
      await Log.deleteMany({ functionId: req.params.id });
      await Usage.deleteMany({ functionId: req.params.id });
    }
    res.json(functionWithId);
  } catch (error) {
    console.error("Delete function error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateFunction = async (req, res) => {
  try {
    const { code, ...otherUpdates } = req.body;
    let updateData = { ...otherUpdates };

    if (code) {
      const functionId = req.params.id;

      updateData.sourceHash = generateHash(code);

      await uploadOriginalCode(functionId, [
        { name: "index.js", content: code },
      ]);

      const bundledCode = await bundleCode(code);
      updateData.bundleHash = generateHash(bundledCode);

      await uploadBundle(functionId, bundledCode);

      // Paths shouldn't change, but we can update them just in case or increment version
      updateData.version = (await Function.findById(functionId)).version + 1;
    }

    const functionWithId = await Function.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(functionWithId);
  } catch (error) {
    console.error("Update function error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  functionDeploy,
  getFunctions,
  getFunctionWithId,
  deleteFunction,
  updateFunction,
};
