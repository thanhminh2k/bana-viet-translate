export function Letterhead() {
  return (
    <div className="w-full text-center px-2 pt-2 pb-1 mb-3">
      <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-red-700">
        QUÂN KHU 5
      </h3>

      <h3 className="mt-0.5 text-sm sm:text-lg md:text-xl font-bold uppercase text-stone-800">
        SƯ ĐOÀN 2
      </h3>

      <div className="my-1 flex items-center justify-center gap-2">
        <div className="h-[1px] w-8 sm:w-16 bg-red-700/60" />
        <span className="text-red-700 text-xs sm:text-sm">★</span>
        <div className="h-[1px] w-8 sm:w-16 bg-red-700/60" />
      </div>

      <p className="text-xs sm:text-sm md:text-base font-semibold text-red-800 leading-snug">
        Trên tin, bạn mến, dân thương, đã đi là đến, đã đánh là thắng
      </p>
    </div>
  );
}
