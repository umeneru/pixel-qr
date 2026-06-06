export type ApiError = {
  code: string;
  message: string;
};

type CreatePixelQrParams = {
  url: string;
  image: File;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9000";

export async function createPixelQr({ url, image }: CreatePixelQrParams): Promise<Blob> {
  const formData = new FormData();
  formData.append("url", url);
  formData.append("image", image);

  const response = await fetch(`${API_BASE_URL}/qr-codes`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.blob();
}

async function parseApiError(response: Response): Promise<ApiError> {
  try {
    return (await response.json()) as ApiError;
  } catch {
    return {
      code: "request_failed",
      message: "QR コードの生成に失敗しました",
    };
  }
}
