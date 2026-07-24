"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import ButtonSub from "./ButtonSub";

interface VerticalSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  packageDescription?: string;
  title?: string;
  packageId?: string | number;
  fromSource?: string | number;
  sourceId?: string | number;
}

export default function VerticalSubscribeModal({
  isOpen,
  onClose,
  onSubscribe,
  packageDescription,
  title,
  packageId,
  fromSource,
  sourceId,
}: VerticalSubscribeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      <div
        className="relative w-full bg-[#121212] rounded-t-3xl p-6 pb-10 shadow-2xl animate-slideUp pointer-events-auto border-t border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-6 opacity-50" />

        <div className="flex items-center justify-center gap-2">
          <ButtonSub
            packageId={packageId}
            size="lg"
            fromSource={fromSource}
            sourceId={sourceId}
            pageLocation="vertical_player"
          />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-white text-lg font-bold my-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-400 text-sm">
            ទស្សនាវីដេអូ TV360 គ្រប់ទីកន្លែងដោយមិនអស់ប្រាក់
          </p>
        </div>

        <div className="bg-[#1E1E1E] rounded-2xl p-5 text-center border border-white/5 mx-2">
          <div
            className="text-gray-300 text-sm leading-relaxed home-desciption "
            dangerouslySetInnerHTML={{
              __html:
                packageDescription ||
                "កុំឲ្យរំលងឱកាសទស្សនារឿងរំភើបអស្ចារ្យ។ ចុះឈ្មោះប្រើប្រាស់ TV360 ដើម្បីទស្សនាមាតិកាផ្តាច់មុខ។",
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
