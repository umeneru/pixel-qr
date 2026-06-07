import QRCode from "qrcode";

const MIN_READABLE_MODULE_PIXEL_SIZE = 4;
const MAX_EMBEDDED_MODULE_RATIO = 0.4;
const MAX_QR_VERSION = 40;
const QR_BASE_MODULES = 21;
const QR_MODULES_PER_VERSION = 4;
const QR_BORDER_MODULES = 4;

type BrowserQrParams = {
  url: string;
  image: File;
  pixelSize: number;
};

export type BrowserQrError = {
  code: string;
  message: string;
};

export async function createPixelQrInBrowser({
  url,
  image,
  pixelSize,
}: BrowserQrParams): Promise<Blob> {
  try {
    const pixelImage = await loadPixelImage(image, pixelSize);
    const qr = QRCode.create(url.trim(), {
      version: minimumSafeQrVersion(pixelSize),
      errorCorrectionLevel: "H",
    });

    const modulePixelSize = MIN_READABLE_MODULE_PIXEL_SIZE;
    const totalModules = qr.modules.size + QR_BORDER_MODULES * 2;
    const canvas = document.createElement("canvas");
    canvas.width = totalModules * modulePixelSize;
    canvas.height = totalModules * modulePixelSize;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available");
    }

    context.imageSmoothingEnabled = false;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000000";

    for (let row = 0; row < qr.modules.size; row += 1) {
      for (let col = 0; col < qr.modules.size; col += 1) {
        if (qr.modules.get(row, col)) {
          context.fillRect(
            (col + QR_BORDER_MODULES) * modulePixelSize,
            (row + QR_BORDER_MODULES) * modulePixelSize,
            modulePixelSize,
            modulePixelSize,
          );
        }
      }
    }

    const embeddedModules = embeddedModuleSize(qr.modules.size, pixelSize);
    const embeddedSize = embeddedModules * modulePixelSize;
    const embeddedPosition = Math.floor((totalModules - embeddedModules) / 2) * modulePixelSize;
    context.drawImage(pixelImage, embeddedPosition, embeddedPosition, embeddedSize, embeddedSize);

    return await canvasToPngBlob(canvas);
  } catch (error) {
    throw toBrowserQrError(error);
  }
}

async function loadPixelImage(file: File, pixelSize: number): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = pixelSize;
  canvas.height = pixelSize;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Canvas is not available");
  }

  context.imageSmoothingEnabled = false;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, pixelSize, pixelSize);
  context.drawImage(bitmap, 0, 0, pixelSize, pixelSize);
  bitmap.close();

  return canvas;
}

function minimumSafeQrVersion(pixelSize: number): number {
  const minModules = Math.ceil(pixelSize / MAX_EMBEDDED_MODULE_RATIO);
  const version = Math.ceil((minModules - QR_BASE_MODULES) / QR_MODULES_PER_VERSION) + 1;
  return Math.min(MAX_QR_VERSION, Math.max(1, version));
}

function embeddedModuleSize(qrModules: number, pixelSize: number): number {
  const maxSideModules = Math.max(1, Math.floor(qrModules * MAX_EMBEDDED_MODULE_RATIO));
  const scale = Math.min(1, maxSideModules / pixelSize);
  return Math.max(1, Math.floor(pixelSize * scale));
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("PNG export failed"));
    }, "image/png");
  });
}

function toBrowserQrError(error: unknown): BrowserQrError {
  if (error instanceof Error) {
    return {
      code: "qr_generation_failed",
      message: `QR コードの生成に失敗しました: ${error.message}`,
    };
  }

  return {
    code: "qr_generation_failed",
    message: "QR コードの生成に失敗しました",
  };
}
