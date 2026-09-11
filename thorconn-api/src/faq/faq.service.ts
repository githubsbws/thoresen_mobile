import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FaqItem {
  id: number;
  category: string;
  question: string | null;
  answer: string | null;
  hideStatus: number | null;
  sortOrder: number | null;
}

export interface FaqData {
  faqs: FaqItem[];
}

@Injectable()
export class FaqService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getFaq(langId = 1): Promise<FaqData> {
    const faqTypes =
      await this.prisma.cms_faq_type.findMany({
        where: {
          active: 'y',
          lang_id: langId,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

    const faqs =
      await this.prisma.cms_faq.findMany({
        where: {
          active: 'y',
          lang_id: langId,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

    const typeMap = new Map<number, string>();

    for (const type of faqTypes) {
      typeMap.set(
        type.faq_type_id,
        type.faq_type_title_TH ?? '',
      );
    }

    return {
      faqs: faqs.map((faq) => ({
        id: faq.faq_nid_,
        category:
          typeMap.get(faq.faq_type_id) ?? '',
        question: faq.faq_THtopic,
        answer: faq.faq_THanswer,
        hideStatus: faq.faq_hideStatus,
        sortOrder: faq.sortOrder,
      })),
    };
  }
}