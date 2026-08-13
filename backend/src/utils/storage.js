/**
 * Avatar storage adapter.
 *
 * Render's FREE web services have no persistent disk — every deploy or
 * idle-timeout restart wipes anything written to the local filesystem,
 * silently deleting everyone's profile photos. To fix that without forcing
 * a specific vendor, this module writes to S3-compatible object storage
 * (Cloudflare R2, Backblaze B2, AWS S3, etc.) whenever S3_* env vars are
 * configured, and transparently falls back to local disk otherwise so
 * local development keeps working with zero setup.
 *
 * To enable object storage, set in your environment (see .env.example):
 *   S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY,
 *   S3_REGION (optional, defaults to "auto"), S3_PUBLIC_URL (the base URL
 *   your bucket is served from, e.g. a R2 public bucket URL or CDN domain).
 */
const fs = require("fs");
const path = require("path");

const AVATAR_DIR = path.join(__dirname, "..", "..", "uploads", "avatars");
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const s3Configured = !!(
  process.env.S3_ENDPOINT && process.env.S3_BUCKET &&
  process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
);

let s3Client = null;
function getClient() {
  if (!s3Client) {
    const { S3Client } = require("@aws-sdk/client-s3");
    s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || "auto",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false"
    });
  }
  return s3Client;
}

if (!s3Configured && process.env.NODE_ENV === "production") {
  console.warn(
    "[storage] No S3_* env vars set — avatars will be written to local disk, " +
    "which Render's free plan does NOT persist across deploys/restarts. " +
    "Configure object storage (see backend/.env.example) before going live."
  );
}

/**
 * Saves an avatar file and returns its public-facing path/URL.
 * @param {Buffer} buffer - the validated image bytes
 * @param {string} filename - unique filename, e.g. `${userId}_${uuid}.jpg`
 * @param {string} mimetype
 */
async function saveAvatar(buffer, filename, mimetype) {
  if (s3Configured) {
    const { PutObjectCommand } = require("@aws-sdk/client-s3");
    const key = `avatars/${filename}`;
    await getClient().send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      CacheControl: "public, max-age=31536000, immutable"
    }));
    const base = (process.env.S3_PUBLIC_URL || "").replace(/\/$/, "");
    return `${base}/${key}`;
  }
  const filePath = path.join(AVATAR_DIR, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/avatars/${filename}`;
}

/** Deletes a previously-saved avatar, given the value stored in users.avatar. Best-effort. */
async function deleteAvatar(publicPathOrUrl) {
  if (!publicPathOrUrl) return;
  try {
    if (s3Configured && process.env.S3_PUBLIC_URL && publicPathOrUrl.startsWith(process.env.S3_PUBLIC_URL)) {
      const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
      const key = publicPathOrUrl.slice(process.env.S3_PUBLIC_URL.replace(/\/$/, "").length + 1);
      await getClient().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    } else if (publicPathOrUrl.startsWith("/uploads/avatars/")) {
      await fs.promises.unlink(path.join(AVATAR_DIR, path.basename(publicPathOrUrl))).catch(() => {});
    }
  } catch (err) {
    console.error("[storage] Failed to delete old avatar:", err.message);
  }
}

module.exports = { saveAvatar, deleteAvatar, s3Configured, AVATAR_DIR };
