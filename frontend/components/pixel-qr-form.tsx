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
    <section className="grid flex-1 gap-3 py-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1fr)]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border border-[#e5e5e5] bg-white p-3 shadow-sm sm:p-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="url" className="text-xs font-semibold text-[#111111]">
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
            className="min-h-10 border border-[#d4d4d4] px-2.5 text-sm outline-none transition focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="image" className="text-xs font-semibold text-[#111111]">
            ドット絵 PNG
          </label>
          <input
            id="image"
            type="file"
            accept="image/png"
            onChange={handleImageChange}
            className="block w-full cursor-pointer border border-dashed border-[#d4d4d4] bg-white p-3 text-xs file:mr-3 file:border-0 file:bg-[#111111] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          <div className="grid grid-cols-[72px_1fr] items-center gap-2">
            <div className="grid aspect-square w-[72px] place-items-center border border-[#e5e5e5] bg-white">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImage.previewUrl}
                  alt=""
                  className="pixelated max-h-full max-w-full"
                />
              ) : (
                <span className="text-xs text-[#737373]">PNG</span>
              )}
            </div>
            <p className="text-xs leading-5 text-[#525252]">{imageSummary}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="pixel-size" className="text-xs font-semibold text-[#111111]">
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
            className="min-h-10 border border-[#d4d4d4] px-2.5 text-sm outline-none transition focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10"
          />
          <p className="text-xs leading-5 text-[#525252]">
            アップロード画像全体を指定サイズに最近傍でリサイズします。
          </p>
        </div>

        {(inputErrors.length > 0 || apiError) && (
          <div className="border border-[#fdba74] bg-[#fff7ed] p-2 text-xs leading-5 text-[#9a3412]">
            {inputErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
            {apiError && <p>{apiError.message}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating}
          className="min-h-10 bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:bg-[#c7c7c7]"
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
