import "../utils/env.js";
import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: (process.env.MINIO_ENDPOINT || "localhost").trim(),
  port: parseInt((process.env.MINIO_PORT || "9000").toString().trim()),
  useSSL: (process.env.MINIO_USE_SSL || "false").trim() === "true",
  accessKey: (process.env.MINIO_ACCESS_KEY || "").trim(),
  secretKey: (process.env.MINIO_SECRET_KEY || "").trim(),
});

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
  const stream = await minioClient.getObject(BUCKET_NAME, objectName);
  return streamToString(stream);
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

export default {
  initMinio,
  uploadOriginalCode,
  uploadBundle,
  readOriginalFiles,
  readBundle,
  deleteFunctionFolder,
};
