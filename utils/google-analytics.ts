"use client";

/**
 * Log a basic GA4 event
 * @param eventName Name of the event
 * @param params Optional parameters for the event
 */
export const logGAEvent = (eventName: string, params?: object) => {
  if (typeof window !== "undefined") {
    if ((window as any).gtag) {
      (window as any).gtag("event", eventName, {
        ...params,
      });
    }
  }
};

/**
 * Centralized GA4 tracking methods.
 * Modify event names and parameters here to apply across the entire app.
 */
export const analytics = {
  // 1. Conversion Events (Mua Gói)
  subscribeClickHome: (params?: any) =>
    logGAEvent("subscribe_click_home", params),
  subscribeClickVideo: (params?: any) =>
    logGAEvent("subscribe_click_video", params),
  subscribeClickVertical: (params?: any) =>
    logGAEvent("subscribe_click_vertical", params),
  subscribeSkipTrial: (params: {
    video_id?: string | number;
    title?: string;
  }) => logGAEvent("subscribe_skip_trial", params),
  subscribeViewExposed: (params?: any) =>
    logGAEvent("subscribe_view_exposed", params),
  registrationSuccess: (params: { transaction_id: string }) =>
    logGAEvent("registration_success", params),
  registrationFail: (params: {
    res_code?: string | number;
    message?: string;
    step?: string;
    phone_number?: string;
  }) => logGAEvent("registration_fail", params),

  // 2. Engagement Events (Tương Tác Video)
  videoPlay: (params: { video_id?: string | number; title?: string }) =>
    logGAEvent("video_play", params),
  videoPause: (params: { video_id?: string | number; title?: string }) =>
    logGAEvent("video_pause", params),
  videoComplete: (params: { video_id?: string | number; title?: string }) =>
    logGAEvent("video_complete", params),
  videoChangeSpeed: (params: { speed: number }) =>
    logGAEvent("video_change_speed", params),
  videoChangeQuality: (params: { quality: string }) =>
    logGAEvent("video_change_quality", params),
  videoToggleSubtitle: (params: { subtitle: string }) =>
    logGAEvent("video_toggle_subtitle", params),
  videoProgress: (params: {
    video_id?: string | number;
    title?: string;
    percent: number;
  }) => logGAEvent("video_progress", params),

  // 3. Navigation & Journey Events (Điều Hướng)
  navLandingView: () => logGAEvent("nav_landing_view"),
  navViewVideoDetail: (params: {
    video_id?: string | number;
    title?: string;
  }) => logGAEvent("nav_view_video_detail", params),
  navBackClick: (params: { from_step?: string; from_view?: string }) =>
    logGAEvent("nav_back_click", params),
  navWatchCtaClick: () => logGAEvent("nav_watch_cta_click"),

  // 4. Registration Flow Events (Quy Trình Đăng Ký)
  registrationStart: (params?: any) => logGAEvent("registration_start", params),
  registrationStepView: (params: { step: string }) =>
    logGAEvent("registration_step_view", params),
  registrationError: (params: { message: string; step?: string }) =>
    logGAEvent("registration_error", params),
  authPhoneSubmit: (params: { phone_number: string }) =>
    logGAEvent("auth_phone_submit", params),
  authOtpSubmit: (params: { transaction_id: string }) =>
    logGAEvent("auth_otp_submit", params),
  authUseAnotherNumber: () => logGAEvent("auth_use_another_number"),
  authCloseModal: (params: { current_step: string }) =>
    logGAEvent("auth_close_modal", params),
};
