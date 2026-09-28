import ahllvtLogo from "../assets/ahllvtnd.jpg";
import qk5Logo from "../assets/qk5.jpg";
import div2Logo from "../assets/f2.jpg";
import qrImage from "../assets/qr.png";

export function Letterhead() {
  return (
    <div className="relative w-full text-center px-2 pt-2 pb-1 mb-3">
      {/* Trái (mobile): logo QK5, QR ngay bên dưới */}
      <div className="absolute left-1 top-2 flex w-16 flex-col items-center gap-1 sm:w-20 lg:hidden">
        <img
          src={qk5Logo}
          alt="Logo Quân khu 5"
          className="h-24 w-24 object-contain"
        />
        <img
          src={qrImage}
          alt="Mã QR"
          className="h-24 w-24 object-contain sm:h-20 sm:w-20"
        />
      </div>

      {/* Phải (mobile): logo Sư đoàn 2 */}
      <div className="absolute right-1 top-2 flex w-16 justify-center sm:w-20 lg:hidden">
        <img
          src={div2Logo}
          alt="Logo Sư đoàn 2"
          className="h-24 w-24 object-contain"
        />
      </div>

      {/* Chừa chỗ hai bên cho logo trên mobile */}
      <div className="px-16 sm:px-20 lg:px-0">
        <h3 className="text-sm sm:text-lg md:text-xl font-bold uppercase text-red-800">
          QUÂN KHU 5
        </h3>

        <h3 className="mt-0.5 text-sm sm:text-lg md:text-xl font-bold uppercase text-red-800">
          SƯ ĐOÀN 2
        </h3>
      </div>

      <div className="my-1 flex items-center justify-center gap-2">
        <img
          src={ahllvtLogo}
          alt="AHLLVT"
          className="h-16 w-auto max-w-[240px] object-contain"
        />
        <img
          src={ahllvtLogo}
          alt="AHLLVT"
          className="h-16 w-auto max-w-[240px] object-contain"
        />
      </div>

      <p className="text-xs sm:text-sm md:text-base font-semibold text-red-800 uppercase tracking-widest leading-snug">
        Trên tin, bạn mến, dân thương
      </p>
      <p className="text-xs sm:text-sm md:text-base font-semibold text-red-800 uppercase tracking-widest leading-snug">
        đã đi là đến, đã đánh là thắng
      </p>
    </div>
  );
}