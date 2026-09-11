import { api } from './api';

export interface Banner {
  id: number;
  title: string;
  image: string;
  link: string | null;
  gallery_type_id: string | null;
}

export interface Course {
  id: number;
  title: string;
  shortTitle: string | null;
  detail: string | null;
  picture: string | null;
  courseDateStart: string | null;
  courseDateEnd: string | null;
  courseDayLearn: number | null;
  genId: number | null;
  courseOpen: boolean;
  started: boolean;
  userCourseExpired: boolean;
  status: string;
  action: string;
  url: string;
}

export interface News {
  id: number;
  title: string;
  shortTitle: string | null;
  picture: string | null;
  link: string | null;
  newTab: boolean;
  sortOrder: number | null;
  createDate: string | null;
  updateDate: string | null;
}

export interface Video {
  id: number;
  title: string;
  path: string | null;
  type: string | null;
  thumbnail: string | null;
  embedUrl: string | null;
  credit: string | null;
}

export interface HomeData {
  banners: Banner[];
  courses: Course[];
  news: News[];
  videos: Video | null;
}

export async function getHome(): Promise<HomeData> {
  const res = await api.get<HomeData>('/home');

  return res.data;
}