import qk5Logo from "../assets/qk5.jpg";
import div2Logo from "../assets/f2.jpg";
import qrImage from "../assets/qr.png"; // TODO: đổi lại đúng tên/đường dẫn file QR của bạn

export function Letterhead() {
  return (
    <div className="relative w-full mb-3">
      {/* Logo Quân khu 5 + QR — đặt tuyệt đối ở góc trái, nằm ngoài khung nội dung max-w-5xl (to gấp 3) */}
      <div className="absolute left-1 top-0 sm:left-3 z-10 flex flex-col items-center gap-10">
        <img
          src={qk5Logo}
          alt="Logo Quân khu 5"
          className="h-32 w-32 sm:h-72 sm:w-72 md:h-[21rem] md:w-[21rem] object-contain"
        />
        <img
          src={qrImage}
          alt="Mã QR"
          className="h-[7.5rem] w-[7.5rem] sm:h-[10.5rem] sm:w-[10.5rem] object-contain"
        />
      </div>

      {/* Logo Sư đoàn 2 — góc phải (to gấp 3) */}
      <div className="absolute right-1 top-0 sm:right-3 z-10">
        <img
          src={div2Logo}
          alt="Logo Sư đoàn 2"
          className="h-48 w-48 sm:h-72 sm:w-72 md:h-[21rem] md:w-[21rem] object-contain"
        />
      </div>

      {/* Nội dung tiêu đề — căn giữa trong max-w-5xl, padding rộng hơn để không đè lên logo lớn */}
      <div className="mx-auto max-w-5xl text-center px-52 sm:px-80 pt-2 pb-1">
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
    </div>
  );
}
