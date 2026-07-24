
export const toProxyUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("https://animemedia.ringme.vn")) {
    return url.replace("https://animemedia.ringme.vn", "/animemedia");
  }
  return url;
};
