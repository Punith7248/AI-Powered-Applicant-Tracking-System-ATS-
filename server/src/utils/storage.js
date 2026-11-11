import fs from "fs/promises";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const configured = process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET;
const s3 = configured ? new S3Client({ region: process.env.AWS_REGION }) : null;

export async function persistUpload(file) {
  if (!configured) return { storage: "local", key: file.filename };
  const key = `${Date.now()}-${file.filename}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET, Key: key,
    Body: await fs.readFile(file.path), ContentType: file.mimetype
  }));
  await fs.unlink(file.path).catch(() => {});
  return { storage: "s3", key };
}
export async function getStoredFile(key, storage) {
  if (storage !== "s3") return { path: `uploads/${key}` };
  const result = await s3.send(new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
  const chunks = [];
  for await (const chunk of result.Body) chunks.push(chunk);
  return { buffer: Buffer.concat(chunks), contentType: result.ContentType };
}
