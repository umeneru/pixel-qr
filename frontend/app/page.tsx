import { PixelQrForm } from "@/components/pixel-qr-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 py-3 sm:px-5 sm:py-5">
        <header className="flex flex-col gap-1 border-b border-[#e5e5e5] pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0] text-[#525252]">
              Pixel QR
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-3xl">
              ドット絵入り QR コードを作成
            </h1>
          </div>
          <p className="max-w-md text-xs leading-5 sm:text-sm text-[#525252]">
            URL、PNG、一辺のピクセル数を指定して、ドット感を保った QR コード PNG を生成します。
          </p>
        </header>
        <PixelQrForm />
      </div>
    </main>
  );
}
