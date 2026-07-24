import {
  decryptLandingData,
  decryptVideoPath,
  decryptPlainText,
} from "@/crypto/crypto";

// --- CONFIGURATION ---
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://192.168.1.158:8085";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "X9gPqF6m4Qd2Zy8e3R5uWb7cA0hVj1KxL2MfTqS8aYz";

// --- INTERFACES ---
export interface Movie {
  id: string | number;
  title: string;
  description: string;
  src: string;
  poster: string;
  views?: string;
  type?: "vertical" | "horizontal";
  category?: string;
  cateId?: number | string;
  trial_duration?: number;
  package_description?: string;
  package_name?: string;
  status?: number;
  package_id?: number;
  idStr?: string;
}

export interface CategorySection {
  id: string;
  title: string;
  videos: Movie[];
  layoutType: "top-video" | "top-view" | "trending" | "two-row" | "discover";
}

export interface Banner {
  id: number;
  name: string;
  title: string;
  description?: string;
  package_description?: string;
  tag?: string;
  deeplink?: string;
  image_mobile: string;
  image_pc?: string;
  package_id?: number;
  package_name?: string;
  internal_link?: string;
}

export interface HomeData {
  shortVideos: Movie[];
  homeSections: CategorySection[];
  banners: Banner[];
  discoverCategories: { id: string; title: string }[];
}

export interface Category {
  id: number;
  name: string;
  display_order: number;
  display_type: number;
  status: number;
}

export interface GetVideoByCategoryParams {
  cp_id?: string;
  cate_id?: string;
  limit?: number;
  offset?: number;
}

export interface LogViewParams {
  video_id: string | number;
  timestamp: number;
}

export interface LogViewTimeParams {
  session_id: string | number;
  video_id: string | number;
  watch_duration: number;
  timestamp: number;
}

// --- HELPERS FOR MAPPING ---

/**
 * Maps raw API data to the Movie interface
 */
function mapToMovie(item: any, defaultCateName: string = ""): Movie {
  const videoSrc = item.media_path
    ? decryptVideoPath(item.media_path) || ""
    : item.url_video || item.link_play || "";
  return {
    id: item.id || Math.random().toString(),
    title: item.name || item.title || "Untitled",
    description: item.description || "",
    src: videoSrc,
    poster: item.thumbnail || item.avatar || item.image || "",
    category: item.cate_name || defaultCateName,
    cateId: item.cate_id,
    views: item.view_count?.toString() || "0",
    trial_duration: item.trial_duration,
    type: item.video_type === 1 ? "vertical" : "horizontal",
    package_description: item.package_description,
    package_name: item.package_name,
    package_id: item.package_id,
    idStr: item.idStr,
  };
}

function defaultMovie(id: string): Movie {
  return {
    id,
    title: "",
    description: "",
    src: "",
    poster: "",
    views: "0",
    type: "horizontal",
  };
}

// --- API SERVICES ---

/**
 * Fetches Home page data (Banners, Sections)
 */
const fetchHomeData = async (cpId?: string): Promise<HomeData> => {
  const query = cpId ? `?cp_id=${cpId}` : "";
  const url = `${API_BASE}/api/landing-page/get-home${query}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const body = await res.json();

    let result: any = {};
    if (body && body.code === 200 && body.data) {
      result = decryptLandingData(body.data) || {};
    } else {
      result = body?.result || {};
    }

    // Mapping Banners
    let banners: Banner[] = [];
    if (Array.isArray(result.banner)) {
      banners = result.banner.map((b: any) => ({
        id: b.id,
        name: b.name,
        title: b.title || b.name || "",
        description: b.description || "",
        tag: b.tag || b.label || "",
        image_mobile:
          b.image_mobile ||
          (b.media_path_wap
            ? b.media_path_wap.startsWith("http")
              ? b.media_path_wap
              : `${API_BASE}/${b.media_path_wap}`
            : ""),
        image_pc:
          b.image_pc ||
          (b.media_path_web
            ? b.media_path_web.startsWith("http")
              ? b.media_path_web
              : `${API_BASE}/${b.media_path_web}`
            : undefined),
        package_id: b.package_id,
        package_name: b.package_name,
        deeplink: b.deeplink,
        internal_link: b.internal_link,
      }));
    }

    // Mapping Sections
    const homeSections: CategorySection[] = [];
    const discoverCategories: { id: string; title: string }[] = [];
    let discoverVideos: Movie[] = [];
    const layouts: CategorySection["layoutType"][] = [
      "top-video",
      "top-view",
      "trending",
      "two-row",
    ];

    if (Array.isArray(result.cate)) {
      result.cate.forEach((c: any, index: number) => {
        if (!c.items || !Array.isArray(c.items)) return;

        const videos: Movie[] = c.items.map((item: any) =>
          mapToMovie(item, c.title || ""),
        );

        if (index < 4) {
          homeSections.push({
            id: c.tab_id?.toString() || `cat-${index}`,
            title: c.title || "Section",
            videos: videos,
            layoutType: layouts[index % layouts.length],
          });
        } else {
          discoverCategories.push({ id: c.tab_id?.toString(), title: c.title });
          discoverVideos = discoverVideos.concat(videos);
        }
      });
    }

    if (discoverCategories.length > 0) {
      homeSections.push({
        id: "discover-section",
        title: "Explore Other Topics",
        videos: discoverVideos,
        layoutType: "discover",
      });
    }
    return { banners, homeSections, shortVideos: [], discoverCategories };
  } catch (error: any) {
    console.error("[fetchHomeData] Error:", error.message || error);
    if (error.cause) console.error("[fetchHomeData] Cause:", error.cause);
    return {
      banners: [],
      homeSections: [],
      shortVideos: [],
      discoverCategories: [],
    };
  }
};

/**
 * Fetches detailed info for a single Video
 */
const fetchVideoById = async (id: string, cpId?: string): Promise<Movie> => {
  const cpQuery = cpId ? `&cp_id=${cpId}` : "";
  const url = `${API_BASE}/api/landing-page/get-video-by-id?video_id=${id}${cpQuery}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "X-API-KEY": API_KEY },
      cache: "no-store",
    });
    const body = await res.json();
    const result =
      body && body.code === 200 && body.data
        ? decryptLandingData(body.data)
        : body?.result;
    if (result) return mapToMovie(result);
  } catch (error: any) {
    console.error("[fetchVideoById] Error:", error.message || error);
    if (error.cause) console.error("[fetchVideoById] Cause:", error.cause);
  }
  return defaultMovie(id);
};

/**
 * Fetches video list by Category (with decryption)
 */
const fetchVideoByCategory = async (
  params: GetVideoByCategoryParams,
): Promise<Movie[]> => {
  const query = new URLSearchParams();
  if (params.cp_id) query.append("cp_id", params.cp_id);
  if (params.cate_id) query.append("cate_id", params.cate_id);
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.offset) query.append("offset", params.offset.toString());

  const url = `${API_BASE}/api/landing-page/get-video-by-category?${query.toString()}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "X-API-KEY": API_KEY },
      cache: "no-store",
    });
    const body = await res.json();
    const result: any[] =
      body && body.code === 200 && body.data
        ? decryptLandingData(body.data)
        : body?.result || [];

    return Array.isArray(result)
      ? result.map((item: any) => mapToMovie(item))
      : [];
  } catch (error) {
    console.error("[fetchVideoByCategory] Error:", error);
    return [];
  }
};

// --- EXPORTED FUNCTIONS ---

export const getHome = async (cpIdParam?: string) => {
  return fetchHomeData(cpIdParam);
};

export const getVideoById = async (id: string, cpIdParam?: string) => {
  return fetchVideoById(id, cpIdParam);
};

export const getVideoByCategory = async (params: GetVideoByCategoryParams) => {
  return fetchVideoByCategory(params);
};

export const getRecommendedVideos = async (
  id: string,
  cateId?: string | number,
  cpId?: string,
) => {
  if (!cateId) return [];
  const videos = await getVideoByCategory({
    cate_id: cateId.toString(),
    limit: 12,
    cp_id: cpId,
  });
  return videos.filter((v) => String(v.id) !== String(id));
};

export const requestOtp = async (
  packageId: string | number,
  msisdn: string,
  from_source?: string | number,
  source_id?: string | number,
) => {
  try {
    const query = new URLSearchParams();
    query.append("package_id", packageId.toString());
    query.append("msisdn", msisdn);

    if (from_source !== undefined) {
      query.append("from_source", from_source.toString());
    }
    if (source_id !== undefined) {
      query.append("source_id", source_id.toString());
    }

    const url = `${API_BASE}/api/landing-page/request-otp?${query.toString()}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "X-API-KEY": API_KEY },
      cache: "no-store",
    });

    const body = await res.json();

    return body;
  } catch (error) {
    // console.error("[requestOtp] Error:", error);
    return null;
  }
};

export const submitOtp = async (
  msisdn: string,
  transactionId: string,
  otp: string,
) => {
  try {
    const url = `${API_BASE}/api/landing-page/input-otp`;

    // Body JSON
    const payload = {
      msisdn,
      transaction_id: transactionId,
      otp,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = await res.json();

    return body;
  } catch (error) {
    console.error("[submitOtp] Error:", error);
    return null;
  }
};

// --- LOGGING & ACTIONS ---

export const logView = async (params: LogViewParams & { cp_id?: string }) => {
  const cpQuery = params.cp_id ? `&cp_id=${params.cp_id}` : "";
  const url = `${API_BASE}/api/landing-page/log-view?video_id=${params.video_id}&timestamp=${params.timestamp}${cpQuery}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "X-API-KEY": API_KEY },
    cache: "no-store",
  });
  const data = await res.json();

  return data;
};

export const logViewTime = async (
  params: LogViewTimeParams & { cp_id?: string },
) => {
  const cpQuery = params.cp_id ? `&cp_id=${params.cp_id}` : "";
  const url = `${API_BASE}/api/landing-page/log-view-time?session_id=${params.session_id}&video_id=${params.video_id}&watch_duration=${params.watch_duration}&timestamp=${params.timestamp}${cpQuery}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "X-API-KEY": API_KEY },
    cache: "no-store",
  });
  const data = await res.json();

  return data;
};
