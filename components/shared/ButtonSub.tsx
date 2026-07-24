"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAssetPath } from "@/utils/path";
import SubscribeModal from "./SubscribeModal";
import { analytics } from "@/utils/google-analytics";

interface ButtonSubProps {
  size?: "sm" | "lg";
  className?: string;
  onClick?: () => void;
  packageId?: string | number;
  videoId?: string | number;
  packageDescription?: string;
  packageName?: string;
  fromSource?: string | number;
  sourceId?: string | number;
  deeplink?: string;
  pageLocation?: "home" | "video_detail" | "vertical_player";
}

const ButtonSub = ({
  size = "sm",
  className = "",
  onClick,
  packageId,
  videoId,
  packageDescription,
  packageName,
  fromSource,
  sourceId,
  deeplink,
  pageLocation = "home",
}: ButtonSubProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    packageId?: string | number;
    packageName?: string;
    packageDescription?: string;
  } | null>(null);
  const [hasExposed, setHasExposed] = useState(false);

  useEffect(() => {
    if (!hasExposed) {
      analytics.subscribeViewExposed({
        package_id: packageId,
        package_name: packageName,
        page_location: pageLocation,
      });
      setHasExposed(true);
    }
  }, [packageId, packageName, pageLocation, hasExposed]);

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Log GA4 Event
    const params = {
      package_id: packageId,
      package_name: packageName,
      source_id: sourceId || videoId,
    };
    if (pageLocation === "home") analytics.subscribeClickHome(params);
    else if (pageLocation === "video_detail") analytics.subscribeClickVideo(params);
    else if (pageLocation === "vertical_player") analytics.subscribeClickVertical(params);

    // Gọi callback trước (để đóng AdModal nếu có)
    if (onClick) {
      onClick();
    }
    // Snapshot current data
    setModalData({
      packageId,
      packageName,
      packageDescription,
    });
    // Sau đó mở SubscribeModal
    setIsModalOpen(true);
  };

  const sizeClasses =
    size === "lg"
      ? "py-2.5 md:py-3 w-full max-w-[260px] px-4 md:px-8 justify-center rounded-full"
      : "py-2 px-4 rounded-3xl";
  const textSize = size === "lg" ? "text-base md:text-lg" : "text-sm";
  const iconSize = size === "lg" ? 24 : 18;
  return (
    <>
      <button
        onClick={handleSubscribe}
        className={`group relative flex items-center justify-center transition-transform active:scale-95 text-white ${sizeClasses} ${className} shadow-[0px_4px_20px_0px_#FF101480,inset_0px_-3.15px_15.73px_0px_#00000066]`}
        style={{
          border: "1px solid transparent",
          background: `
            linear-gradient(98.85deg, #EB2A26 -8.66%, #A31525 91.77%) padding-box,
            linear-gradient(90.51deg, #FFED8D 65.43%, #FF0001 102.93%) border-box
          `,
        }}
      >
        <div className="relative z-10 flex items-center justify-center gap-2">
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <Image
              src={getAssetPath("/icon/bell-icon.svg")}
              alt="bell"
              width={iconSize}
              height={iconSize}
              className="object-contain"
              priority
            />
            <span
              className={`absolute -top-0.5 -right-0.5 flex ${size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"}`}
            ></span>
          </div>
          <span
            className={`${textSize} font-bold tracking-wide uppercase drop-shadow-md whitespace-nowrap`}
          >
            ចុះឈ្មោះឥឡូវនេះ
          </span>
        </div>
      </button>

      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variant="center"
        packageDescription={modalData?.packageDescription || packageDescription}
        packageId={modalData?.packageId || packageId}
        packageName={modalData?.packageName || packageName}
        fromSource={fromSource}
        sourceId={sourceId || videoId}
        deeplink={deeplink}
      />
    </>
  );
};

export default ButtonSub;
