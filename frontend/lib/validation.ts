const MIN_PIXEL_SIZE = 12;
const MAX_PIXEL_SIZE = 32;

export function validateClientInputs(url: string, image: File | null, pixelSize: number): string[] {
  const errors: string[] = [];
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    errors.push("URL を入力してください");
  } else if (!isHttpUrl(trimmedUrl)) {
    errors.push("URL は http:// または https:// から始まる形式で入力してください");
  }

  if (!image) {
    errors.push("PNG 画像を選択してください");
  } else if (image.type !== "image/png") {
    errors.push("PNG 画像のみ対応しています");
  } else if (image.size > 1024 * 1024) {
    errors.push("画像サイズは 1MB 以下にしてください");
  }

  if (!Number.isInteger(pixelSize) || pixelSize < MIN_PIXEL_SIZE || pixelSize > MAX_PIXEL_SIZE) {
    errors.push(`一辺のピクセル数は ${MIN_PIXEL_SIZE}〜${MAX_PIXEL_SIZE} の整数で入力してください`);
  }

  return errors;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
