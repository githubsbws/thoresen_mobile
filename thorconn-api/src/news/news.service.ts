import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

// ==============================================================================
// ใช้ MEDIA_URL จาก .env เป็น Base URL สำหรับไฟล์ Media
//
// .env:
// MEDIA_URL=https://thorconn.com/uploads
//
// Example:
// path = news/267/original/22072026162529_Picture.png
//
// Result:
// https://thorconn.com/uploads/news/267/original/22072026162529_Picture.png
// ==============================================================================


// ==============================================================================
// ตัด HTML tag ออกจาก cms_detail / cms_short_title ให้เหลือ plain text
//
// เหตุผล: cms_detail เก็บเป็น HTML ดิบ (มี <p>, <img>, &nbsp; ฯลฯ ฝังอยู่)
// แต่หน้าบ้านโชว์ด้วย <Text>{news.content}</Text> ธรรมดา ซึ่งไม่ได้ render HTML
// ถ้าไม่ตัด tag ออกก่อน ผู้ใช้จะเห็น <p>...</p> โผล่มาเป็นตัวหนังสือตรงๆ
// ==============================================================================

function stripHtml(html: string | null): string {
  if (!html) return '';

  // หมายเหตุ: cms_detail บางข่าวมี <img> ฝังอยู่กลางเนื้อหา
  // การ strip tag แบบนี้จะเอารูปพวกนั้นออกไปด้วย เหลือแต่ข้อความล้วน
  // ถ้าอยากให้รูปกลางเนื้อหาโชว์ด้วย ต้องเปลี่ยนไปใช้ library render HTML
  // ฝั่ง frontend แทน (เช่น react-native-render-html)
  return html
    // แปลง </p> และ <br> ให้เป็นการขึ้นบรรทัดใหม่ ก่อนตัด tag อื่นทิ้ง
    .replace(/<\/p>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '') // ตัด tag HTML ที่เหลือทั้งหมดทิ้ง
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n') // กันบรรทัดว่างซ้อนกันเยอะเกินไป
    .trim();
}

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================================================
  // สร้าง URL สำหรับ Media
  //
  // ใช้แนวทางเดียวกับ HomeService ของพี่เลี้ยง
  // ==========================================================================

  private getMediaUrl(path: string | null): string | null {
    if (!path) {
      return null;
    }

    // ถ้า path เป็น URL เต็มอยู่แล้ว
    // ให้ใช้ URL เดิมโดยไม่ต้องต่อ MEDIA_URL ซ้ำ
    if (
      path.startsWith('http://') ||
      path.startsWith('https://')
    ) {
      return path;
    }

    return `${process.env.MEDIA_URL}/${path.replace(/^\//, '')}`;
  }

  // ==========================================================================
  // GET ALL NEWS
  //
  // ==========================================================================

  async findAll() {
    console.log('========== NEWS DEBUG ==========');

    const allRows = await this.prisma.tbl_news.findMany({
      take: 10,
    });

    console.log('ALL NEWS SAMPLE:', allRows);

    const filteredRows = await this.prisma.tbl_news.findMany({
      where: {
        active: 'y',

        //lang_id: 1,            // 1 = อังกฤษ, 2 = ไทย

      },
      orderBy: {
        create_date: 'desc',
      },
    });

    console.log('FILTERED NEWS COUNT:', filteredRows.length);
    console.log(
      'FILTERED NEWS SAMPLE:',
      filteredRows.slice(0, 3),
    );

    const result = filteredRows.map((row) =>
      this.mapNewsRow(row),
    );

    // Debug URL รูปที่ Backend สร้าง
    console.log('========== NEWS IMAGE DEBUG ==========');

    result.slice(0, 10).forEach((item) => {
      console.log({
        id: item.id,
        title: item.title,
        image: item.image,
      });
    });

    return result;
  }

  // ==========================================================================
  // GET NEWS BY ID
  //
  // cms_id เป็น Int ใน DB จริง แต่ @Param() จาก controller ส่งมาเป็น string
  // เสมอ ต้อง Number(id) ก่อนใช้กับ Prisma
  // ==========================================================================

  async findOne(id: string) {
    const cmsId = Number(id);

    if (Number.isNaN(cmsId)) {
      throw new NotFoundException(
        `Invalid news ID: ${id}`,
      );
    }

    const row = await this.prisma.tbl_news.findUnique({
      where: {
        cms_id: cmsId,
      },
    });

    if (!row || row.active !== 'y') {
      throw new NotFoundException(
        `News with ID ${id} not found`,
      );
    }

    return this.mapNewsRow(row);
  }

  // ==========================================================================
  // แปลงข้อมูลดิบจาก tbl_news
  // ให้เป็นรูปแบบที่ Frontend (NewsItem) ต้องการ
  // ==========================================================================

  private mapNewsRow(row: {
    cms_id: number;
    cms_title: string | null;
    cms_short_title: string | null;
    cms_detail: string | null;
    cms_picture: string | null;
    create_date: Date | null;
  }) {
    return {
      id: String(row.cms_id),

      title: row.cms_title ?? '',

      // TODO: ยังไม่มี column category จริงใน tbl_news
      // ใส่ค่า default ไปก่อน
      category: 'ข่าวสาร',

      date: row.create_date
        ? row.create_date.toLocaleDateString('th-TH')
        : '',

      // cms_short_title ใกล้เคียงกับ "สรุปย่อ"
      // ที่ frontend ใช้โชว์บนการ์ด
      detail: stripHtml(row.cms_short_title),

      // cms_detail เป็น HTML ดิบ
      // หน้าบ้านใช้ Text ธรรมดา จึง strip HTML ออกก่อน
      content: stripHtml(row.cms_detail),

      // =========================================================================
      // NEWS IMAGE
      //
      // DB:
      // cms_id      = 267
      // cms_picture = 22072026162529_Picture.png
      //
      // path:
      // news/267/original/22072026162529_Picture.png
      //
      // MEDIA_URL:
      // https://thorconn.com/uploads
      //
      // ผลลัพธ์:
      // https://thorconn.com/uploads/news/267/original/22072026162529_Picture.png
      // =========================================================================

      image: row.cms_picture
        ? this.getMediaUrl(
            `news/${row.cms_id}/original/${row.cms_picture}`,
          )
        : null,
    };
  }
}