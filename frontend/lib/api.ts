export type ApiError = {
  code: string;
  message: string;
};

type CreatePixelQrParams = {
  url: string;
  image: File;
  pixelSize: number;
};

export async function createPixelQr({ url, image, pixelSize }: CreatePixelQrParams): Promise<Blob> {
  const formData = new FormData();
  formData.append("url", url);
  formData.append("pixel_size", String(pixelSize));
  formData.append("image", image);

  const response = await fetch("/api/qr-codes", {
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
