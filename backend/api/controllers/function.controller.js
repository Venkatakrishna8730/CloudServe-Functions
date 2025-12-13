import Function from "../../shared/models/function.model.js";
import Log from "../../shared/models/log.model.js";
import Usage from "../../shared/models/usage.model.js";
import bundleCode from "../../shared/services/bundler.service.js";
import { generateHash } from "../../shared/utils/crypto.utils.js";
import {
  uploadOriginalCode,
  uploadBundle,
  uploadPackageJson,
  readOriginalFiles,
  deleteFunctionFolder,
  deleteDependencyCache,
  checkDependencyBundle,
  uploadDependencyBundle,
} from "../../shared/services/storage.service.js";
import { computeDependencyHash } from "../../shared/utils/dependencyHash.js";
import { buildDependencyBundle } from "../../shared/services/dependencyBuilder.service.js";
import mongoose from "mongoose";

const ensureDependencyBundle = async (depHash, packageJsonString) => {
  const bundleExists = await checkDependencyBundle(depHash);
  if (bundleExists) {
    console.log(`Dependency bundle found for hash ${depHash}, reusing.`);
    return;
  }

  console.log(`Building dependency bundle for hash ${depHash}...`);
  const bundleBuffer = await buildDependencyBundle(packageJsonString);
  await uploadDependencyBundle(depHash, bundleBuffer);
  console.log(`Dependency bundle uploaded for hash ${depHash}`);
};

const handleDeployment = async (functionId, code, user, name, filename) => {
  try {
    console.log(`Starting background deployment for ${functionId}`);

    
    await Function.findByIdAndUpdate(functionId, { status: "deploying" });

    
    const sourcePath = await uploadOriginalCode(functionId.toString(), [
      { name: filename, content: code },
    ]);

    
    const { code: bundledCode, dependencies } = await bundleCode(code);
    const bundleHash = generateHash(bundledCode);
    const bundlePath = await uploadBundle(functionId.toString(), bundledCode);

    let depHash = null;

    
    if (dependencies && dependencies.length > 0) {
      const packageJson = {
        name: `func-${name}`,
        version: "1.0.0",
        dependencies: {},
      };

      if (dependencies.length > 50) {
        throw new Error("Too many dependencies (max 50)");
      }

      const depNameRegex =
        /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

      dependencies.forEach((dep) => {
        if (!depNameRegex.test(dep)) {
          throw new Error(`Invalid dependency name: ${dep}`);
        }
        packageJson.dependencies[dep] = "latest";
      });

      const packageJsonString = JSON.stringify(packageJson, null, 2);
      await uploadPackageJson(functionId.toString(), packageJsonString);

      
      depHash = computeDependencyHash(packageJson.dependencies);

      
      await Function.findByIdAndUpdate(functionId, { depHash });

      
      await ensureDependencyBundle(depHash, packageJsonString);
    } else {
      
      await uploadPackageJson(
        functionId.toString(),
        JSON.stringify({ dependencies: {} })
      );
    }

    
    await Function.findByIdAndUpdate(functionId, {
      status: "active",
      sourcePath,
      bundlePath,
      bundleHash,
      depHash,
      deployedAt: new Date(),
      deployError: null,
    });

    console.log(`Deployment successful for ${functionId}`);
  } catch (error) {
    console.error(`Deployment failed for ${functionId}:`, error);
    await Function.findByIdAndUpdate(functionId, {
      status: "failed",
      deployError: error.message,
    });
  }
};

const functionDeploy = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Source code is required" });
    }

    const user = req.user;

    const functionId = new mongoose.Types.ObjectId();
    const sourceHash = generateHash(code);

    let filename = req.body.filename;
    if (!filename) {
      const isTS = /:\s*\w+|interface\s+\w+|type\s+\w+/.test(code);
      filename = isTS ? "index.ts" : "index.js";
    }

    const endpoint = `${process.env.FAAS_URL}/run/${user.userName}/${name}`;

    
    const newFunction = new Function({
      _id: functionId,
      user: user._id,
      name,
      sourcePath: `${functionId}/src/`, 
      bundlePath: `${functionId}/bundle/bundle.js`, 
      sourceHash,
      
      endpoint,
      version: 1,
      status: "pending",
      stats: {
        executed: 0,
        avgLatency: 0,
        lastExecuted: null,
      },
    });

    await newFunction.save();

    
    handleDeployment(functionId, code, user, name, filename);

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
    let mainFile;
    try {
      const files = await readOriginalFiles(functionWithId._id.toString());
      console.log(
        `Files found for ${functionWithId._id}:`,
        files.map((f) => f.name)
      );
      mainFile =
        files.find((f) => f.name === "index.ts") ||
        files.find((f) => f.name === "index.js") ||
        files[0];
      if (mainFile) {
        code = mainFile.content;
      } else {
        console.warn(`No main file found for ${functionWithId._id}`);
      }
    } catch (err) {
      console.error("Error reading source:", err);
    }

    const result = functionWithId.toObject();
    result.code = code;
    result.filename = mainFile ? mainFile.name : "index.js";

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

      try {
        updateData.sourceHash = generateHash(code);

        let filename = req.body.filename;
        if (!filename) {
          const isTS = /:\s*\w+|interface\s+\w+|type\s+\w+/.test(code);
          filename = isTS ? "index.ts" : "index.js";
        }

        await uploadOriginalCode(functionId, [
          { name: filename, content: code },
        ]);
        const { code: bundledCode, dependencies } = await bundleCode(code);
        updateData.bundleHash = generateHash(bundledCode);

        await uploadBundle(functionId, bundledCode);

        
        if (dependencies && dependencies.length > 0) {
          const packageJson = {
            name: `func-${functionId}`,
            version: "1.0.0",
            dependencies: {},
          };
          if (dependencies.length > 50) {
            return res
              .status(400)
              .json({ message: "Too many dependencies (max 50)" });
          }

          const depNameRegex =
            /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

          dependencies.forEach((dep) => {
            if (!depNameRegex.test(dep)) {
              throw new Error(`Invalid dependency name: ${dep}`);
            }
            packageJson.dependencies[dep] = "latest";
          });

          const packageJsonString = JSON.stringify(packageJson, null, 2);
          await uploadPackageJson(functionId, packageJsonString);

          
          const depHash = computeDependencyHash(packageJson.dependencies);
          updateData.depHash = depHash;
          updateData.status = "deploying";

          
          
          
          const runBackgroundTask = () => {
            ensureDependencyBundle(depHash, packageJsonString)
              .then(async () => {
                await Function.findByIdAndUpdate(req.params.id, {
                  status: "active",
                  deployError: null,
                });
                console.log(
                  `Function ${req.params.id} update completed (active).`
                );
              })
              .catch(async (err) => {
                console.error(`Function ${req.params.id} update failed:`, err);
                await Function.findByIdAndUpdate(req.params.id, {
                  status: "failed",
                  deployError: err.message,
                });
              });
          };

          
          req.backgroundTask = runBackgroundTask;
        } else {
          
          await uploadPackageJson(
            functionId,
            JSON.stringify({ dependencies: {} })
          );
          updateData.depHash = null;
          updateData.status = "active";
          updateData.deployError = null;
        }

        
        await deleteDependencyCache(functionId);

        updateData.version = (await Function.findById(functionId)).version + 1;
      } catch (buildError) {
        console.error("Build/Update failed:", buildError);
        const failedFunc = await Function.findByIdAndUpdate(
          functionId,
          {
            status: "failed",
            deployError: buildError.message,
          },
          { new: true }
        );
        return res.json(failedFunc);
      }
    }

    const functionWithId = await Function.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    
    if (req.backgroundTask) {
      req.backgroundTask();
    }

    res.json(functionWithId);
  } catch (error) {
    console.error("Update function error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const redeployFunction = async (req, res) => {
  try {
    const functionId = req.params.id;
    const func = await Function.findById(functionId);
    if (!func) {
      return res.status(404).json({ message: "Function not found" });
    }

    
    let code = "";
    let filename = "index.js";
    try {
      const files = await readOriginalFiles(functionId);
      const mainFile =
        files.find((f) => f.name === "index.ts") ||
        files.find((f) => f.name === "index.js") ||
        files[0];

      if (mainFile) {
        code = mainFile.content;
        filename = mainFile.name;
      } else {
        return res.status(400).json({
          message: "Source code not found. Please edit and deploy again.",
        });
      }
    } catch (err) {
      console.error("Error reading source for redeploy:", err);
      return res.status(500).json({ message: "Error reading source code." });
    }

    
    handleDeployment(functionId, code, req.user, func.name, filename);

    res.json({ message: "Redeployment started", status: "deploying" });
  } catch (error) {
    console.error("Redeploy error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  functionDeploy,
  getFunctions,
  getFunctionWithId,
  deleteFunction,
  updateFunction,
  redeployFunction,
};
