import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export interface CreateComplaintDto {
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

@Injectable()
export class ComplaintService {
  constructor(private readonly prisma: PrismaService) {}

  async getShips() {
    const ships = await this.prisma.tbl_ship.findMany({
      where: { active: 'y' },
      orderBy: { ship_name: 'asc' },
    });

    const seen = new Set<string>();
    const uniqueShips: { id: number; name: string; nameEn: string }[] = [];

    for (const s of ships) {
      const name = (s.ship_name || '').trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        uniqueShips.push({
          id: s.ship_id,
          name: s.ship_name ?? name,
          nameEn: s.ship_name_en ?? name,
        });
      }
    }

    return { ships: uniqueShips };
  }

  getCaptcha() {
    // Generate 4-digit security code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    return { code };
  }

  async createComplaint(data: CreateComplaintDto, clientIp?: string) {
    if (!data.ship || data.ship === '-- SELECT --') {
      throw new BadRequestException('Please select a vessel');
    }
    if (!data.dateOfProblem) {
      throw new BadRequestException('Please select date of problem');
    }
    if (!data.message || !data.message.trim()) {
      throw new BadRequestException('Please enter complaint message');
    }

    let reportPic: string | null = null;

    if (data.imageBase64) {
      try {
        const ext = data.imageName?.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}.${ext}`;
        const uploadDir = path.join(process.cwd(), 'uploads', 'complaints');

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, 'base64'));
        reportPic = filename;
      } catch (err) {
        console.error('Error saving complaint image:', err);
      }
    }

    const created = await this.prisma.tbl_report_complaint.create({
      data: {
        ship: data.ship,
        date_of_problem: data.dateOfProblem,
        message: data.message.trim(),
        report_pic: reportPic,
        status: 'wait',
        report_date: new Date(),
        ip: clientIp || null,
        firstname: data.firstname || null,
        lastname: data.lastname || null,
        email: data.email || null,
        tel: data.tel || null,
      },
    });

    return {
      success: true,
      message: 'Complaint submitted successfully',
      id: created.id,
    };
  }
}
