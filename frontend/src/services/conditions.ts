import { api } from './api';

export interface ConditionClause {
  number: string;
  text: string;
}

export interface ConditionData {
  id: number;
  title: string | null;
  intro: string | null;
  items: ConditionClause[];
  contactNote: string | null;
  contactEmail: string;
  termsUrl: string;
  rawHtml: string | null;
  langId: number | null;
}

export interface ConditionResponse {
  condition: ConditionData | null;
}

export async function getConditions(
  langId = 1,
): Promise<ConditionResponse> {
  const res = await api.get<ConditionResponse>(
    `/conditions?langId=${langId}`,
  );

  return res.data;
}
