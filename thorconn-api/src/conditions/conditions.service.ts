import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConditionClause {
  number: string;
  text: string;
}

export interface ConditionDetail {
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

@Injectable()
export class ConditionsService {
  constructor(private readonly prisma: PrismaService) {}

  private decodeHtmlEntities(str: string): string {
    if (!str) return '';
    let res = str;
    // Decode &amp; multiple times to handle double-escaped entities like &amp;amp; or &amp;rsquo;
    res = res.replace(/&amp;/g, '&');
    res = res.replace(/&amp;/g, '&');
    res = res
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/http:\/\/thorconn\.com/gi, 'https://thorconn.com');
    return res;
  }

  private cleanTitle(title: string | null): string | null {
    if (!title) return null;
    return this.decodeHtmlEntities(title).trim();
  }

  async getConditions(langId = 1): Promise<{ condition: ConditionDetail | null }> {
    let condition = await this.prisma.tbl_conditions.findFirst({
      where: {
        lang_id: langId,
        active: 'y',
      },
      orderBy: {
        conditions_id: 'asc',
      },
    });

    if (!condition && langId !== 1) {
      condition = await this.prisma.tbl_conditions.findFirst({
        where: {
          lang_id: 1,
          active: 'y',
        },
        orderBy: {
          conditions_id: 'asc',
        },
      });
    }

    if (!condition) {
      return { condition: null };
    }

    const decoded = this.decodeHtmlEntities(condition.conditions_detail || '');

    // Parse into structured elements
    const rawParagraphs = decoded
      .replace(/<br\s*\/?>/gi, '\n')
      .split(/<\/p>/i)
      .map((p) => p.replace(/<[^>]+>/g, '').trim())
      .filter((p) => p.length > 0);

    let intro: string | null = null;
    const items: ConditionClause[] = [];
    let contactNote: string | null = null;

    for (const para of rawParagraphs) {
      const match = para.match(/^(\d+)[\.\)]\s*(.*)$/s);
      if (match) {
        const num = parseInt(match[1], 10);
        items.push({
          number: num < 10 ? `0${num}` : `${num}`,
          text: match[2].trim(),
        });
      } else if (!intro && items.length === 0) {
        intro = para;
      } else {
        contactNote = para;
      }
    }

    return {
      condition: {
        id: condition.conditions_id,
        title: this.cleanTitle(condition.conditions_title),
        intro,
        items,
        contactNote,
        contactEmail: 'Shipping-IT@thoresen.com',
        termsUrl: 'https://thorconn.com/dashboard/terms',
        rawHtml: decoded,
        langId: condition.lang_id,
      },
    };
  }
}
