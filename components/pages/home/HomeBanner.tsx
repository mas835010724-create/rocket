"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import SmartLink from "../../shared/SmartLink";
import { useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { getAssetPath } from "@/utils/path";
import SubscribeSection from "./SubscribeSection";
import { Banner } from "@/services/movieService";
import { CloudCog } from "lucide-react";

interface HomeBannerProps {
  banners: Banner[];
}

export default function HomeBanner({ banners }: HomeBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!banners || banners.length === 0) {
    return null;
  }

  const activeDescription = banners[activeIndex]?.description;
  const activePackageId = banners[activeIndex]?.package_id;
  const activePackageName = banners[activeIndex]?.package_name;
  const activeId = banners[activeIndex]?.id;
  const activeDeeplink = banners[activeIndex]?.deeplink;
  return (
    <section className="relative w-full mt-[60px] md:mt-[70px] flex flex-col items-center justify-center bg-tv-dark overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={banners.length > 1}
        pagination={{
          clickable: true,
          bulletClass:
            "inline-block w-4 h-[4px] rounded-full bg-white/40 mx-1 cursor-pointer transition-all duration-300",
          bulletActiveClass: "!bg-white !opacity-100",
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full home-banner-slider max-w-[1920px] mb-4"
      >
        {banners.map((item, index) => (
          <SwiperSlide key={item.id}>
            <SmartLink
              href={item.internal_link || item.deeplink || ``}
              className="relative block w-full aspect-[3/4] md:aspect-[3/4] md:max-h-[70vh] xl:aspect-auto xl:h-[600px] xl:max-h-none overflow-hidden"
            >
              {/* --- IMAGE MOBILE --- */}
              <div className="relative w-full h-full xl:hidden">
                <img
                  src={item.image_mobile}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-tv-dark via-tv-dark/80 to-transparent pointer-events-none"></div>

                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-tv-dark via-tv-dark/80 to-transparent pointer-events-none"></div>
              </div>

              {/* --- IMAGE PC (1920x600) --- */}
              <div className="relative hidden xl:block w-full h-full">
                <img
                  src={item.image_pc || item.image_mobile}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-tv-dark via-tv-dark/40 to-transparent pointer-events-none"></div>
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none"></div>
              </div>
              <div className="absolute inset-0 z-20 flex flex-col justify-end md:justify-center px-4 pb-12 md:pb-0 md:px-16 lg:px-24">
                <div className="max-w-[85%] md:max-w-[50%] flex flex-col items-start gap-2 md:gap-4">
                  <h2 className="text-3xl hidden md:hidden lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                    {item.name}
                  </h2>
                </div>
                <div className="md:hidden hidden absolute right-4 bottom-25 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-[#FFDEA8] to-[#FFA702] shadow-lg ">
                  <Image
                    src={getAssetPath("/icon/PlayIcon.svg")}
                    alt={item.name}
                    width={16}
                    height={16}
                    style={{ width: "auto", height: "auto" }}
                    className="ml-0.5"
                  />
                </div>
              </div>
            </SmartLink>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* PC Subscribe Section */}
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl">
        <SubscribeSection
          description={activeDescription}
          packageId={activePackageId}
          packageDescription={activeDescription}
          packageName={banners[activeIndex]?.name}
          fromSource={2}
          sourceId={activeId}
          deeplink={activeDeeplink}
        />
      </div>

      {/* Mobile Subscribe Section */}
      <div className="md:hidden w-full relative z-30 mt-[-20px]">
        <SubscribeSection
          description={activeDescription}
          packageId={activePackageId}
          packageDescription={activeDescription}
          packageName={activePackageName}
          fromSource={2}
          sourceId={activeId}
          deeplink={activeDeeplink}
        />
      </div>
    </section>
  );
}
