import { PixelQrForm } from "@/components/pixel-qr-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#211f1b]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-2 border-b border-[#d7cfc1] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6d4e2f]">
              Pixel QR
            </p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              ドット絵入り QR コードを作成
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#5d574f]">
            URL、PNG、一辺のピクセル数を指定して、ドット感を保った QR コード PNG を生成します。
          </p>
        </header>
        <PixelQrForm />
      </div>
    </main>
  );
}
