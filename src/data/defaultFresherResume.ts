import type { ParsedResumeData, SectionNavItem } from '../types';

export const FRESHER_DEFAULT_SECTIONS: SectionNavItem[] = [
  { id: 'personal', title: 'Personal Information', type: 'personal', visible: true, num: '01' },
  { id: 'summary', title: 'Summary', type: 'summary', visible: true, num: '02' },
  { id: 'skills', title: 'Skills', type: 'skills', visible: true, num: '03' },
  { id: 'sec_tools_tech', title: 'Tools & Technologies', type: 'custom', visible: true, isCustom: true, num: '04' },
  { id: 'education', title: 'Education', type: 'education', visible: true, num: '05' },
  { id: 'sec_courses', title: 'Courses', type: 'custom', visible: true, isCustom: true, num: '06' },
  { id: 'achievements', title: 'Achievements', type: 'achievements', visible: true, num: '07' },
  { id: 'projects', title: 'Projects', type: 'projects', visible: true, num: '08' },
  { id: 'certificates', title: 'Certifications', type: 'certificates', visible: true, num: '09' },
  { id: 'sec_tech_strengths', title: 'Technical Strengths', type: 'custom', visible: true, isCustom: true, num: '10' },
  { id: 'sec_languages', title: 'Languages', type: 'custom', visible: true, isCustom: true, num: '11' },
  { id: 'sec_interests', title: 'Interests', type: 'custom', visible: true, isCustom: true, num: '12' },
  { id: 'sec_declaration', title: 'Declaration', type: 'custom', visible: true, isCustom: true, num: '13' },
  { id: 'styling', title: 'Font & Layout', type: 'styling', visible: true, num: '14' },
];

export const FRESHER_DEFAULT_RESUME: ParsedResumeData = {
  title: 'Ananya_Sharma_Fresher_Resume.pdf',
  targetRole: 'B.TECH COMPUTER SCIENCE ENGINEERING',
  templateName: 'Minimal Technical',
  importSource: 'scratch',
  resumeType: 'fresher',
  resumeStyling: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#000000',
    accentColor: '#000000',
    textColor: '#111827',
    backgroundColor: '#FFFFFF',
    fontSize: 'normal',
    lineHeight: 'normal',
    sectionSpacing: 'normal',
  },
  sectionsOrder: FRESHER_DEFAULT_SECTIONS,
  personalInfo: {
    fullName: 'ANANYA SHARMA',
    jobTitle: 'B.TECH COMPUTER SCIENCE ENGINEERING',
    email: 'ananyasharma25@gmail.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, Karnataka, India',
    github: 'github.com/ananya-sharma25',
    linkedin: 'linkedin.com/in/ananya-sharma',
    summary:
      'Motivated and detail-oriented Computer Science undergraduate with a strong foundation in programming, data structures, and web development. Eager to apply technical skills in real-world projects and contribute to a dynamic organization while continuously learning and growing.',
  },
  skills: `Programming Languages: C, C++, Java, Python
Web Development: HTML, CSS, JavaScript, Bootstrap
Databases: MySQL, MongoDB
CS Fundamentals: Data Structures & Algorithms, OOPs, DBMS, OS, Computer Networks`,
  experiences: [],
  education: [
    {
      id: 'edu_fresher_1',
      degree: 'B.Tech in Computer Science',
      institution: 'XYZ Institute of Technology',
      period: '2023 – 2027',
      highlights: 'CGPA: 7.8/10 (Till Now)',
    },
  ],
  projects: [
    {
      id: 'proj_fresher_1',
      title: 'Task Manager Web Application',
      description: '',
      techStack: ['HTML', 'CSS', 'JavaScript', 'LocalStorage'],
      bullets: [
        'Developed a responsive task manager to add, delete and track tasks.',
        'Implemented data persistence using LocalStorage.',
        'Designed clean and user-friendly interface.',
      ],
      period: 'Mar 2024',
    },
    {
      id: 'proj_fresher_2',
      title: 'Weather App',
      description: '',
      techStack: ['HTML', 'CSS', 'JavaScript', 'OpenWeather API'],
      bullets: [
        'Built a weather application that fetches real-time data using OpenWeather API.',
        'Implemented search functionality for any city.',
        'Displayed temperature, humidity, and weather conditions.',
      ],
      period: 'Feb 2024',
    },
    {
      id: 'proj_fresher_3',
      title: 'Online Book Store (Database Project)',
      description: '',
      techStack: ['MySQL'],
      bullets: [
        'Designed and implemented a database for an online book store.',
        'Created tables for users, books, orders and payments.',
        'Performed SQL queries for data manipulation and reporting.',
      ],
      period: 'Jan 2024',
    },
  ],
  certificates: [
    {
      id: 'cert_fresher_1',
      title: 'Programming in Java',
      issuer: 'NPTEL',
      date: '2024',
    },
    {
      id: 'cert_fresher_2',
      title: 'Python for Everybody',
      issuer: 'Coursera',
      date: '2024',
    },
    {
      id: 'cert_fresher_3',
      title: 'SQL (Basic)',
      issuer: 'HackerRank',
      date: '2024',
    },
  ],
  achievements: [
    {
      id: 'ach_fresher_1',
      title: 'Solved 150+ problems on LeetCode & GFG',
    },
    {
      id: 'ach_fresher_2',
      title: 'Participated in Smart India Hackathon 2024',
    },
    {
      id: 'ach_fresher_3',
      title: 'Secured 1st prize in college coding contest',
    },
  ],
  customSections: [
    {
      id: 'sec_tools_tech',
      title: 'Tools & Technologies',
      items: [
        {
          id: 'tool_1',
          title: 'VS Code, Git, GitHub, Postman, Figma, Netlify, Node.js (Basics), Microsoft Office',
        },
      ],
    },
    {
      id: 'sec_courses',
      title: 'Courses',
      items: [
        { id: 'course_1', title: 'Data Structures & Algorithms Using C++ – Udemy' },
        { id: 'course_2', title: 'Web Development Bootcamp – Udemy' },
        { id: 'course_3', title: 'SQL (Basics to Advanced) – HackerRank' },
      ],
    },
    {
      id: 'sec_tech_strengths',
      title: 'Technical Strengths',
      items: [
        { id: 'ts_1', title: 'Strong problem-solving and analytical skills' },
        { id: 'ts_2', title: 'Good understanding of Data Structures and Algorithms' },
        { id: 'ts_3', title: 'Ability to learn new technologies quickly' },
        { id: 'ts_4', title: 'Team player with good communication skills' },
      ],
    },
    {
      id: 'sec_languages',
      title: 'Languages',
      items: [
        { id: 'lang_1', title: 'English (Fluent) | Hindi (Native)' },
      ],
    },
    {
      id: 'sec_interests',
      title: 'Interests',
      items: [
        { id: 'int_1', title: 'Problem Solving, Web Development, Reading Tech Blogs, Music' },
      ],
    },
    {
      id: 'sec_declaration',
      title: 'Declaration',
      items: [
        { id: 'dec_1', title: 'I hereby declare that the above information is true to the best of my knowledge.' },
      ],
    },
  ],
};
