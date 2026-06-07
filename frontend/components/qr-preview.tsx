type QrPreviewProps = {
  previewUrl: string | null;
  isGenerating: boolean;
  onDownload: () => void;
};

export function QrPreview({ previewUrl, isGenerating, onDownload }: QrPreviewProps) {
  return (
    <section className="flex min-h-[340px] flex-col sm:min-h-[460px] border border-[#e5e5e5] bg-white">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] px-3 py-2.5">
        <h2 className="text-sm font-bold">プレビュー</h2>
        <button
          type="button"
          onClick={onDownload}
          disabled={!previewUrl || isGenerating}
          className="min-h-9 bg-[#111111] px-3 text-xs font-semibold text-white transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:bg-[#c7c7c7]"
        >
          PNG ダウンロード
        </button>
      </div>

      <div className="grid flex-1 place-items-center p-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="生成された Pixel QR"
            className="pixelated aspect-square w-full max-w-[360px] sm:max-w-[520px] border border-[#e5e5e5] bg-white"
          />
        ) : (
          <div className="grid aspect-square w-full max-w-[360px] sm:max-w-[520px] place-items-center border border-dashed border-[#d4d4d4] bg-white text-center text-xs leading-5 text-[#737373]">
            {isGenerating ? "生成しています..." : "生成結果がここに表示されます"}
          </div>
        )}
      </div>
    </section>
  );
}
