import type { BrowserQrError } from "@/lib/browser-qr";

type QrPreviewProps = {
  previewUrl: string | null;
  isGenerating: boolean;
  inputErrors: string[];
  apiError: BrowserQrError | null;
  onDownload: () => void;
};

export function QrPreview({ previewUrl, isGenerating, inputErrors, apiError, onDownload }: QrPreviewProps) {
  const hasErrors = inputErrors.length > 0 || Boolean(apiError);

  return (
    <section className="flex min-h-0 flex-col gap-3 rounded-lg bg-white p-4 shadow-[0_10px_30px_rgba(74,85,130,0.07)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-xl font-black text-[#5948dd]">
          プレビュー
        </h2>
        <span className="self-start rounded-md border border-[#ded8ff] bg-[#f6f4ff] px-5 py-2 text-sm font-black text-[#6554dc] sm:self-auto">
          1024 ×1024px PNG
        </span>
      </div>

      {hasErrors && (
        <div className="rounded-md border border-[#f6b55f] bg-[#fff8ed] p-3 text-sm font-semibold leading-6 text-[#9a5a11]">
          {inputErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
          {apiError && (
            <p>
              {apiError.code}: {apiError.message}
            </p>
          )}
        </div>
      )}

      <div className="grid min-h-0 flex-1 place-items-center rounded-md border border-[#e0e4ee] bg-white p-4 shadow-inner">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="生成された Pixel QR"
            className="pixelated aspect-square h-full max-h-[530px] w-full max-w-[530px] bg-white object-contain"
          />
        ) : (
          <div className="grid aspect-square w-full max-w-[530px] place-items-center rounded-md border border-dashed border-[#d7dbe8] bg-[#fbfbff] p-5 text-center text-sm font-black leading-6 text-[#858ba0]">
            {isGenerating ? "生成しています..." : "生成結果がここに表示されます"}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDownload}
        disabled={!previewUrl || isGenerating}
        className="min-h-14 rounded-md border border-[#6a56f1] bg-white px-5 text-xl font-black text-[#5948dd] transition hover:bg-[#f7f4ff] disabled:cursor-not-allowed disabled:border-[#d6dae6] disabled:text-[#a2a8bb]"
      >
        ダウンロード
      </button>
    </section>
  );
}
