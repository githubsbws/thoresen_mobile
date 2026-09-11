export interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  category: 'safety' | 'security' | 'fire' | 'survival';
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  videoUrl?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
}

export interface Certificate {
  id: string;
  courseTitle: string;
  holderName: string;
  issuedDate: string;
}

export interface ExamQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'Basic Safety Training',
    description: 'ความปลอดภัยพื้นฐานในการทำงาน',
    progress: 0.65,
    totalLessons: 4,
    completedLessons: 2,
    category: 'safety',
    lessons: [
      { id: 'l1', title: '1. ความปลอดภัยพื้นฐาน (Introduction to Safety)', duration: '15:30', isCompleted: true, isLocked: false },
      { id: 'l2', title: '2. การใช้อุปกรณ์ป้องกัน (PPE)', duration: '18:45', isCompleted: true, isLocked: false },
      { id: 'l3', title: '3. การป้องกันอัคคีภัย (Fire Prevention)', duration: '20:10', isCompleted: false, isLocked: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'l4', title: '4. การรองรับสถานการณ์ฉุกเฉิน (Emergency Response)', duration: '22:30', isCompleted: false, isLocked: true },
    ],
  },
  {
    id: '2',
    title: 'Ship Security Officer (SSO)',
    description: 'รักษาความปลอดภัยเรือ',
    progress: 0.20,
    totalLessons: 5,
    completedLessons: 1,
    category: 'security',
    lessons: [],
  },
  {
    id: '3',
    title: 'Advanced Fire Fighting',
    description: 'การดับเพลิงขั้นสูง',
    progress: 0,
    totalLessons: 6,
    completedLessons: 0,
    category: 'fire',
    lessons: [],
  },
  {
    id: '4',
    title: 'Personal Survival Techniques',
    description: 'การเอาตัวรอดสถานฉุกเฉิน',
    progress: 1.0,
    totalLessons: 4,
    completedLessons: 4,
    category: 'survival',
    lessons: [],
  },
];

export const news: NewsItem[] = [
  { id: '1', title: '2 หลักสูตรใหม่: Enclosed Space & Ballast Water Treatment', date: '30 พ.ค. 2567', category: 'new', excerpt: 'เพิ่มหลักสูตรใหม่สำหรับพนักงานเรือ' },
  { id: '2', title: 'หลักสูตรใหม่: Emergency Generator Course', date: '20 พ.ค. 2567', category: 'new', excerpt: 'เรียนรู้การใช้งานเครื่องกำเนิดไฟฟ้าฉุกเฉิน' },
  { id: '3', title: 'TTA 2025 Awards — SET ESG Rating ระดับ AAA', date: '18 พ.ค. 2567', category: 'news', excerpt: 'รางวัลด้านความยั่งยืนระดับสูงสุด' },
  { id: '4', title: 'FuelEU Maritime Regulation Course พร้อมแล้ว', date: '10 พ.ค. 2567', category: 'news', excerpt: 'อัปเดตกฎระเบียบการใช้เชื้อเพลิงทางทะเล' },
];

export const certificates: Certificate[] = [
  { id: '1', courseTitle: 'Basic Safety Training', holderName: 'Captain Somchai', issuedDate: '20 พ.ค. 2567' },
  { id: '2', courseTitle: 'Personal Survival Techniques', holderName: 'Captain Somchai', issuedDate: '10 เม.ย. 2567' },
];

export const examQuestions: ExamQuestion[] = [
  {
    question: 'ข้อใดคืออุปกรณ์ดับเพลิงที่เหมาะสมสำหรับไฟที่เกิดจากน้ำมัน?',
    options: ['น้ำ (Water)', 'โฟม (Foam)', 'ผงเคมีแห้ง (Dry Chemical)', 'ก๊าซคาร์บอนไดออกไซด์ (CO₂)'],
    correctIndex: 1,
  },
  {
    question: 'PPE ย่อมาจากอะไร?',
    options: ['Personal Protective Equipment', 'Primary Protection Elements', 'Passenger Protection Equipment', 'Port Protection Essentials'],
    correctIndex: 0,
  },
  {
    question: 'การเกิดเพลิงไหม้ต้องการองค์ประกอบกี่อย่าง?',
    options: ['2 อย่าง', '3 อย่าง', '4 อย่าง', '5 อย่าง'],
    correctIndex: 1,
  },
];
