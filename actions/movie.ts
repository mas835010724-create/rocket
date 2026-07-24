"use server";

import {
  getVideoByCategory,
  getRecommendedVideos,
  getVideoById,
  GetVideoByCategoryParams,
} from "@/services/movieService";

export async function fetchVideoByCategoryAction(
  params: GetVideoByCategoryParams,
) {
  return await getVideoByCategory(params);
}

export async function fetchRecommendedVideosAction(
  id: string,
  cateId?: string | number,
) {
  return await getRecommendedVideos(id, cateId);
}

export async function fetchVideoByIdAction(id: string) {
  return await getVideoById(id);
}
