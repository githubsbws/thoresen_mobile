import { api } from './api';

export interface AboutData {
  id: number;
  title: string | null;
  detail: string | null;
}

export interface AboutResponse {
  about: AboutData | null;
}

export async function getAbout(
  langId = 1,
): Promise<AboutResponse> {
  const res = await api.get<AboutResponse>(
    `/about?langId=${langId}`,
  );

  return res.data;
}