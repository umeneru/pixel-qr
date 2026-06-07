import { PixelQrForm } from "@/components/pixel-qr-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfbff] text-[#161827]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1490px] flex-col px-4 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="pixel-title text-[2rem] font-black leading-none text-[#191927] sm:text-[2.65rem]">
                Pixel QR
              </h1>
              <p className="mt-2 text-sm font-semibold text-[#6a6f84] sm:text-base">
                ドット絵を埋め込んだQRコードを作成
              </p>
            </div>
          </div>
          <p className="inline-flex items-center gap-2 self-start rounded-full px-1 text-sm font-semibold text-[#555a70] sm:self-center">
            <span className="text-lg text-[#6354f1]">✣</span>
            ログイン不要・無料で使えます・入力内容は保存されません
          </p>
        </header>
        <PixelQrForm />
      </div>
    </main>
  );
}
