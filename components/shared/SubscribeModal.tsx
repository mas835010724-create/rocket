"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Check, ChevronLeft } from "lucide-react";
import { getAssetPath } from "@/utils/path";
import { requestOtp, submitOtp } from "@/services/movieService";
import { setGlobalSubscribeModalOpen } from "@/hooks/useSubscribeModalGlobal";
import { analytics } from "@/utils/google-analytics";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "center" | "bottom";
  packageDescription?: string;
  title?: string;
  packageId?: string | number;
  packageName?: string;
  fromSource?: string | number;
  sourceId?: string | number;
  deeplink?: string;
}

type Step = "phone" | "otp" | "success" | "failure";

export default function SubscribeModal({
  isOpen,
  onClose,
  variant = "center",
  packageDescription,
  title = "ចុះឈ្មោះឥឡូវនេះ",
  packageId,
  packageName,
  fromSource,
  sourceId,
  deeplink: deeplinkProp,
}: SubscribeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [failedStep, setFailedStep] = useState<"phone" | "otp">("phone"); // Track failed step
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deeplink, setDeeplink] = useState(deeplinkProp || "");
  const [resCode, setResCode] = useState<number | string | null>(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setGlobalSubscribeModalOpen(true);
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      setErrorMessage("");
      setDeeplink("");
      setResCode(null);
      document.body.style.overflow = "hidden";
      analytics.registrationStart({
        package_id: packageId,
        package_name: packageName,
      });
      analytics.registrationStepView({ step: "phone" });
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      if (isOpen) setGlobalSubscribeModalOpen(false);
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length >= 6 && !isLoading) {
      analytics.authPhoneSubmit({ phone_number: phoneNumber });
      setIsLoading(true);
      setErrorMessage("");
      try {
        if (packageId) {
          const res = await requestOtp(
            packageId,
            phoneNumber,
            fromSource,
            sourceId,
          );
          if (res && res.code === 200) {
            setTransactionId(res.result);
            setStep("otp");
            analytics.registrationStepView({ step: "otp" });
          } else {
            setResCode(res?.res_code || res?.code);
            if (res?.deeplink) {
              setDeeplink(res.deeplink);
            }
            setErrorMessage(res?.result || res?.message || "បរាជ័យ");
            setFailedStep("phone");
            setStep("failure");
            analytics.registrationFail({
              step: "phone",
              res_code: res?.res_code || res?.code,
              message: res?.message,
            });
            analytics.registrationError({
              step: "phone",
              message: res?.result || res?.message || "បរាជ័យ",
            });
          }
        } else {
          // Fallback if no packageId (dev testing)
          setStep("otp");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpSubmit = async () => {
    if (isLoading) return;
    analytics.authOtpSubmit({ transaction_id: transactionId });
    setIsLoading(true);
    setErrorMessage("");
    try {
      if (transactionId) {
        const res = await submitOtp(phoneNumber, transactionId, otp);
        if (res && res.code === 200) {
          setStep("success");
          analytics.registrationSuccess({ transaction_id: transactionId });
          setSuccessMessage(
            res?.result || res?.message || res?.desc || "ជោគជ័យ",
          );
          setDeeplink(
            res?.deeplink || "https://tv360.page.link/tv360-by-metfone",
          );
        } else {
          const code = res?.res_code || res?.code;
          setResCode(code);
          if (res?.deeplink) {
            setDeeplink(res.deeplink);
          }
          setErrorMessage(
            res?.result ||
              res?.message ||
              res?.desc ||
              "ការភ្ជាប់គម្រោងមិនជោគជ័យ។ សូមព្យាយាមម្តងទៀត។",
          );
          setFailedStep("otp");
          setStep("failure");
          analytics.registrationFail({
            step: "otp",
            res_code: code,
            message: res?.message,
          });
          analytics.registrationError({
            step: "otp",
            message:
              res?.result ||
              res?.message ||
              res?.desc ||
              "ការភ្ជាប់គម្រោងមិនជោគជ័យ។ សូមព្យាយាមម្តងទៀត។",
          });
        }
      } else {
        // Old testing logic
        if (/\D/.test(otp) || otp === "000000") {
          setFailedStep("otp");
          setStep("failure");
        } else {
          setStep("success");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleBackToPhone = () => {
    analytics.navBackClick({ from_step: "otp" });
    setStep("phone");
    setOtp("");
    setErrorMessage("");
  };

  // Continue button when error occurs -> Go back to the step that failed
  const handleFailureContinue = () => {
    // If res_code is 207 or 408 -> Already registered -> Redirect to TV360
    if (
      resCode === 207 ||
      resCode === "207" ||
      resCode === 408 ||
      resCode === "408"
    ) {
      window.location.href =
        deeplink || "https://tv360.page.link/tv360-by-metfone";
      onClose();
      return;
    }

    setErrorMessage(""); // Clear error message when going back
    if (failedStep === "otp") {
      setStep("otp");
      setOtp(""); // Clear OTP for retry
    } else {
      setStep("phone");
    }
  };

  const handleClose = () => {
    analytics.authCloseModal({ current_step: step });
    // Similar to Continue, if registered, redirect on close
    if (
      resCode === 207 ||
      resCode === "207" ||
      resCode === 408 ||
      resCode === "408"
    ) {
      window.location.href =
        deeplink || "https://tv360.page.link/tv360-by-metfone";
    }
    onClose();
  };

  // Handler for numeric input only
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);
    setPhoneNumber(value);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Numeric, max 6 digits
    setOtp(value);
  };

  const formatMessage = (msg: string) => {
    if (!msg) return "";
    return msg.replace(
      /"([^"]+)"|&lt;([^&]+)&gt;|<([^<>\/][^<>]*)>/g,
      (match, p1, p2, p3) => {
        const content = p1 || p2 || p3;
        return `<span class="text-white font-semibold">${content}</span>`;
      },
    );
  };

  const defaultDescription = `កុំឲ្យរំលងឱកាសទស្សនារឿងរំភើបអស្ចារ្យ។ ចុះឈ្មោះប្រើប្រាស់ TV360 ប្រចាំថ្ងៃ ត្រឹមតែ <span class="text-white font-bold">$ 0.1</span> (ឥតគិតថ្លៃសម្រាប់រយៈពេល 7 ថ្ងៃដំបូង)`;
  const displayDescription = packageDescription || defaultDescription;

  return createPortal(
    <div
      className={`fixed inset-0 z-[1000] flex ${
        variant === "bottom" ? "items-end pb-0 sm:pb-4" : "items-center"
      } justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-[340px] md:max-w-[420px] lg:max-w-[480px] bg-[#1a1a1a] border border-white/10 shadow-2xl p-6 md:p-8 lg:p-10 
          ${
            variant === "bottom"
              ? "rounded-t-2xl rounded-b-none sm:rounded-2xl animate-slideUp"
              : "rounded-2xl animate-scaleIn"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
        </button>

        {/* --- PHONE NUMBER INPUT STEP --- */}
        {step === "phone" && (
          <div className="flex flex-col items-center text-center pt-2">
            <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3">
              {title}
            </h3>
            <p
              className="text-[#888888] text-sm md:text-lg lg:text-lg leading-relaxed mb-6 md:mb-8 px-2 [&>strong]:text-white [&>strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />

            <div className="w-full relative mb-6 md:mb-8">
              <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2">
                <Image
                  src={getAssetPath("/icon/PhoneIcon.svg")}
                  alt="phone"
                  width={18}
                  height={18}
                  className="md:w-5 md:h-5 lg:w-6 lg:h-6"
                />
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="វាយបញ្ចូលលេខទូរសព្ទមិត្តហ្វូន"
                className="w-full bg-[#2a2a2a] border border-white/5 rounded-full py-3.5 md:py-4 lg:py-5 pl-12 md:pl-14 lg:pl-16 pr-4 text-sm md:text-base lg:text-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-tv-red/50 transition-colors"
              />
            </div>

            <button
              onClick={handlePhoneSubmit}
              disabled={phoneNumber.length < 6 || isLoading}
              className={`w-full py-3 md:py-3.5 lg:py-4 rounded-full font-bold text-sm md:text-base lg:text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                phoneNumber.length >= 6
                  ? "bg-tv-red text-white shadow-[0_0_15px_rgba(227,6,19,0.4)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(227,6,19,0.6)]"
                  : "bg-[#2a2a2a] text-[#555] cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "បន្ត"
              )}
            </button>
          </div>
        )}

        {/* --- OTP INPUT STEP --- */}
        {step === "otp" && (
          <div className="flex flex-col items-center text-center pt-2">
            <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3">
              ផ្ទៀងផ្ទាត់
            </h3>
            <p className="text-[#888888] text-sm md:text-lg lg:text-lg leading-relaxed mb-6 md:mb-8 px-1">
              វាយបញ្ចូលលេខកូដ OTP 6ខ្ទង់ ផ្ញើទៅកាន់លេខ <br />
              <span className="text-red-500 font-medium">{phoneNumber}</span>
            </p>

            <div className="w-full mb-6 md:mb-8">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="វាយបញ្ចូលលេខកូដ OTP (ឧទាហរណ៍ 123456)"
                className="w-full bg-[#2a2a2a] border border-white/5 rounded-full py-3.5 md:py-4 lg:py-5 px-6 text-center text-sm md:text-base lg:text-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-tv-red/50 transition-colors tracking-widest"
              />
            </div>

            <button
              onClick={handleOtpSubmit}
              disabled={otp.length < 6 || isLoading}
              className={`w-full py-3 md:py-3.5 lg:py-4 rounded-full font-bold text-sm md:text-base lg:text-lg transition-all mb-4 flex items-center justify-center gap-2 ${
                otp.length >= 6
                  ? "bg-tv-red text-white shadow-[0_0_15px_rgba(227,6,19,0.4)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(227,6,19,0.6)] active:scale-95"
                  : "bg-[#2a2a2a] text-[#555] cursor-not-allowed"
              } ${isLoading ? "opacity-80 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "បញ្ជូន"
              )}
            </button>

            <button
              onClick={() => {
                analytics.authUseAnotherNumber();
                handleBackToPhone();
              }}
              className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-[10px] md:text-xs">
                <img
                  src={getAssetPath("/icon/ReverseIcon.svg")}
                  className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
                />
              </span>{" "}
              ប្រើលេខទូរសព្ទផ្សេង
            </button>
          </div>
        )}

        {/* --- SUCCESS STEP --- */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center pt-4">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-2 border-green-500 flex items-center justify-center mb-4 md:mb-6 text-green-500">
              <Check
                size={32}
                strokeWidth={3}
                className="md:w-10 md:h-10 lg:w-12 lg:h-12"
              />
            </div>

            <h3 className="text-green-500 text-lg md:text-xl lg:text-2xl font-bold md:mb-2">
              ជោគជ័យ
            </h3>

            <div
              className="text-[#888888] text-sm md:text-base lg:text-lg leading-5 md:leading-6 mb-6 md:mb-8 px-2 text-center [&>span]:text-white [&>span]:font-semibold"
              dangerouslySetInnerHTML={{
                __html: `សូមចុចប៊ូតុង <span class="text-white font-semibold">បន្ត</span> ដើម្បីប្រើប្រាស់ Web ឬ APP TV360.`,
              }}
            />

            <button
              onClick={() => {
                window.location.href =
                  deeplink || "https://tv360.page.link/tv360-by-metfone";
                onClose();
              }}
              className="w-full py-3 md:py-4 lg:py-5 rounded-full bg-tv-red text-white font-bold text-sm md:text-base lg:text-lg shadow-[0_0_15px_rgba(227,6,19,0.4)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(227,6,19,0.6)] active:scale-95 transition-all"
            >
              បន្ត
            </button>
          </div>
        )}

        {/* --- FAILURE STEP --- */}
        {step === "failure" && (
          <div className="flex flex-col items-center text-center pt-4">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-tv-red flex items-center justify-center mb-4 md:mb-6 text-white shadow-[0_0_20px_rgba(227,6,19,0.4)]">
              <X
                size={32}
                strokeWidth={3}
                className="md:w-10 md:h-10 lg:w-12 lg:h-12"
              />
            </div>

            <h3 className="text-tv-red text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6">
              បរាជ័យ
            </h3>

            <div
              className="text-[#888888] text-sm md:text-base lg:text-lg leading-5 md:leading-6 mb-6 md:mb-8 px-2 text-center [&>span]:text-white [&>span]:font-semibold"
              dangerouslySetInnerHTML={{
                __html: formatMessage(errorMessage),
              }}
            />
            <button
              onClick={handleFailureContinue}
              className="w-full py-3 md:py-4 lg:py-5 rounded-full bg-tv-red text-white font-bold text-sm md:text-base lg:text-lg shadow-[0_0_15px_rgba(227,6,19,0.4)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(227,6,19,0.6)] active:scale-95 transition-all"
            >
              បន្ត
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
