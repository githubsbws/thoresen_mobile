import { api } from './api';

export interface FAQItemData {
  id: number;
  category: string;
  question: string | null;
  answer: string | null;
  sortOrder: number | null;
  typeId: number;
}

export interface FAQData {
  faqs: FAQItemData[];
}

export async function getFaq(langId: number): Promise<FAQData> {
  const res = await api.get<FAQData>('/v1/faq', {
    params: {
      langId,
    },
  });

  return res.data;
}