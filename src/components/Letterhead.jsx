import div2Logo from "../assets/f2.jpg";

export function Letterhead() {
  return (
    <div className="mb-8 overflow-hidden rounded-3xl border-2 border-amber-100 bg-white shadow-sm shadow-amber-100">
      <div className="flex items-center gap-3 sm:gap-4 border-b border-amber-100 px-4 py-3 sm:px-6 sm:py-4">
        <img
          src={div2Logo}
          alt="Phù hiệu Sư đoàn Bộ binh 2, Quân khu 5"
          className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full object-contain"
        />
        <div className="text-left leading-tight">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-rose-600">
            Sư đoàn Bộ binh 2 · Quân khu 5
          </p>
          <p className="text-sm sm:text-base font-semibold text-stone-700">Tiểu đoàn SPG-9</p>
          <p className="text-[11px] sm:text-xs text-stone-400">
            Sản phẩm tham gia Phong trào thi đua Chuyển đổi số
          </p>
        </div>
      </div>
    </div>
  );
}
