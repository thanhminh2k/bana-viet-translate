import ahllvtLogo from "../assets/ahllvtnd.jpg";
import qk5Logo from "../assets/qk5.jpg";
import div2Logo from "../assets/f2.jpg";
import qrImage from "../assets/qr.png";

export function Letterhead() {
  return (
    <div className="mb-3 grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-1.5 gap-y-1 px-1 pt-2 pb-1 sm:gap-x-4 sm:px-2">
      <style>{`
        @keyframes medal-blink {
          0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 6px rgba(255, 200, 0, 0.9)); }
          50% { opacity: 0.8; transform: scale(0.95); filter: drop-shadow(0 0 0 rgba(255, 200, 0, 0)); }
        }
        .medal-blink { animation: medal-blink 1.2s ease-in-out infinite; }
        .medal-blink-delay { animation-delay: 0.6s; }
        @media (prefers-reduced-motion: reduce) {
          .medal-blink { animation: none; }
        }
      `}</style>

      {/* Trái: logo QK5 + QR (ẩn ở 2xl vì đã hiện ngoài khung) */}
      <div className="row-span-1 -mx-4 flex w-16 flex-col items-center gap-1 min-[400px]:w-20 sm:row-span-2 sm:w-24 sm:gap-2 md:w-32 lg:w-36 2xl:hidden">
        <img src={qk5Logo} alt="Logo Quân khu 5" className="h-auto w-full object-contain" />
        <img src={qrImage} alt="Mã QR" className="h-auto w-3/4 object-contain sm:w-full" />
      </div>

      {/* Giữa: tiêu đề + huân chương */}
      <div className="min-w-0 self-center text-center 2xl:col-span-3">
        <h3 className="text-sm font-bold uppercase leading-tight text-red-800 min-[400px]:text-base sm:text-xl md:text-2xl">
          QUÂN KHU 5
        </h3>
        <h3 className="mt-0.5 text-sm font-bold uppercase leading-tight text-red-800 min-[400px]:text-base sm:text-xl md:text-2xl">
          SƯ ĐOÀN 2
        </h3>

        <div className="my-2 flex items-center justify-center gap-1 sm:gap-2">
          <img
            src={ahllvtLogo}
            alt="AHLLVT"
            className="medal-blink h-8 w-auto min-w-0 max-w-[48%] object-contain min-[400px]:h-10 sm:h-14 md:h-16"
          />
          <img
            src={ahllvtLogo}
            alt="AHLLVT"
            className="medal-blink h-8 w-auto min-w-0 max-w-[48%] object-contain min-[400px]:h-10 sm:h-14 md:h-16"
          />
        </div>
      </div>

      {/* Phải: logo Sư đoàn 2 (ẩn ở 2xl) */}
      <div className="row-span-1 flex w-16 justify-center min-[400px]:w-20 sm:row-span-2 sm:w-24 md:w-32 lg:w-36 2xl:hidden">
        <img src={div2Logo} alt="Logo Sư đoàn 2" className="h-auto w-full object-contain" />
      </div>

      {/* Khẩu hiệu: mobile chiếm cả 3 cột, sm+ nằm ở cột giữa */}
      <div className="col-span-3 -mt-4 text-center sm:col-span-1 sm:col-start-2 sm:mt-0 2xl:col-span-3 2xl:col-start-1">
        <p className="whitespace-nowrap text-[13px] font-semibold uppercase leading-snug tracking-normal text-red-800 min-[400px]:text-sm sm:text-sm sm:tracking-wider md:text-base md:tracking-widest">
          Trên tin, bạn mến, dân thương
        </p>
        <p className="whitespace-nowrap text-[13px] font-semibold uppercase leading-snug tracking-normal text-red-800 min-[400px]:text-sm sm:text-sm sm:tracking-wider md:text-base md:tracking-widest">
          đã đi là đến, đã đánh là thắng
        </p>
      </div>
    </div>
  );
}