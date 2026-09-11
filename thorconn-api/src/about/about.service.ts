import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AboutService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  private fixMediaUrls(html: string | null): string | null {
    if (!html) {
        return null;
    }

    return html
        .replace(/http:\/\//g, 'https://')
        .replace(
        /src=["']\/uploads\//g,
        'src="https://thorconn.com/uploads/',
        );
    }
  async getAbout(langId = 1) {
    let about = await this.prisma.tbl_about.findFirst({
      where: {
        lang_id: langId,
        active: 'y',
      },
      orderBy: {
        about_id: 'asc',
      },
    });

    let actualLangId = langId;

    // ถ้าไม่มีข้อมูลภาษาที่ต้องการ
    // fallback เป็นภาษา 1
    if (!about && langId !== 1) {
      about = await this.prisma.tbl_about.findFirst({
        where: {
          lang_id: 1,
          active: 'y',
        },
        orderBy: {
          about_id: 'asc',
        },
      });

      actualLangId = 1;
    }

    // ถ้ามี about ใช้ภาษาที่ได้จริง
    // ถ้าไม่มี about เลย ใช้ภาษา 1
    const labelLangId = about
      ? actualLangId
      : 1;

    const label =
      await this.prisma.tbl_menu_about.findFirst({
        where: {
          lang_id: labelLangId,
        },
        orderBy: {
          id: 'asc',
        },
      });

    let detail = about?.about_detail ?? null;

    // Yii เดิม:
    // str_replace('http://', 'https://', ...)
    if (detail) {
      detail = detail.replace(
        /http:\/\//gi,
        'https://',
      );
    }

    return {
      about: about
        ? {
            id: about.about_id,
            title: about.about_title,
            detail: this.fixMediaUrls(about.about_detail),
            langId: about.lang_id,
          }
        : null,

      label: label
        ? {
            about: label.label_about,
            homepage: label.label_homepage,
          }
        : null,
    };
  }
}