import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { getOwnerUser } from '@/lib/auth/require-owner';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_TYPES = {
  // Videos (up to 50 MB)
  'video/mp4': { folder: 'videos', ext: 'mp4', maxBytes: 50 * 1024 * 1024 },
  'video/webm': { folder: 'videos', ext: 'webm', maxBytes: 50 * 1024 * 1024 },
  'video/quicktime': { folder: 'videos', ext: 'mov', maxBytes: 50 * 1024 * 1024 },
  // Images (up to 10 MB)
  'image/jpeg': { folder: 'images', ext: 'jpg', maxBytes: 10 * 1024 * 1024 },
  'image/png': { folder: 'images', ext: 'png', maxBytes: 10 * 1024 * 1024 },
  'image/webp': { folder: 'images', ext: 'webp', maxBytes: 10 * 1024 * 1024 },
  'image/avif': { folder: 'images', ext: 'avif', maxBytes: 10 * 1024 * 1024 },
};

export async function POST(request) {
  try {
    // 1. Verify authenticated owner session
    const owner = await getOwnerUser();
    if (!owner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ensure AWS env vars are configured
    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    if (!bucket || !region || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Storage configuration missing on server.' },
        { status: 500 }
      );
    }

    // 3. Parse & validate payload
    const body = await request.json().catch(() => null);
    const contentType = body?.contentType;
    const fileSize = Number(body?.fileSize);

    const rule = ALLOWED_TYPES[contentType];
    if (!rule) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: MP4, WebM, MOV, JPG, PNG, WebP, AVIF.' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > rule.maxBytes) {
      const maxMb = Math.round(rule.maxBytes / (1024 * 1024));
      return NextResponse.json(
        { error: `File size must be between 1 byte and ${maxMb} MB.` },
        { status: 400 }
      );
    }

    // 4. Server-controlled S3 key under fixed prefix
    const key = `${rule.folder}/${randomUUID()}.${rule.ext}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
      signableHeaders: new Set(['content-type']),
    });

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate upload URL.' },
      { status: 500 }
    );
  }
}
