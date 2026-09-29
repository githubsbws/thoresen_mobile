import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------
  // Media URL helper
  //  path pattern (`library/{id}/original/{filename}`,
  // `gallery/{id}/original/{image}`) ยังเป็นการเดาตาม convention
  // ของ Course module (courseonline/{id}/original/{file})
  // ถ้า media server เก็บ path จริงคนละแบบ ต้องแก้ตรงนี้จุดเดียว
  // -------------------------------------------------------------
  private getMediaUrl(path: string | null): string | null {
    if (!path) {
      return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${process.env.MEDIA_URL}/${path.replace(/^\//, '')}`;
  }

  // ตาราง tbl_library_file ไม่มี field แยก "เอกสาร กับ วิดีโอ" ตรง ๆ
  // (library_type_id ใน tbl_library_type รับได้ทั้งสองแบบปนกัน)
  // เลยต้องเช็คจากนามสกุลไฟล์จริงแทน
  private isVideoFile(filename: string | null): boolean {
    const videoExt = ['.mp4', '.mkv', '.avi', '.mp3'];
    return (
      !!filename &&
      videoExt.some((ext) => filename.toLowerCase().endsWith(ext))
    );
  }

  async getLibraryData() {
    // =============================================================
    // Documents / Videos — จาก tbl_library_file + tbl_library_type
    // =============================================================
    const files = await this.prisma.tbl_library_file.findMany({
      where: { active: 'y' },
      include: { tbl_library_type: true },
      orderBy: { created_date: 'desc' },
    });

    const documents = files
      .filter((f) => !this.isVideoFile(f.library_filename))
      .map((f) => ({
        id: f.library_id,
        title: f.library_name,
        category: f.tbl_library_type?.library_type_name ?? null,
        fileUrl: this.getMediaUrl(
          `library/${f.library_id}/original/${f.library_filename}`,
        ),
      }));

    const videos = files
      .filter((f) => this.isVideoFile(f.library_filename))
      .map((f) => ({
        id: f.library_id,
        title: f.library_name,
        videoUrl: this.getMediaUrl(
          `library/${f.library_id}/original/${f.library_filename}`,
        ),
      }));

    // =============================================================
    // Gallery — จาก tbl_gallery_group + tbl_gallery_type + tbl_gallery
    // 1 group_gallery = 1 การ์ดโฟลเดอร์ในแอป
    // ชื่อโฟลเดอร์ดึงจาก tbl_gallery_type.name_gallery_type (join ผ่าน gallery_type_id)
    // วันที่ของโฟลเดอร์ใช้ tbl_gallery_group.create_date 
    // =============================================================
    const groups = await this.prisma.tbl_gallery_group.findMany({
      where: { active: 'y' },
      include: {
        tbl_gallery_type: true,
        tbl_gallery: { where: { active: 'y' } },
      },
      orderBy: { create_date: 'desc' },
    });

    const gallery = groups
      // ตัดกลุ่มที่รูปข้างในถูกลบ/ปิดใช้งานจนไม่เหลือรูปเลยทิ้ง
      .filter((g) => g.tbl_gallery.length > 0)
      .map((g) => ({
        id: g.id,
        title: g.tbl_gallery_type?.name_gallery_type ?? '',
        coverImage: this.getMediaUrl(
          `gallery/${g.tbl_gallery[0].id}/original/${g.tbl_gallery[0].image}`,
        ),
        date: g.create_date ? g.create_date.toISOString() : null,
        images: g.tbl_gallery.map((img) =>
          this.getMediaUrl(`gallery/${img.id}/original/${img.image}`),
        ),
      }));

    return {
      success: true,
      data: {
        documents,
        videos,
        gallery,
      },
    };
  }
}






// import { Injectable } from '@nestjs/common';
// // import { PrismaService } from '../prisma/prisma.service'; // <-- ปลดคอมเมนต์เมื่อต่อ DB จริง

// @Injectable()
// export class LibraryService {
//   // constructor(private readonly prisma: PrismaService) {} // <-- ปลดคอมเมนต์เมื่อต่อ DB จริง

//   async getLibraryData() {
//     // Mock Data สำหรับทดสอบก่อนเชื่อมต่อ Database จริง
//     return {
//       success: true,
//       data: {
//         documents: [
//           {
//             id: 'it-onboard-2020',
//             title: 'IT-Onboard Training 2020',
//             category: 'IT-Onboard',
//             image:
//               'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600',
//             fileUrl:
//               'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
//           },
//         ],
//         videos: [
//           {
//             id: 'training-01',
//             title: 'Training Video',
//             image:
//               'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
//             videoUrl:
//               'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
//           },
//         ],
//         gallery: [
//           // หมายเหตุ: 
//           // field "date" ตรงนี้จำลองค่าที่จริง ๆ จะมาจาก galleryFolder.createdAt ใน DB
//           // ส่งเป็น ISO string เสมอ (เหมือนที่ Prisma DateTime จะ serialize เป็น JSON)
//           // ฝั่ง frontend (library.tsx) จะรับผิดชอบ format ให้อ่านง่าย
//           // ถ้าจะเพิ่ม/ลบ field ตรงนี้ ให้เช็ค GalleryFolderItem type ใน library.tsx ให้ตรงกันด้วย
//           {
//             id: 'folder-outing-2026',
//             title: 'Company Outing 2026',
//             coverImage:
//               'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
//             date: '2026-03-14T00:00:00.000Z',
//             images: [
//               'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000',
//               'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000',
//               'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000',
//             ],
//           },
//           {
//             id: 'folder-csr-2025',
//             title: 'CSR & Charity Day',
//             coverImage:
//               'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',
//             date: '2025-11-02T00:00:00.000Z',
//             images: [
//               'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1000',
//               'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1000',
//             ],
//           },
//         ],
//       },
//     };

//     /* 
//     // -------------------------------------------------------------
//     // ดึงข้อมูลจาก Database ผ่าน Prisma จริง
//     // ปลดคอมเมนต์ตรงนี้ + คอมเมนต์ปิด return Mock Data ข้างบน 
//     // -------------------------------------------------------------

//     // ดึงข้อมูลเอกสารทั้งหมด
//     const documents = await this.prisma.libraryDocument.findMany({
//       orderBy: { createdAt: 'desc' },
//     });

//     // ดึงข้อมูลวิดีโอทั้งหมด
//     const videos = await this.prisma.libraryVideo.findMany({
//       orderBy: { createdAt: 'desc' },
//     });

//     // ดึงข้อมูลโฟลเดอร์แกลเลอรีพร้อมรูปภาพภายใน
//     const galleryFolders = await this.prisma.galleryFolder.findMany({
//       include: {
//         images: true,
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     // แปลงโครงสร้างข้อมูลแกลเลอรีให้ตรงกับ Mobile App
//     // ส่ง "date" ที่ดึงมาจาก DB จริง (folder.createdAt) แทนการนับจำนวนรูป (itemCount เดิม)
//     // toISOString() เพื่อให้ frontend ได้รูปแบบ string ที่ format ได้ตรงกันทุกเครื่อง
//     const gallery = galleryFolders.map((folder) => ({
//       id: folder.id,
//       title: folder.title,
//       coverImage: folder.coverImage,
//       date: folder.createdAt.toISOString(),
//       images: folder.images.map((img) => img.imageUrl),
//     }));

//     // ส่งข้อมูลคืนกลับไปให้ Mobile App
//     return {
//       success: true,
//       data: {
//         documents,
//         videos,
//         gallery,
//       },
//     };
//     */
//   }
// }