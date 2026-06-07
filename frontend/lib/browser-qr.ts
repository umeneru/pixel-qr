import QRCode from "qrcode";

const MIN_READABLE_MODULE_PIXEL_SIZE = 4;
const MAX_EMBEDDED_MODULE_RATIO = 0.4;
const MAX_QR_VERSION = 40;
const QR_BASE_MODULES = 21;
const QR_MODULES_PER_VERSION = 4;
const QR_BORDER_MODULES = 4;
const PREVIEW_SCALE = 20;

export type TransparencyMode = "preserve" | "white";

type BrowserQrParams = {
  url: string;
  image: File;
  pixelSize: number;
  transparencyMode: TransparencyMode;
};

type PixelImageParams = {
  image: File;
  pixelSize: number;
  transparencyMode: TransparencyMode;
};

export type BrowserQrError = {
  code: string;
  message: string;
};

export async function createPixelQrInBrowser({
  url,
  image,
  pixelSize,
  transparencyMode,
}: BrowserQrParams): Promise<Blob> {
  try {
    const pixelImage = await createPixelImageCanvas({ image, pixelSize, transparencyMode });
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

export async function createPixelImagePreviewUrl(params: PixelImageParams): Promise<string> {
  const pixelCanvas = await createPixelImageCanvas(params);
  const previewCanvas = document.createElement("canvas");
  previewCanvas.width = params.pixelSize * PREVIEW_SCALE;
  previewCanvas.height = params.pixelSize * PREVIEW_SCALE;

  const context = previewCanvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available");
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(pixelCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

  return previewCanvas.toDataURL("image/png");
}

async function createPixelImageCanvas({
  image,
  pixelSize,
  transparencyMode,
}: PixelImageParams): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(image);
  const canvas = document.createElement("canvas");
  canvas.width = pixelSize;
  canvas.height = pixelSize;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Canvas is not available");
  }

  context.imageSmoothingEnabled = false;

  if (transparencyMode === "white") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pixelSize, pixelSize);
  } else {
    context.clearRect(0, 0, pixelSize, pixelSize);
  }

  const sourceSize = Math.min(bitmap.width, bitmap.height);
  const sourceX = Math.floor((bitmap.width - sourceSize) / 2);
  const sourceY = Math.floor((bitmap.height - sourceSize) / 2);

  context.drawImage(bitmap, sourceX, sourceY, sourceSize, sourceSize, 0, 0, pixelSize, pixelSize);
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
      message: "QR コードの生成に失敗しました: " + error.message,
    };
  }

  return {
    code: "qr_generation_failed",
    message: "QR コードの生成に失敗しました",
  };
}
