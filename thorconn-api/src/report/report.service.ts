// src/report/report.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** ค่าที่ frontend ส่งมาคือ placeholder (ยังไม่ได้เลือก) */
function isPlaceholder(val?: string): boolean {
    if (!val) return true;
    const lower = val.trim().toLowerCase();
    return (
        lower.startsWith('select') ||
        lower.startsWith('เลือก') ||
        lower === '' ||
        lower === 'undefined' ||
        lower === 'null' ||
        lower === 'all'
    );
}

/** แปลง DD-MM-YYYY -> Date object */
function parseDMY(val?: string): Date | null {
    if (!val || val.trim() === '') return null;
    const parts = val.split('-');
    if (parts.length !== 3) return null;
    let [d, m, y] = parts;
    // กรณี format YYYY-MM-DD
    if (d.length === 4) {
        const temp = d;
        d = y;
        y = temp;
    }
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
}

@Injectable()
export class ReportService {
    constructor(private readonly prisma: PrismaService) { }

    async getUserReport(userId: number) {
        const totalCourses = await this.prisma.tbl_course_online.count({
            where: { active: 'y', status: '1' },
        });
        const completedCourses = await this.prisma.tbl_coursepasscours.count({
            where: { passcours_user: userId },
        });
        return {
            userId,
            totalCourses,
            completedCourses,
            progressPercentage: totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0,
        };
    }

    /**
     * รายงานการลงทะเบียน (Register Reports): ภาพรวม, ลูกเรือ (Ship), และพนักงานสำนักงาน (Office)
     * ดึงข้อมูลจริงจาก tbl_users และ tbl_profiles พร้อม lookup ชื่อสังกัดจาก tbl_department และ tbl_position
     */
    async getOverviewReport(query: any) {
        const totalCourses = await this.prisma.tbl_course_online.count({ where: { active: 'y' } });

        // Lookup maps สำหรับ Department และ Position
        const [depts, positions, divisions] = await Promise.all([
            this.prisma.tbl_department.findMany({ select: { id: true, dep_title: true } }),
            this.prisma.tbl_position.findMany({ select: { id: true, position_title: true } }),
            this.prisma.tbl_division.findMany({ select: { id: true, div_title: true } }),
        ]);

        const deptMap = new Map<number, string>(depts.map(d => [d.id, d.dep_title || '']));
        const posMap = new Map<number, string>(positions.map(p => [p.id, p.position_title || '']));
        const divMap = new Map<number, string>(divisions.map(dv => [dv.id, dv.div_title || '']));

        const whereCondition: any = {
            del_status: 0,
        };

        // กรองตาม Department
        if (!isPlaceholder(query.department)) {
            const target = query.department.toLowerCase();
            const matchedDeptIds = depts
                .filter(d => d.dep_title && d.dep_title.toLowerCase().includes(target))
                .map(d => String(d.id));

            whereCondition.OR = [
                { department_id: { in: matchedDeptIds } },
                { tbl_profiles: { department: { contains: query.department } } },
            ];
        }

        // กรองตาม Position
        if (!isPlaceholder(query.position)) {
            const target = query.position.toLowerCase();
            const matchedPosIds = positions
                .filter(p => p.position_title && p.position_title.toLowerCase().includes(target))
                .map(p => String(p.id));

            if (whereCondition.OR) {
                whereCondition.AND = [
                    {
                        OR: [
                            { position_id: { in: matchedPosIds } },
                            { tbl_profiles: { position: { contains: query.position } } },
                        ],
                    },
                ];
            } else {
                whereCondition.OR = [
                    { position_id: { in: matchedPosIds } },
                    { tbl_profiles: { position: { contains: query.position } } },
                ];
            }
        }

        // กรองตาม Status
        if (!isPlaceholder(query.status)) {
            const s = query.status.toLowerCase();
            if (s === 'approved' || s === 'active') {
                whereCondition.status = 1;
            } else if (s === 'pending' || s === 'inactive') {
                whereCondition.status = 0;
            }
        }

        // กรองตามช่วงวันที่
        const sd = parseDMY(query.startDate);
        const ed = parseDMY(query.endDate);
        if (sd || ed) {
            whereCondition.create_at = {};
            if (sd) whereCondition.create_at.gte = sd;
            if (ed) {
                // ขยายเวลาไปจนสุดวัน
                const endOfDay = new Date(ed.getTime() + 24 * 60 * 60 * 1000 - 1);
                whereCondition.create_at.lte = endOfDay;
            }
        }

        const users = await this.prisma.tbl_users.findMany({
            where: whereCondition,
            take: 100,
            orderBy: { create_at: 'desc' },
            include: {
                tbl_profiles: true,
            },
        });

        const data = users.map(u => {
            const deptId = Number(u.department_id);
            const posId = Number(u.position_id);
            const divId = Number(u.division_id);

            const department = (!isNaN(deptId) && deptMap.get(deptId)) || u.tbl_profiles?.department || 'General';
            const position = (!isNaN(posId) && posMap.get(posId)) || u.tbl_profiles?.position || 'Staff';
            const division = (!isNaN(divId) && divMap.get(divId)) || u.tbl_profiles?.division_title || 'General';

            const fullName = `${u.tbl_profiles?.firstname || ''} ${u.tbl_profiles?.lastname || ''}`.trim();
            const name = fullName || u.username || `User #${u.id}`;

            return {
                id: u.id,
                name,
                title: name,
                username: u.username,
                email: u.email,
                department,
                dept: department,
                position,
                pos: position,
                division,
                status: u.status === 1 ? 'Approved' : 'Pending',
                registerDate: u.create_at ? u.create_at.toISOString().split('T')[0] : 'N/A',
            };
        });

        // คำนวณสถิติจริงสำหรับนำไปวาดกราฟ (Group by Department)
        const deptStats: Record<string, number> = {};
        data.forEach(item => {
            const label = item.department || 'Other';
            deptStats[label] = (deptStats[label] || 0) + 1;
        });
        const chartData = Object.entries(deptStats).slice(0, 6).map(([label, value]) => ({ label, value }));

        return {
            filters: query,
            totalResults: data.length,
            summary: { totalCourses, totalUsers: data.length },
            chartData,
            data,
        };
    }

    /**
     * รายงานการฝึกอบรม (Training Reports):
     * ดึงข้อมูลคอร์สจริงจาก tbl_course_online
     * และคำนวณสถิติอัตราการผ่าน (Completion Rate) จริงจาก tbl_coursescore
     */
    async getTrainingReport(query: any) {
        const where: any = { active: 'y', status: '1' };
        if (!isPlaceholder(query.course)) {
            where.course_title = { contains: query.course };
        }

        const sd = parseDMY(query.startDate);
        const ed = parseDMY(query.endDate);
        if (sd || ed) {
            where.create_date = {};
            if (sd) where.create_date.gte = sd;
            if (ed) {
                const endOfDay = new Date(ed.getTime() + 24 * 60 * 60 * 1000 - 1);
                where.create_date.lte = endOfDay;
            }
        }

        const courses = await this.prisma.tbl_course_online.findMany({
            where,
            take: 50,
            orderBy: { create_date: 'desc' },
            select: { course_id: true, course_title: true, create_date: true },
        });

        const courseIds = courses.map(c => c.course_id);

        // ดึงสถิติผลสอบจริงตามคอร์สจาก tbl_coursescore
        const scoreGroups = await this.prisma.tbl_coursescore.groupBy({
            by: ['course_id', 'score_past'],
            where: {
                course_id: { in: courseIds },
            },
            _count: { score_id: true },
        });

        const courseStatsMap = new Map<number, { pass: number; fail: number; total: number }>();
        scoreGroups.forEach(g => {
            if (!g.course_id) return;
            const current = courseStatsMap.get(g.course_id) || { pass: 0, fail: 0, total: 0 };
            const count = g._count.score_id;
            current.total += count;
            if (g.score_past?.toLowerCase() === 'y') {
                current.pass += count;
            } else {
                current.fail += count;
            }
            courseStatsMap.set(g.course_id, current);
        });

        const data = courses.map(c => {
            const stats = courseStatsMap.get(c.course_id) || { pass: 0, fail: 0, total: 0 };
            const completionRateNum = stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0;
            return {
                id: c.course_id,
                title: c.course_title,
                startDate: c.create_date ? c.create_date.toISOString().split('T')[0] : 'N/A',
                status: stats.total > 0 ? (completionRateNum >= 70 ? 'Completed' : 'In Progress') : 'Active',
                rate: `${completionRateNum}%`,
                completionRate: `${completionRateNum}%`,
                completionRateNumber: completionRateNum,
                totalTakers: stats.total,
                passedCount: stats.pass,
            };
        });

        const chartData = data.slice(0, 8).map(c => ({
            label: c.title ? c.title.split(' ').slice(0, 2).join(' ') : `Course #${c.id}`,
            value: c.completionRateNumber,
        }));

        return {
            reportType: 'training',
            filters: query,
            totalResults: data.length,
            chartData,
            data,
        };
    }

    /**
     * รายงานผลการทดสอบ (Test Results Report):
     * ดึงข้อมูลคะแนนสอบจริงจาก tbl_coursescore พร้อม join ชื่อคอร์สและผู้เข้าสอบจริง
     */
    async getTestReport(query: any) {
        const scoreWhere: any = {};

        if (!isPlaceholder(query.course)) {
            const matchedCourses = await this.prisma.tbl_course_online.findMany({
                where: { course_title: { contains: query.course }, active: 'y' },
                select: { course_id: true },
            });
            const courseIds = matchedCourses.map(c => c.course_id);
            if (courseIds.length > 0) {
                scoreWhere.course_id = { in: courseIds };
            }
        }

        if (!isPlaceholder(query.userId)) {
            scoreWhere.user_id = Number(query.userId);
        }

        const sd = parseDMY(query.startDate);
        const ed = parseDMY(query.endDate);
        if (sd || ed) {
            scoreWhere.create_date = {};
            if (sd) scoreWhere.create_date.gte = sd;
            if (ed) {
                const endOfDay = new Date(ed.getTime() + 24 * 60 * 60 * 1000 - 1);
                scoreWhere.create_date.lte = endOfDay;
            }
        }

        const scores = await this.prisma.tbl_coursescore.findMany({
            where: scoreWhere,
            take: 50,
            orderBy: { create_date: 'desc' },
        });

        // ดึงชื่อ Course และชื่อ User Profile สำหรับแต่ละรายการผลสอบ
        const uniqueCourseIds = [...new Set(scores.map(s => s.course_id).filter((id): id is number => id !== null))];
        const uniqueUserIds = [...new Set(scores.map(s => s.user_id).filter((id): id is number => id !== null))];

        const [courseRecords, profileRecords] = (await Promise.all([
            uniqueCourseIds.length > 0
                ? this.prisma.tbl_course_online.findMany({
                    where: { course_id: { in: uniqueCourseIds } },
                    select: { course_id: true, course_title: true },
                })
                : [],
            uniqueUserIds.length > 0
                ? this.prisma.tbl_profiles.findMany({
                    where: { user_id: { in: uniqueUserIds } },
                    select: { user_id: true, firstname: true, lastname: true, department: true, position: true },
                })
                : [],
        ])) as [any[], any[]];

        const courseMap = new Map<number, string | null>();
        courseRecords.forEach((c: any) => courseMap.set(c.course_id, c.course_title));

        const profileMap = new Map<number, any>();
        profileRecords.forEach((p: any) => profileMap.set(p.user_id, p));

        const data = scores.map(s => {
            const courseTitle = s.course_id ? courseMap.get(s.course_id) : null;
            const profile: any = s.user_id ? profileMap.get(s.user_id) : null;
            const userName = profile ? `${profile.firstname || ''} ${profile.lastname || ''}`.trim() : `User #${s.user_id}`;

            const scoreNumber = s.score_number ?? 0;
            const scoreTotal = s.score_total ?? 100;
            const isPass = s.score_past?.toLowerCase() === 'y';
            const percentage = scoreTotal > 0 ? Math.round((scoreNumber / scoreTotal) * 100) : scoreNumber;

            return {
                id: s.score_id,
                userId: s.user_id,
                userName: userName || `User #${s.user_id}`,
                courseId: s.course_id,
                course: courseTitle || `Course #${s.course_id}`,
                title: courseTitle || `Course #${s.course_id}`,
                score: `${scoreNumber}/${scoreTotal}`,
                scorePercentage: percentage,
                numericScore: percentage,
                date: s.create_date ? s.create_date.toISOString().split('T')[0] : 'N/A',
                status: isPass ? 'PASS' : 'FAIL',
            };
        });

        const chartData = data.slice(0, 8).map(s => ({
            label: s.course ? String(s.course).split(' ').slice(0, 2).join(' ') : `Test #${s.id}`,
            value: s.numericScore,
        }));

        return {
            reportType: 'test',
            filters: query,
            totalResults: data.length,
            chartData,
            data,
        };
    }

    /**
     * รายงานการประเมินผล (Evaluation Report):
     * ดึงข้อมูลแบบประเมินจริงจาก tbl_evaluate และคะแนนคำตอบเฉลี่ยจาก tbl_eval_ans
     */
    async getEvaluationReport(query: any) {
        const evalWhere: any = { active: 'y' };

        if (!isPlaceholder(query.course)) {
            const matchedCourses = await this.prisma.tbl_course_online.findMany({
                where: { course_title: { contains: query.course }, active: 'y' },
                select: { course_id: true },
            });
            const courseIds = matchedCourses.map(c => c.course_id);
            if (courseIds.length > 0) {
                evalWhere.course_id = { in: courseIds };
            }
        }

        const evaluations = await this.prisma.tbl_evaluate.findMany({
            where: evalWhere,
            take: 50,
            include: {
                tbl_course_online: {
                    select: { course_title: true },
                },
                tbl_eval_ans: {
                    select: { eval_answer: true, user_id: true },
                },
            },
        });

        const data = evaluations.map(ev => {
            const answers = ev.tbl_eval_ans || [];
            const totalEvaluators = answers.length;
            const validAnswers = answers.filter(a => typeof a.eval_answer === 'number' && a.eval_answer > 0);
            const sumScore = validAnswers.reduce((acc, curr) => acc + (curr.eval_answer || 0), 0);
            const avgScore = validAnswers.length > 0 ? parseFloat((sumScore / validAnswers.length).toFixed(1)) : 0;

            return {
                id: ev.eva_id,
                topic: ev.eva_title || `Evaluation #${ev.eva_id}`,
                course: ev.tbl_course_online?.course_title || 'General Course',
                score: avgScore > 0 ? `${avgScore} / 5.0` : '0.0 / 5.0',
                numericScore: avgScore,
                totalEvaluators,
            };
        });

        const chartData = data.slice(0, 8).map(e => ({
            label: e.topic.length > 15 ? e.topic.substring(0, 15) + '...' : e.topic,
            value: e.numericScore * 20, // สเกล 5.0 แปลงเป็น 100%
        }));

        return {
            reportType: 'evaluation',
            filters: query,
            totalResults: data.length,
            chartData,
            data,
        };
    }
}
