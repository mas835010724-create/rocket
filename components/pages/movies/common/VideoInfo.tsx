"use client";

import { useState, useRef, useEffect } from "react";
import ButtonSub from "@/components/shared/ButtonSub";
import AdModal from "@/components/shared/AdModal";

interface VideoInfoProps {
  title: string;
  description: string;
  thumbnail: string;
  package_description?: string;
  videoId?: string | number;
  packageId?: string | number;
  isVertical?: boolean;
  disableXLSidebar?: boolean;
  packageName?: string;
}

export default function VideoInfo({
  title,
  description,
  thumbnail,
  package_description,
  videoId,
  packageId,
  isVertical = false,
  disableXLSidebar = false,
  packageName,
}: VideoInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [showModal, setShowModal] = useState(false);
  const defaultDescription = `កុំឲ្យរំលងឱកាសទស្សនារឿងរំភើបអស្ចារ្យ។ ចុះឈ្មោះប្រើប្រាស់ TV360 ប្រចាំថ្ងៃ ត្រឹមតែ <span class="text-white font-bold text-lg md:text-xl">$ 0.1</span> (ឥតគិតថ្លៃសម្រាប់រយៈពេល 7 ថ្ងៃដំបូង)`;
  const formattedDescription = package_description
    ? package_description.replace(/_/g, "_<wbr>")
    : defaultDescription;

  useEffect(() => {
    if (textRef.current) {
      const isLong =
        textRef.current.scrollHeight > textRef.current.clientHeight;
      if (!isExpanded) {
        setIsOverflowing(isLong);
      }
    }
  }, [description, isExpanded]);

  const containerClasses =
    isVertical || disableXLSidebar
      ? "flex flex-col md:grid md:grid-cols-[1fr_auto] md:gap-x-12 md:mt-2 md:gap-y-6 md:items-start"
      : "flex flex-col md:grid md:grid-cols-[1fr_auto] md:gap-x-12 md:mt-2 md:gap-y-6 md:items-start xl:flex xl:flex-col xl:gap-y-6 xl:items-stretch xl:mt-0";

  return (
    <div className="space-y-4 md:py-2 md:space-y-0">
      <AdModal
        isOpen={showModal}
        title={title}
        thumbnail={thumbnail}
        onClose={() => setShowModal(false)}
        videoId={videoId}
        packageId={packageId}
        packageName={packageName}
      />
      <div className={containerClasses}>
        <div className="flex flex-col items-start justify-start min-w-0 w-full px-4 md:px-0 md:order-1 xl:order-none">
          <h1 className="hidden xl:block text-white text-[28px] font-bold leading-tight mb-3">
            {title}
          </h1>
          {description && (
            <>
              <p
                ref={textRef}
                style={{ overflowWrap: "anywhere" }}
                className={`leading-relaxed text-tv-gray2 mt-2 md:mt-0 transition-all duration-300 text-[13px] md:text-[15px] xl:text-[16px] xl:text-[#B3B3B3] ${
                  isExpanded ? "" : "line-clamp-3"
                }`}
              >
                <span dangerouslySetInnerHTML={{ __html: description }} />
                {isExpanded && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="block mt-1 text-[15px] text-gray-400 hover:text-white underline decoration-gray-500 underline-offset-4 transition-colors"
                  >
                    តិចជាង
                  </button>
                )}
              </p>
              {!isExpanded && isOverflowing && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="mt-1 text-[15px] text-gray-400 underline decoration-gray-500 underline-offset-4 hover:text-white transition-colors"
                >
                  បន្ថែម
                </button>
              )}
            </>
          )}

          <div className="hidden md:flex xl:hidden items-start gap-3 mt-4 xl:mt-6 xl:mb-2">
            <div className="w-[4px] h-10 bg-red-600 self-center rounded-full shrink-0" />
            <div className="space-y-1 text-left flex-1">
              <h3 className="text-white text-[20px] font-bold line-clamp-2 xl:hidden">
                {title}
              </h3>
              <p className="text-tv-gray text-[16px] xl:hidden">
                ទស្សនាវីដេអូ TV360 គ្រប់ទីកន្លែងដោយមិនអស់ប្រាក់
              </p>
              <p className="hidden xl:block text-white text-[16px] font-bold">
                វីដេអូសាកល្បងសម្រាប់ការសាកល្បង
              </p>
              <p className="hidden xl:block text-tv-gray text-[14px]">
                ទស្សនាវីដេអូ TV360 គ្រប់ទីកន្លែងដោយមិនអស់ប្រាក់
              </p>
              <p className="hidden xl:block text-tv-gray text-[14px]">
                ចុះឈ្មោះប្រើប្រាស់ TV360 ប្រចាំថ្ងៃ ត្រឹមតែ{" "}
                <span className="text-white font-bold">$ 0.1</span>
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center gap-4 md:order-2 xl:order-none xl:w-full xl:items-start xl:mt-2">
          <div className="flex max-w-[40vw] 2xl:max-w-[500px] items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 h-fit shadow-inner">
            {package_description ? (
              <div
                className="text-[#828282] text-center text-[16px] leading-relaxed [&>strong]:text-tv-red [&>strong]:font-bold [&>strong]:text-[22px]"
                dangerouslySetInnerHTML={{ __html: formattedDescription }}
              />
            ) : (
              <p className="text-[#828282]">
                ចុះឈ្មោះប្រើប្រាស់ TV360 ប្រចាំថ្ងៃ ត្រឹមតែ{" "}
                <span className="text-white font-bold text-[22px] ml-1">
                  $ 0.1
                </span>
              </p>
            )}
          </div>
          <div className="w-auto xl:w-full">
            <div className="px-6 flex justify-center items-center xl:px-0 xl:justify-start">
              <ButtonSub
                size="lg"
                packageId={packageId}
                packageName={packageName}
                packageDescription={package_description}
                fromSource={1}
                sourceId={videoId}
                className="xl:w-full xl:max-w-none xl:h-[56px] xl:text-lg"
                pageLocation="video_detail"
              />
            </div>
          </div>
        </div>
        <div className="block md:hidden w-full mt-4">
          <div className="flex justify-center items-center">
            <ButtonSub
              size="lg"
              packageId={packageId}
              packageDescription={package_description}
              fromSource={1}
              sourceId={videoId}
              pageLocation="video_detail"
            />
          </div>
          <div className="flex items-start gap-3 mt-4 px-4">
            {/* Thanh đỏ dọc: Chỉnh lại h-6 để vừa tầm chiều cao của text tiêu đề */}
            <div className="w-[6px] h-8 bg-[#E51D24] flex-shrink-0" />

            {/* Khối nội dung văn bản: Chứa cả Title và Subtitle để chúng thẳng hàng với nhau */}
            <div className="flex flex-col gap-1">
              <h3 className="text-white text-[18px] font-bold leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-5 py-4">
            <div className="w-full max-w-[90%] rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 space-y-1">
              <div
                className="text-tv-gray text-[14px] leading-snug [&>strong]:text-white [&>strong]:font-bold [&>strong]:text-[18px] break-words"
                dangerouslySetInnerHTML={{ __html: formattedDescription || "" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
