type QrPreviewProps = {
  previewUrl: string | null;
  isGenerating: boolean;
  onDownload: () => void;
};

export function QrPreview({ previewUrl, isGenerating, onDownload }: QrPreviewProps) {
  return (
    <section className="flex min-h-[520px] flex-col border border-[#d7cfc1] bg-[#fbfaf7]">
      <div className="flex items-center justify-between border-b border-[#d7cfc1] px-5 py-4">
        <h2 className="text-base font-bold">プレビュー</h2>
        <button
          type="button"
          onClick={onDownload}
          disabled={!previewUrl || isGenerating}
          className="min-h-10 bg-[#2b2925] px-4 text-sm font-semibold text-white transition hover:bg-[#11100f] disabled:cursor-not-allowed disabled:bg-[#b8b1a8]"
        >
          PNG ダウンロード
        </button>
      </div>

      <div className="grid flex-1 place-items-center p-5">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="生成された Pixel QR"
            className="pixelated aspect-square w-full max-w-[520px] border border-[#d7cfc1] bg-white"
          />
        ) : (
          <div className="grid aspect-square w-full max-w-[520px] place-items-center border border-dashed border-[#bfb5a6] bg-white text-center text-sm leading-6 text-[#777066]">
            {isGenerating ? "生成しています..." : "生成結果がここに表示されます"}
          </div>
        )}
      </div>
    </section>
  );
}
