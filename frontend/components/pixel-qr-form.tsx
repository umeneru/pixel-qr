"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

import { createPixelQrInBrowser, type BrowserQrError } from "@/lib/browser-qr";
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
  const [apiError, setApiError] = useState<BrowserQrError | null>(null);
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
      return "ここにドラッグ＆ドロップ";
    }
    return `${selectedImage.file.name} / ${(selectedImage.file.size / 1024).toFixed(1)} KB`;
  }, [selectedImage]);

  const pixelSizeIsValid = Number.isInteger(pixelSize) && pixelSize >= 1 && pixelSize <= 64;

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
      const blob = await createPixelQrInBrowser({ url, image: selectedImage.file, pixelSize });
      setQrBlob(blob);
    } catch (error) {
      setApiError(error as BrowserQrError);
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
    <section className="grid flex-1 gap-4 lg:grid-cols-[minmax(360px,0.83fr)_minmax(440px,1.17fr)]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(74,85,130,0.07)]"
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
            <label
              htmlFor="image"
              className="grid min-h-[152px] cursor-pointer place-items-center rounded-md border border-dashed border-[#8d7dff] bg-[#fbfaff] px-6 py-5 text-center transition hover:border-[#5f4df2] hover:bg-[#f6f3ff]"
            >
              <input
                id="image"
                type="file"
                accept="image/png"
                onChange={handleImageChange}
                className="sr-only"
              />
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

            <div className="space-y-2">
              <label htmlFor="pixel-size" className="block text-sm font-black text-[#62687b]">
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
                className="min-h-12 w-full rounded-md border border-[#d7dbe8] bg-white px-4 text-base text-[#171827] outline-none transition focus:border-[#6655f1] focus:ring-4 focus:ring-[#6655f1]/15"
              />
              <p className="text-sm font-semibold leading-6 text-[#70778d]">1 〜 64 の整数</p>
              <p className={pixelSizeIsValid ? "text-sm font-black text-[#18a957]" : "text-sm font-black text-[#d24545]"}>
                {pixelSizeIsValid ? "◎ 有効な値です" : "1〜64の整数を入力してください"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-b border-[#e7e9f2] pb-5">
          <p className="text-sm font-black text-[#62687b]">
            リサイズ後のプレビュー（{Number.isNaN(pixelSize) ? "--" : pixelSize}×{Number.isNaN(pixelSize) ? "--" : pixelSize}px）
          </p>
          <div className="grid size-28 place-items-center rounded-md border border-[#edf0f6] bg-white shadow-sm">
            {selectedImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedImage.previewUrl} alt="" className="pixelated max-h-full max-w-full p-2" />
            ) : (
              <span className="text-sm font-black text-[#9aa1b5]">PNG</span>
            )}
          </div>
        </div>

        {(inputErrors.length > 0 || apiError) && (
          <div className="rounded-md border border-[#f6b55f] bg-[#fff8ed] p-3 text-sm font-semibold leading-6 text-[#9a5a11]">
            {inputErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
            {apiError && <p>{apiError.message}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating}
          className="min-h-16 rounded-md bg-[#624de7] px-5 text-xl font-black text-white shadow-[0_12px_25px_rgba(98,77,231,0.24)] transition hover:bg-[#5140d4] disabled:cursor-not-allowed disabled:bg-[#b8bdd0]"
        >
          {isGenerating ? "生成中..." : "▦ 3. QRコードを生成"}
        </button>

        <div className="rounded-lg border border-[#dfe7f5] bg-[#fbfdff] p-4 text-sm font-semibold leading-7 text-[#6b7286]">
          <p className="font-black text-[#4976dc]">ⓘ ご注意</p>
          <p>・QRコードの読み取りやすさを確保するため、ドット絵の表示サイズは制限されています。</p>
          <p>・誤り訂正レベルは「H（高）」で生成します。</p>
        </div>
      </form>

      <QrPreview previewUrl={qrPreviewUrl} isGenerating={isGenerating} onDownload={handleDownload} />
    </section>
  );
}
