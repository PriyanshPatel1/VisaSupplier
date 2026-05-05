import { v2 as cloudinary } from "cloudinary";

type CloudinaryUploadOptions = {
  folder?: string;
  resource_type?: "image" | "raw" | "auto";
  public_id?: string;
  overwrite?: boolean;
  transformation?: Record<string, unknown>[];
};

function parseCloudinaryUrl(value: string | undefined) {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    return {
      cloudName: parsed.hostname || undefined,
      apiKey: parsed.username || undefined,
      apiSecret: parsed.password || undefined,
    };
  } catch {
    return null;
  }
}

function getCloudinaryConfig() {
  const parsedUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

  return {
    cloudName:
      parsedUrl?.cloudName ??
      process.env.CLOUDINARY_CLOUD_NAME ??
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: parsedUrl?.apiKey ?? process.env.CLOUDINARY_API_KEY,
    apiSecret: parsedUrl?.apiSecret ?? process.env.CLOUDINARY_API_SECRET,
    uploadPreset:
      process.env.CLOUDINARY_UPLOAD_PRESET ??
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  };
}

function getCloudinary() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing signed Cloudinary env vars: CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME), CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return cloudinary;
}

function canUseSignedCloudinaryUpload() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return Boolean(cloudName && apiKey && apiSecret);
}

function canUseUnsignedCloudinaryUpload() {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  return Boolean(cloudName && uploadPreset);
}

function isRetryableSignedUploadError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("invalid signature") ||
    message.includes("api key") ||
    message.includes("api secret") ||
    message.includes("authentication") ||
    message.includes("authorization") ||
    message.includes("cloudinary")
  );
}

function serializeTransformation(
  transformations: Record<string, unknown>[]
): string {
  const keyMap: Record<string, string> = {
    width: "w",
    height: "h",
    crop: "c",
    quality: "q",
    fetch_format: "f",
  };

  return transformations
    .map((item) =>
      Object.entries(item)
        .map(([key, value]) => `${keyMap[key] ?? key}_${String(value)}`)
        .join(",")
    )
    .join("/");
}

async function uploadToCloudinaryUnsigned(
  file: Buffer | string,
  options: CloudinaryUploadOptions = {}
): Promise<{ url: string; publicId: string; format: string; bytes: number }> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing unsigned Cloudinary env vars: CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME), CLOUDINARY_UPLOAD_PRESET (or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)"
    );
  }

  const formData = new FormData();
  const resourceType = options.resource_type ?? "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  if (typeof file === "string") {
    formData.append("file", file);
  } else {
    formData.append("file", new Blob([new Uint8Array(file)]));
  }

  formData.append("upload_preset", uploadPreset);
  if (options.folder) formData.append("folder", options.folder);
  if (options.public_id) formData.append("public_id", options.public_id);
  if (options.overwrite !== undefined) {
    formData.append("overwrite", String(options.overwrite));
  }
  if (options.transformation?.length) {
    formData.append(
      "transformation",
      serializeTransformation(options.transformation)
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        secure_url?: string;
        public_id?: string;
        format?: string;
        bytes?: number;
        error?: { message?: string };
      }
    | null;

  if (!response.ok || !payload?.secure_url || !payload.public_id) {
    const errorMessage =
      payload?.error?.message ?? "Unsigned Cloudinary upload failed";

    if (/upload preset not found/i.test(errorMessage)) {
      throw new Error(
        "Cloudinary upload preset is invalid or missing for avatar uploads."
      );
    }

    throw new Error(
      errorMessage
    );
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
    format: payload.format ?? "",
    bytes: payload.bytes ?? 0,
  };
}

export { cloudinary };

export async function uploadToCloudinary(
  file: Buffer | string,
  options: CloudinaryUploadOptions & { allowUnsignedFallback?: boolean } = {}
): Promise<{ url: string; publicId: string; format: string; bytes: number }> {
  const canFallback =
    options.allowUnsignedFallback && canUseUnsignedCloudinaryUpload();

  if (!canUseSignedCloudinaryUpload()) {
    if (canFallback) {
      return uploadToCloudinaryUnsigned(file, options);
    }

    throw new Error("Cloudinary is not fully configured for signed uploads.");
  }

  try {
    const client = getCloudinary();

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      const uploadStream = client.uploader.upload_stream(
        {
          folder: options.folder ?? "visahub",
          resource_type: options.resource_type ?? "auto",
          public_id: options.public_id,
          overwrite: options.overwrite ?? false,
          transformation: options.transformation,
        },
        (err, uploadResult) => {
          if (err || !uploadResult) reject(err ?? new Error("Upload failed"));
          else resolve(uploadResult as typeof uploadResult);
        }
      );

      if (typeof file === "string") {
        const base64Data = file.replace(/^data:[^;]+;base64,/, "");
        uploadStream.end(Buffer.from(base64Data, "base64"));
      } else {
        uploadStream.end(file);
      }
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    if (canFallback && isRetryableSignedUploadError(error)) {
      return uploadToCloudinaryUnsigned(file, options);
    }
    throw error;
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const client = getCloudinary();
  await client.uploader.destroy(publicId);
}
