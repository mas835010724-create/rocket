import Image from "next/image";
import SmartLink from "./SmartLink";
import { Movie } from "@/services/movieService";
import { formatViewCount } from "@/utils/formatHelper";

interface MovieCardProps {
  item: Movie;
  index?: number;
  className?: string;
  hoverEffect?: "scale" | "highlight";
  isVertical?: boolean;
}

export default function MovieCard({
  item,
  index = 0,
  className = "",
  hoverEffect = "scale",
  isVertical = false,
}: MovieCardProps) {
  const wrapperBaseClass = "group cursor-pointer relative";
  const animationClass = "animate-fadeUp";

  const aspectRatioClass = isVertical ? "aspect-[9/16]" : "aspect-[400/225]";

  const isScaleEffect = hoverEffect === "scale";

  const zIndexClass = isScaleEffect ? "z-10 hover:z-50" : "";

  const imageContainerCommon = `relative w-full overflow-hidden rounded-lg transition-all duration-300 ease-out ${aspectRatioClass}`;

  const imageContainerStyle = isScaleEffect
    ? `${imageContainerCommon} border border-white/5 group-hover:scale-[1.15] group-hover:border-[3px] group-hover:border-white group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]`
    : `${imageContainerCommon} bg-gray-800 border border-white/10 group-hover:border-2 group-hover:border-white pointer-events-none`;

  const imageStyle = isScaleEffect
    ? "object-cover"
    : "object-cover transition-transform duration-500 group-hover:scale-105";

  const titleClass =
    "text-[15px] md:text-[16px] text-white leading-snug line-clamp-2 group-hover:text-white transition-colors font-bold";
  const viewsClass = "text-[12px] text-[#B7B7B7] mt-1";

  return (
    <SmartLink
      href={`/movies/${item.id}?type=${item.type || "horizontal"}`}
      className={`flex flex-col ${wrapperBaseClass} ${animationClass} ${zIndexClass} ${className}`}
      style={{ animationDelay: `${(index % 4) * 50}ms` }}
      draggable={!isScaleEffect ? false : undefined}
    >
      <div className={imageContainerStyle}>
        <Image
          src={item.poster}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 400px"
          className={imageStyle}
          draggable={false}
        />
        {/* Overlay for "highlight" effect */}
        {!isScaleEffect && (
          <div className="absolute inset-0 transition-colors" />
        )}
      </div>

      <div className="pt-2 flex flex-col gap-0.5">
        <h3 className={titleClass}>{item.title}</h3>
        <p className={viewsClass}>
          ចំនួនទស្សនា {formatViewCount(item.views)} ដង
        </p>
      </div>
    </SmartLink>
  );
}
