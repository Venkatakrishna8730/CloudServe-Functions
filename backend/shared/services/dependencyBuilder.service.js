import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

export const buildDependencyBundle = async (packageJsonContent) => {
  
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dep-build-"));

  try {
    
    fs.writeFileSync(path.join(tempDir, "package.json"), packageJsonContent);

    
    console.log("Installing dependencies in", tempDir);
    execSync("npm install --production --ignore-scripts", {
      cwd: tempDir,
      stdio: "ignore", 
    });

    
    console.log("Creating dependency bundle...");
    const tarPath = path.join(tempDir, "node_modules.tar.gz");
    execSync("tar -czf node_modules.tar.gz node_modules", {
      cwd: tempDir,
    });

    
    const bundleBuffer = fs.readFileSync(tarPath);
    return bundleBuffer;
  } catch (error) {
    console.error("Dependency build failed:", error);
    throw error;
  } finally {
    
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("Failed to cleanup temp dir:", e.message);
    }
  }
};
