import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import os from "os";
import { builtinModules } from "module";

// Node built-ins to ignore
const BUILTINS = new Set(builtinModules);

/**
 * Extract dependencies using esbuild metafile.
 * Robust for JS and TS.
 */
const extractDependencies = async (code, tempDir) => {
  const entryFile = path.join(tempDir, "scan.ts"); // Use .ts to allow TS syntax
  fs.writeFileSync(entryFile, code);

  try {
    const result = await esbuild.build({
      entryPoints: [entryFile],
      bundle: true,
      write: false,
      metafile: true,
      platform: "node",
      target: "node18",
      loader: { ".ts": "ts", ".js": "js" },
      external: ["*"], // Mark everything external to catch imports
    });

    const deps = new Set();
    Object.keys(result.metafile.inputs).forEach((key) => {
      const input = result.metafile.inputs[key];
      input.imports.forEach((imp) => {
        if (imp.external) {
          deps.add(imp.path);
        }
      });
    });

    return [...deps].filter(
      (dep) =>
        !dep.startsWith(".") && !dep.startsWith("/") && !BUILTINS.has(dep)
    );
  } catch (err) {
    console.warn("Dependency extraction failed:", err.message);
    return [];
  } finally {
    if (fs.existsSync(entryFile)) fs.unlinkSync(entryFile);
  }
};

/**
 * Main bundler function
 */
const bundleCode = async (code) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "func-"));

  try {
    // 1. Extract dependencies
    const dependencies = await extractDependencies(code, tempDir);

    // 2. Bundle
    // Detect TS to choose extension for bundling entry
    const isTS = /:\s*\w+|interface\s+\w+|type\s+\w+/.test(code);
    const entryFile = path.join(tempDir, isTS ? "index.ts" : "index.js");
    fs.writeFileSync(entryFile, code);

    const result = await esbuild.build({
      entryPoints: [entryFile],
      bundle: true,
      platform: "node",
      target: "node18",
      format: "cjs",
      minify: true,
      write: false,
      external: dependencies, // only external deps here
      loader: {
        ".ts": "ts",
        ".js": "js",
      },
    });

    return {
      code: result.outputFiles[0].text,
      dependencies,
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

export default bundleCode;
