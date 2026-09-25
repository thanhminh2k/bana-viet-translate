import qk5Logo from "../assets/qk5.jpg";
import div2Logo from "../assets/f2.jpg";

export function Letterhead() {
  return (
    <div className="mb-8 w-full mx-auto">
      <div className="relative flex items-center justify-between rounded-2xl sm:p-8">
        {/* Logo Quân khu 5 */}
        <div className="flex-shrink-0">
          <img
            src={qk5Logo}
            alt="Logo Quân khu 5"
            className="h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 object-contain"
          />
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 text-center px-4">
          {/* QUÂN KHU 5 */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wide text-red-700">
            QUÂN KHU 5
          </h1>

          {/* SƯ ĐOÀN 2 */}
          <h2 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold uppercase text-stone-800">
            SƯ ĐOÀN 2
          </h2>

          {/* Đường phân cách ngôi sao */}
          <div className="my-2 flex items-center justify-center gap-2">
            <div className="h-[1px] w-12 sm:w-20 bg-red-700/60" />
            <span className="text-red-700 text-sm sm:text-base">★</span>
            <div className="h-[1px] w-12 sm:w-20 bg-red-700/60" />
          </div>

          {/* Khẩu hiệu */}
          <p className="text-sm sm:text-base md:text-lg font-semibold text-red-800 leading-snug">
            Trên tin, bạn mến, dân thương, đã đi là đến, đã đánh là thắng
          </p>
        </div>

        {/* Logo Sư đoàn 2 */}
        <div className="flex-shrink-0">
          <img
            src={div2Logo}
            alt="Logo Sư đoàn 2"
            className="h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 object-contain"
          />
        </div>
      </div>
    </div>
  );
}