import { PixelQrForm } from "@/components/pixel-qr-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfbff] text-[#161827]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1490px] flex-col px-4 py-4 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
            <h1 className="pixel-title text-[2rem] font-black leading-none text-[#5948dd] sm:text-[2.65rem]">
              Pixel QR
            </h1>
            <p className="text-sm font-semibold text-[#6a6f84] sm:pb-1 sm:text-base">
              ドット絵を埋め込んだQRコードを作成
            </p>
          </div>
          <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-2 self-start rounded-full border border-[#cfd4df] bg-white px-5 py-3 text-sm font-black text-[#253056] shadow-[0_2px_8px_rgba(31,36,67,0.04)] sm:self-center">
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-[#20bf72]">
                <path d="M12 12a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm-7 8.4c0-4 3-6.7 7-6.7s7 2.7 7 6.7c0 .6-.5 1-1 1H6c-.6 0-1-.4-1-1Z" />
              </svg>
              ログイン不要
            </span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-[#2f80ed]">
                <path d="M12 2.4 4.8 5.2v5.4c0 4.7 3 8.9 7.2 10.4 4.2-1.5 7.2-5.7 7.2-10.4V5.2L12 2.4Zm3.1 7.8-3.8 4.3a1 1 0 0 1-1.5 0l-1.9-2.1 1.5-1.4 1.1 1.2 3-3.4 1.6 1.4Z" />
              </svg>
              サーバー保存なし
            </span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-[#9b51e0]">
                <path d="M4 5.5C4 4.7 4.7 4 5.5 4h13c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5h-13c-.8 0-1.5-.7-1.5-1.5v-13Zm2 3h12V6H6v2.5Zm0 2V18h12v-7.5H6Z" />
              </svg>
              ブラウザ完結
            </span>
          </div>
        </header>
        <PixelQrForm />
      </div>
    </main>
  );
}
