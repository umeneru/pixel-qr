export function validateClientInputs(url: string, image: File | null): string[] {
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
