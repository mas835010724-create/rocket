import { ChevronRight } from "lucide-react";
import SmartLink from "./SmartLink";
import Image from "next/image";

interface SectionTitleProps {
  title: string;
  viewAllHref?: string;
  className?: string;
  icon?: string;
}

export default function SectionTitle({
  title,
  viewAllHref,
  className = "",
  icon,
}: SectionTitleProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center">
        {icon && (
          <Image
            src={icon}
            alt="icon"
            width={24}
            height={24}
            className="mr-2"
          />
        )}
        <h2 className="text-[20px] md:text-[24px] font-semibold text-white tracking-tight">
          {title}
        </h2>
      </div>

      {viewAllHref && (
        <SmartLink
          href={viewAllHref}
          className="flex items-center gap-0.5 text-xs md:text-sm font-medium text-tv-gray2 hover:text-white transition-colors group"
        >
          មើលទាំងអស់
          <ChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </SmartLink>
      )}
    </div>
  );
}
