"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

import { createPixelQr, type ApiError } from "@/lib/api";
import { downloadBlob } from "@/lib/download";
import { validateClientInputs } from "@/lib/validation";
import { QrPreview } from "@/components/qr-preview";

type SelectedImage = {
  file: File;
  previewUrl: string;
};

export function PixelQrForm() {
  const [url, setUrl] = useState("");
  const [pixelSize, setPixelSize] = useState(32);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [inputErrors, setInputErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [qrBlob, setQrBlob] = useState<Blob | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
    };
  }, [selectedImage]);

  const imageSummary = useMemo(() => {
    if (!selectedImage) {
      return "PNG 画像が未選択です";
    }
    return `${selectedImage.file.name} / ${(selectedImage.file.size / 1024).toFixed(1)} KB`;
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    setQrBlob(null);

    const errors = validateClientInputs(url, selectedImage?.file ?? null, pixelSize);
    setInputErrors(errors);
    if (errors.length > 0 || !selectedImage) {
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await createPixelQr({ url, image: selectedImage.file, pixelSize });
      setQrBlob(blob);
    } catch (error) {
      setApiError(error as ApiError);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload() {
    if (qrBlob) {
      downloadBlob(qrBlob, "pixel-qr.png");
    }
  }

  return (
    <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,1fr)]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 border border-[#d7cfc1] bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="url" className="text-sm font-semibold text-[#2b2925]">
            URL
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
            className="min-h-12 border border-[#bfb5a6] px-3 outline-none transition focus:border-[#2d6a63] focus:ring-2 focus:ring-[#2d6a63]/20"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="image" className="text-sm font-semibold text-[#2b2925]">
            ドット絵 PNG
          </label>
          <input
            id="image"
            type="file"
            accept="image/png"
            onChange={handleImageChange}
            className="block w-full cursor-pointer border border-dashed border-[#bfb5a6] bg-[#fbfaf7] p-4 text-sm file:mr-4 file:border-0 file:bg-[#2d6a63] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <div className="grid gap-3 sm:grid-cols-[96px_1fr] sm:items-center">
            <div className="grid aspect-square w-24 place-items-center border border-[#d7cfc1] bg-[#fbfaf7]">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImage.previewUrl}
                  alt=""
                  className="pixelated max-h-full max-w-full"
                />
              ) : (
                <span className="text-xs text-[#777066]">PNG</span>
              )}
            </div>
            <p className="text-sm leading-6 text-[#5d574f]">{imageSummary}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="pixel-size" className="text-sm font-semibold text-[#2b2925]">
            一辺のピクセル数
          </label>
          <input
            id="pixel-size"
            type="number"
            min={1}
            max={64}
            step={1}
            value={Number.isNaN(pixelSize) ? "" : pixelSize}
            onChange={(event) => {
              setPixelSize(event.target.valueAsNumber);
              setQrBlob(null);
            }}
            className="min-h-12 border border-[#bfb5a6] px-3 outline-none transition focus:border-[#2d6a63] focus:ring-2 focus:ring-[#2d6a63]/20"
          />
          <p className="text-sm leading-6 text-[#5d574f]">
            アップロード画像全体を指定サイズに最近傍でリサイズします。
          </p>
        </div>

        {(inputErrors.length > 0 || apiError) && (
          <div className="border border-[#d46a52] bg-[#fff4ef] p-3 text-sm leading-6 text-[#8d2b1c]">
            {inputErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
            {apiError && <p>{apiError.message}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating}
          className="min-h-12 bg-[#2d6a63] px-5 font-semibold text-white transition hover:bg-[#24564f] disabled:cursor-not-allowed disabled:bg-[#9fb8b3]"
        >
          {isGenerating ? "生成中..." : "QR コードを生成"}
        </button>
      </form>

      <QrPreview
        previewUrl={qrPreviewUrl}
        isGenerating={isGenerating}
        onDownload={handleDownload}
      />
    </section>
  );
}
