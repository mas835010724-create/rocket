"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SmartLink from "@/components/shared/SmartLink";
import { Search } from "lucide-react";
import logoSrc from "../../../public/images/logo.webp";
import ButtonSub from "../shared/ButtonSub";
import { analytics } from "@/utils/google-analytics";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed flex items-center justify-center top-0 z-50 w-full h-[60px] md:h-[70px] transition-all duration-300 ${"bg-tv-dark/95 backdrop-blur-md shadow-md"}`}
    >
      <div className="w-full mx-auto px-4 flex items-center justify-between">
        <SmartLink href="/" className="flex flex-col">
          <div className="relative w-16 md:w-18">
            <Image
              src={logoSrc}
              alt="TV360 Logo"
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </SmartLink>

        <div className="flex items-center md:gap-3 md:gap-4">
          <button
            className={`group relative flex items-center justify-center transition-transform active:scale-95 text-white shadow-[0px_4px_20px_0px_#FF101480,inset_0px_-3.15px_15.73px_0px_#00000066] py-1.5 px-3 md:py-2 md:px-4 w-full justify-center rounded-full`}
            onClick={() => {
              analytics.navWatchCtaClick();
              window.location.href = "https://tv360.page.link/tv360-by-metfone";
            }}
            style={{
              border: "1px solid transparent",
              background: `
                    linear-gradient(98.85deg, #EB2A26 -8.66%, #A31525 91.77%) padding-box,
                    linear-gradient(90.51deg, #FFED8D 65.43%, #FF0001 102.93%) border-box
                  `,
            }}
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              <span
                className={`text-[12px] md:text-base font-bold tracking-wide uppercase drop-shadow-md whitespace-nowrap`}
              >
                ទស្សនា TV360
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
