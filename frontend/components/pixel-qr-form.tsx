"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  createPixelImagePreviewUrl,
  createPixelQrInBrowser,
  type BrowserQrError,
  type TransparencyMode,
} from "@/lib/browser-qr";
import { downloadBlob } from "@/lib/download";
import { validateClientInputs } from "@/lib/validation";
import { QrPreview } from "@/components/qr-preview";

const transparencyOptions: Array<{ value: TransparencyMode; label: string }> = [
  { value: "preserve", label: "透過" },
  { value: "white", label: "白背景" },
];

type SelectedImage = {
  file: File;
  previewUrl: string;
};

export function PixelQrForm() {
  const [url, setUrl] = useState("");
  const [pixelSize, setPixelSize] = useState(32);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [inputErrors, setInputErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<BrowserQrError | null>(null);
  const [qrBlob, setQrBlob] = useState<Blob | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [resizedPreviewUrl, setResizedPreviewUrl] = useState<string | null>(null);
  const [transparencyMode, setTransparencyMode] = useState<TransparencyMode>("preserve");
  const [downloadFilename, setDownloadFilename] = useState("pixel-qr.png");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pixelSizeIsValid = Number.isInteger(pixelSize) && pixelSize >= 12 && pixelSize <= 32;

  useEffect(() => {
    if (!qrBlob) {
      setQrPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(qrBlob);
    setQrPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [qrBlob]);

  useEffect(() => {
    let ignore = false;

    if (!selectedImage || !pixelSizeIsValid) {
      setResizedPreviewUrl(null);
      return;
    }

    createPixelImagePreviewUrl({
      image: selectedImage.file,
      pixelSize,
      transparencyMode,
    })
      .then((previewUrl) => {
        if (!ignore) {
          setResizedPreviewUrl(previewUrl);
        }
      })
      .catch(() => {
        if (!ignore) {
          setResizedPreviewUrl(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [pixelSize, pixelSizeIsValid, selectedImage, transparencyMode]);

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
    };
  }, [selectedImage]);

  const imageSummary = useMemo(() => {
    if (!selectedImage) {
      return "ここにドラッグ＆ドロップ";
    }
    return selectedImage.file.name + " / " + (selectedImage.file.size / 1024).toFixed(1) + " KB";
  }, [selectedImage]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setQrBlob(null);
    setApiError(null);

    setSelectedImage((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous.previewUrl);
      }

      if (!file) {
        return null;
      }

      return {
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });
  }

  function handleImageClear() {
    setSelectedImage((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      return null;
    });
    setQrBlob(null);
    setApiError(null);
    setInputErrors([]);
    setResizedPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function generateQr(mode: TransparencyMode) {
    if (!selectedImage) {
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await createPixelQrInBrowser({
        url,
        image: selectedImage.file,
        pixelSize,
        transparencyMode: mode,
      });
      setDownloadFilename(createUniquePngFilename());
      setQrBlob(blob);
    } catch (error) {
      setApiError(error as BrowserQrError);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleTransparencyModeChange(mode: TransparencyMode) {
    if (mode === transparencyMode) {
      return;
    }

    const shouldRegenerate = Boolean(qrBlob && selectedImage && pixelSizeIsValid);
    setTransparencyMode(mode);
    setApiError(null);

    if (shouldRegenerate) {
      await generateQr(mode);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    setQrBlob(null);

    const errors = validateClientInputs(url, selectedImage?.file ?? null, pixelSize);
    setInputErrors(errors);
    if (errors.length > 0 || !selectedImage) {
      return;
    }

    await generateQr(transparencyMode);
  }

  function handleDownload() {
    if (qrBlob) {
      downloadBlob(qrBlob, downloadFilename);
    }
  }

  return (
    <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(360px,0.83fr)_minmax(440px,1.17fr)]">
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-col gap-4 rounded-lg bg-white p-5 shadow-[0_10px_30px_rgba(74,85,130,0.07)]"
      >
        <div className="space-y-3 border-b border-[#e7e9f2] pb-5">
          <label htmlFor="url" className="flex items-center gap-2 text-xl font-black text-[#5948dd]">
            1. URLを入力
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setQrBlob(null);
            }}
            placeholder="https://example.com"
            className="min-h-12 w-full rounded-md border border-[#d7dbe8] bg-white px-4 text-base text-[#171827] shadow-inner outline-none transition focus:border-[#6655f1] focus:ring-4 focus:ring-[#6655f1]/15"
          />
          <p className="text-sm font-semibold leading-6 text-[#70778d]">
            http:// または https:// から始まるURLを入力してください
          </p>
        </div>

        <div className="space-y-4 border-b border-[#e7e9f2] pb-5">
          <h2 className="flex items-center gap-2 text-xl font-black text-[#5948dd]">
            2. ドット絵画像をアップロード
          </h2>

          <div className="grid gap-5 md:grid-cols-[1fr_200px] md:items-start">
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/png"
              onChange={handleImageChange}
              className="sr-only"
            />

            {selectedImage ? (
              <div className="relative min-h-[152px] overflow-hidden rounded-md border border-[#d7dbe8] bg-[linear-gradient(45deg,#f1f3f8_25%,transparent_25%),linear-gradient(-45deg,#f1f3f8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f3f8_75%),linear-gradient(-45deg,transparent_75%,#f1f3f8_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]">
                <button
                  type="button"
                  onClick={handleImageClear}
                  aria-label="選択した画像を削除"
                  className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-full border border-[#d3d8e6] bg-white pl-0.5 text-[#4f566b] shadow-[0_4px_12px_rgba(31,36,67,0.14)] transition hover:border-[#6655f1] hover:text-[#5948dd]"
                >
                  <span aria-hidden="true"> ×</span>
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedImage.previewUrl} alt="選択したPNG画像" className="h-[152px] w-full object-contain p-4" />
                <p className="border-t border-[#dfe3ee] bg-white/90 px-3 py-2 text-sm font-semibold text-[#666d84]">
                  {imageSummary}
                </p>
              </div>
            ) : (
              <label
                htmlFor="image"
                className="grid min-h-[152px] cursor-pointer place-items-center rounded-md border border-dashed border-[#8d7dff] bg-[#fbfaff] px-6 py-5 text-center transition hover:border-[#5f4df2] hover:bg-[#f6f3ff]"
              >
                <span className="flex flex-col items-center gap-2">
                  <span className="text-lg font-black text-[#5a49df]">PNG画像を選択</span>
                  <span className="text-sm font-semibold text-[#666d84]">{imageSummary}</span>
                  <span className="mt-1 grid size-10 place-items-center text-4xl text-[#6554ef]" aria-hidden="true">
                    ◰
                  </span>
                  <span className="rounded-md bg-[#6250e8] px-5 py-2 text-sm font-black text-white shadow-[0_8px_18px_rgba(98,80,232,0.24)]">
                    ファイルを選択
                  </span>
                </span>
              </label>
            )}

            <div className="space-y-2">
              <label htmlFor="pixel-size" className="block text-sm font-black text-[#62687b]">
                一辺のピクセル数
              </label>
              <input
                id="pixel-size"
                type="number"
                min={12}
                max={32}
                step={1}
                value={Number.isNaN(pixelSize) ? "" : pixelSize}
                onChange={(event) => {
                  setPixelSize(event.target.valueAsNumber);
                  setQrBlob(null);
                }}
                className="min-h-12 w-full rounded-md border border-[#d7dbe8] bg-white px-4 text-base text-[#171827] outline-none transition focus:border-[#6655f1] focus:ring-4 focus:ring-[#6655f1]/15"
              />
              <p className="text-sm font-semibold leading-6 text-[#70778d]">12 〜 32 の整数</p>
              <p className={pixelSizeIsValid ? "text-sm font-black text-[#18a957]" : "text-sm font-black text-[#d24545]"}>
                {pixelSizeIsValid ? "◎ 有効な値です" : "12〜32の整数を入力してください"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-b border-[#e7e9f2] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black text-[#62687b]">リサイズ後のプレビュー</p>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe3ee] bg-white p-0.5 text-xs font-black text-[#62687b]">
              <span className="pl-2">透過部分</span>
              <div className="inline-grid grid-cols-2">
                {transparencyOptions.map((option) => {
                  const isActive = transparencyMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleTransparencyModeChange(option.value)}
                      className={
                        "min-h-7 rounded-full px-3 text-xs font-black transition " +
                        (isActive ? "bg-[#624de7] text-white" : "text-[#71778b] hover:text-[#5948dd]")
                      }
                      aria-pressed={isActive}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="grid aspect-square w-full max-w-80 place-items-center rounded-md border border-[#edf0f6] bg-[linear-gradient(45deg,#eef1f7_25%,transparent_25%),linear-gradient(-45deg,#eef1f7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eef1f7_75%),linear-gradient(-45deg,transparent_75%,#eef1f7_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] shadow-sm">
            {resizedPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resizedPreviewUrl} alt="正方形に切り取ってリサイズした画像" className="pixelated h-full w-full object-contain" />
            ) : (
              <span className="text-sm font-black text-[#9aa1b5]">PNG</span>
            )}
          </div>
        </div>


        <button
          type="submit"
          disabled={isGenerating}
          className="mt-auto min-h-16 rounded-md bg-[#624de7] px-5 text-xl font-black text-white shadow-[0_12px_25px_rgba(98,77,231,0.24)] transition hover:bg-[#5140d4] disabled:cursor-not-allowed disabled:bg-[#b8bdd0]"
        >
          3. QRコードを生成
        </button>
      </form>

      <QrPreview
        previewUrl={qrPreviewUrl}
        isGenerating={isGenerating}
        inputErrors={inputErrors}
        apiError={apiError}
        onDownload={handleDownload}
      />
    </section>
  );
}

function createUniquePngFilename() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const randomId = Math.random().toString(36).slice(2, 8);
  return "pixel-qr-" + timestamp + "-" + randomId + ".png";
}
