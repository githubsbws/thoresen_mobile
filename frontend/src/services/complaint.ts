import { api } from './api';

export interface ShipItem {
  id: number;
  name: string;
  nameEn: string;
}

export interface ShipsResponse {
  ships: ShipItem[];
}

export interface CaptchaResponse {
  code: string;
}

export interface CreateComplaintPayload {
  ship: string;
  dateOfProblem: string;
  message: string;
  imageBase64?: string;
  imageName?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  tel?: string;
}

export interface CreateComplaintResponse {
  success: boolean;
  message: string;
  id?: number;
}

export async function getComplaintShips(): Promise<ShipsResponse> {
  const res = await api.get<ShipsResponse>('/complaint/ships');
  return res.data;
}

export async function getComplaintCaptcha(): Promise<CaptchaResponse> {
  const res = await api.get<CaptchaResponse>('/complaint/captcha');
  return res.data;
}

export async function submitCrewComplaint(
  payload: CreateComplaintPayload,
): Promise<CreateComplaintResponse> {
  const res = await api.post<CreateComplaintResponse>('/complaint', payload);
  return res.data;
}
