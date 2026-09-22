export type NewsItem = {
  id: string;
  title: string;
  detail: string;
  content: string;
  date: string;
  category: string;
  image: string;
};

export const newsList: NewsItem[] = [
  {
    id: '1',
    title: 'Welcome to THORESEN e-Learning',
    detail:
      'Thoresen e-Learning system is now available for staff training and development.',
    content:
      'Thoresen e-Learning system is now available for all staff members. The platform provides training courses, safety information, company announcements, and useful learning materials. Staff members can access lessons and improve their professional knowledge through the application.',
    date: '17 Jun 2026',
    category: 'Announcement',
    image:
      'https://images.unsplash.com/photo-1560264280-88b68371db39?w=900',
  },
  {
    id: '2',
    title: 'Safety Management Course Updated',
    detail:
      'New learning content and documents have been added to support onboard safety practices.',
    content:
      'The Safety Management Course has been updated with new lessons, documents, and practical safety guidelines. Crew members should review the updated content to understand current onboard safety procedures and reduce risks while working.',
    date: '16 Jun 2026',
    category: 'Course',
    image:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900',
  },
  {
    id: '3',
    title: 'Cargo Care Training Now Available',
    detail:
      'Crew members can now access updated cargo care lessons and practical guidelines.',
    content:
      'The Cargo Care Training course is now available. The course covers cargo handling, cargo inspection, safety procedures, and methods for preventing damage during transportation. Crew members can access the lessons through the course section.',
    date: '15 Jun 2026',
    category: 'Training',
    image:
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900',
  },
  {
    id: '4',
    title: 'New Multimedia Library Added',
    detail:
      'Training videos and media files are available in the multimedia library section.',
    content:
      'A new multimedia library has been added to the application. Users can access training videos, documents, safety media, and learning resources. More content will be added regularly to support staff development.',
    date: '14 Jun 2026',
    category: 'Library',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900',
  },
  {
    id: '5',
    title: 'Crew Complaint Channel Open',
    detail:
      'Crew can submit comments, complaints, and suggestions through the new complaint channel.',
    content:
      'The Crew Complaint Channel is now available. Crew members can use this channel to submit complaints, comments, and suggestions. All submitted information will be reviewed by the responsible department.',
    date: '13 Jun 2026',
    category: 'Crew',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900',
  },
];