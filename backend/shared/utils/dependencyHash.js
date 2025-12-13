import crypto from "crypto";

export const computeDependencyHash = (dependencies) => {
  const nodeVersion = process.env.NODE_MAJOR || "18";
  const installer = process.env.INSTALLER_IDENT || "npm@auto";
  const arch = process.env.ARCH || "linux-x64";

  let canonical = `NODE=${nodeVersion}|ARCH=${arch}|INSTALLER=${installer}|`;

  
  const deps = dependencies || {};

  const keys = Object.keys(deps).sort();
  const kv = keys.map((k) => `${k}@${deps[k]}`).join("|");
  canonical += `DEPS=${kv}`;

  return crypto.createHash("sha256").update(canonical).digest("hex");
};
