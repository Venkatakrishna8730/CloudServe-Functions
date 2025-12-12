import "../utils/env.js";
import * as Minio from "minio";

const minioConfig = {
  endPoint: (process.env.MINIO_ENDPOINT || "localhost").trim(),
  port: parseInt((process.env.MINIO_PORT || "9000").toString().trim()),
  useSSL: (process.env.MINIO_USE_SSL || "false").trim() === "true",
  accessKey: (process.env.MINIO_ACCESS_KEY || "").trim(),
  secretKey: (process.env.MINIO_SECRET_KEY || "").trim(),
};

console.log("MinIO Configuration:", {
  ...minioConfig,
  accessKey: "***",
  secretKey: "***",
});

const minioClient = new Minio.Client(minioConfig);

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "functions";

export const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
      console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' already exists.`);
    }
  } catch (error) {
    console.error("Error initializing MinIO:", error);
    throw error;
  }
};

export const uploadOriginalCode = async (functionId, files) => {
  // files is an array of { path: string, content: string | Buffer }
  // or an object with file paths as keys and content as values?
  // Let's assume files is an array of objects for flexibility: { name: "index.js", content: "..." }
  // The path in MinIO will be: functions/<functionId>/src/<fileName>

  const uploads = files.map((file) => {
    const objectName = `${functionId}/src/${file.name}`;
    return minioClient.putObject(BUCKET_NAME, objectName, file.content);
  });

  await Promise.all(uploads);
  return `${functionId}/src/`;
};

export const uploadBundle = async (functionId, bundleBuffer) => {
  const objectName = `${functionId}/bundle/bundle.js`;
  await minioClient.putObject(BUCKET_NAME, objectName, bundleBuffer);
  return objectName;
};

export const uploadPackageJson = async (functionId, content) => {
  const objectName = `${functionId}/package.json`;
  await minioClient.putObject(BUCKET_NAME, objectName, content);
  return objectName;
};

export const readOriginalFiles = async (functionId) => {
  const prefix = `${functionId}/src/`;
  const stream = minioClient.listObjects(BUCKET_NAME, prefix, true);
  const files = [];

  for await (const obj of stream) {
    const stream = await minioClient.getObject(BUCKET_NAME, obj.name);
    const content = await streamToString(stream);
    // Extract relative filename from object name
    const name = obj.name.replace(prefix, "");
    files.push({ name, content });
  }

  return files;
};

export const readBundle = async (functionId) => {
  const objectName = `${functionId}/bundle/bundle.js`;
  console.log("📦 Trying to read:", objectName);
  const stream = await minioClient.getObject(BUCKET_NAME, objectName);
  return streamToString(stream);
};

export const readPackageJson = async (functionId) => {
  const objectName = `${functionId}/package.json`;
  try {
    const stream = await minioClient.getObject(BUCKET_NAME, objectName);
    return await streamToString(stream);
  } catch (error) {
    if (error.code === "NoSuchKey") {
      return null;
    }
    throw error;
  }
};

// Helper to convert stream to string
const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", (err) => reject(err));
  });
};

export const deleteFunctionFolder = async (functionId) => {
  const prefix = `${functionId}/`;
  const stream = minioClient.listObjects(BUCKET_NAME, prefix, true);
  const objectsList = [];

  for await (const obj of stream) {
    objectsList.push(obj.name);
  }

  if (objectsList.length > 0) {
    await minioClient.removeObjects(BUCKET_NAME, objectsList);
  }
};

// Dependency Cache Methods
export const uploadDependencyCache = async (functionId, cacheBuffer) => {
  const objectName = `${functionId}/cache/node_modules.tar.gz`;
  await minioClient.putObject(BUCKET_NAME, objectName, cacheBuffer);
  return objectName;
};

export const readDependencyCache = async (functionId) => {
  const objectName = `${functionId}/cache/node_modules.tar.gz`;
  try {
    const stream = await minioClient.getObject(BUCKET_NAME, objectName);
    return stream; // Return stream for piping
  } catch (error) {
    if (error.code === "NoSuchKey") {
      return null;
    }
    throw error;
  }
};

export const deleteDependencyCache = async (functionId) => {
  const objectName = `${functionId}/cache/node_modules.tar.gz`;
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName);
  } catch (error) {
    // Ignore if not found
    console.warn(`Failed to delete cache for ${functionId}:`, error.message);
  }
};

export default {
  initMinio,
  uploadOriginalCode,
  uploadBundle,
  uploadPackageJson,
  readOriginalFiles,
  readBundle,
  readPackageJson,
  deleteFunctionFolder,
  uploadDependencyCache,
  readDependencyCache,
  deleteDependencyCache,
};
