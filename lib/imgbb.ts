interface ImgBBResponse {
  success?: boolean;
  data?: {
    url?: string;
    display_url?: string;
  };
  error?: {
    message?: string;
  };
}

export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) throw new Error("ImgBB is not configured. Add NEXT_PUBLIC_IMGBB_API_KEY to grantpilot-client/.env.local.");

  if (!file.type.startsWith("image/")) throw new Error("Please select a valid image file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Image must be 10 MB or smaller.");

  const body = new FormData();
  body.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    body
  });
  const payload = (await response.json().catch(() => ({}))) as ImgBBResponse;
  const imageUrl = payload.data?.display_url ?? payload.data?.url;
  if (!response.ok || !payload.success || !imageUrl) {
    throw new Error(payload.error?.message ?? "Image upload failed.");
  }
  return imageUrl;
}
