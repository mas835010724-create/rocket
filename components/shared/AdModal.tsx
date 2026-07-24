"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SubscribeModal from "./SubscribeModal";

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  disablePortal?: boolean;
  thumbnail: string;
  videoId?: string | number;
  packageId?: string | number;
  packageDescription?: string;
  packageName?: string;
}

export default function AdModal({
  isOpen,
  onClose,
  title,
  disablePortal = false,
  thumbnail,
  videoId,
  packageId,
  packageDescription,
  packageName,
}: AdModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setShowSubscribeModal(false); // Reset when reopening
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubscribeClick = () => {
    setShowSubscribeModal(true);
  };

  const handleSubscribeModalClose = () => {
    setShowSubscribeModal(false);
    onClose(); // Also close AdModal when SubscribeModal is closed
  };

  if (!mounted) return null;

  // If showing SubscribeModal, only render that
  if (showSubscribeModal) {
    return (
      <SubscribeModal
        isOpen={true}
        onClose={handleSubscribeModalClose}
        variant="center"
        packageDescription={packageDescription}
        packageId={packageId}
        packageName={packageName}
        fromSource={1}
        sourceId={videoId}
      />
    );
  }

  if (!isOpen) return null;

  const content = (
    <div
      className={`fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 p-4 animate-fadeIn pointer-events-auto ${disablePortal ? "absolute" : "fixed"}`}
      onClick={onClose}
    >
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 animate-fadeIn pointer-events-auto"
        onClick={onClose}
      >
        <div
          className="relative w-[250px] md:w-[350px] lg:w-[450px] bg-[#1a1a1a] rounded-[16px] overflow-hidden shadow-2xl animate-scaleIn pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full aspect-400/225">
            <Image
              src={thumbnail}
              alt="Promotion Banner"
              fill
              sizes="(max-width: 768px) 250px, (max-width: 1024px) 350px, 450px"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>

            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10 shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-5 h-5 text-black"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-2 items-center px-2 py-4 text-center bg-[#1a1a1a]">
            <h3 className="text-white text-[15px] md:text-[18px] lg:text-[22px] font-bold line-clamp-2 px-2">
              {title || "ទស្សនា TV360"}
            </h3>

            <p className="text-[#888888] text-sm md:text-base lg:text-lg leading-relaxed px-2">
              ទស្សនាវីដេអូ TV360 គ្រប់ទីកន្លែងដោយមិនអស់ប្រាក់
            </p>

            <div className="w-full pb-2 flex items-center justify-center">
              <div className="scale-90 origin-center">
                <button
                  onClick={handleSubscribeClick}
                  className="group relative flex items-center justify-center transition-transform active:scale-95 text-white py-2.5 md:py-3 w-full max-w-[260px] px-4 md:px-8 rounded-full shadow-[0px_4px_20px_0px_#FF101480,inset_0px_-3.15px_15.73px_0px_#00000066]"
                  style={{
                    border: "1px solid transparent",
                    background: `
                      linear-gradient(98.85deg, #EB2A26 -8.66%, #A31525 91.77%) padding-box,
                      linear-gradient(90.51deg, #FFED8D 65.43%, #FF0001 102.93%) border-box
                    `,
                  }}
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-base w-full md:text-lg font-bold tracking-wide uppercase drop-shadow-md whitespace-nowrap">
                      ចុះឈ្មោះឥឡូវនេះ
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (disablePortal) return content;

  return createPortal(content, document.body);
}
