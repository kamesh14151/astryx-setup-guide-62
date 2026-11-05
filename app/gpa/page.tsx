'use client';

import {useState, useMemo} from 'react';
import Link from 'next/link';
import {Table} from '@astryxdesign/core/Table';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Grid} from '@astryxdesign/core/Grid';
import {Text} from '@astryxdesign/core/Text';

const SEMESTER_OPTIONS = [
  {id: '1', name: 'Semester 1', variant: 'blue' as const},
  {id: '2', name: 'Semester 2', variant: 'cyan' as const},
  {id: '3', name: 'Semester 3', variant: 'teal' as const},
  {id: '4', name: 'Semester 4', variant: 'green' as const},
  {id: '5', name: 'Semester 5', variant: 'yellow' as const},
  {id: '6', name: 'Semester 6', variant: 'orange' as const},
  {id: '7', name: 'Semester 7', variant: 'teal' as const},
  {id: '8', name: 'Semester 8', variant: 'blue' as const},
];

// ─── Data Definitions ────────────────────────────────────────────────────────

export interface Subject {
  code: string;
  name: string;
  credits: number;
}

export interface Department {
  name: string;
  color: string;
  icon: string;
  semesters: Record<string, Subject[]>;
}

export const GRADE_POINTS: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'U': 0,
};

export const BRANCHES_DATA: Record<string, Department> = {
  CSE: {
    name: 'Computer Science',
    color: 'var(--cse-color, #2563eb)',
    icon: 'code',
    semesters: {
      '1': [
        {code: 'U23ENG101A', name: 'Communication Skills in English', credits: 3},
        {code: 'U23MAT102A', name: 'Linear Algebra and Calculus With MATLAB', credits: 4},
        {code: 'U23PHY103B', name: 'Engineering Physics', credits: 3},
        {code: 'U23PPR105', name: 'Problem Solving using Python Programming', credits: 3},
        {code: 'U23BEE106A', name: 'Basic Electrical and Electronics Engineering', credits: 3},
        {code: 'U23TAM101', name: 'Heritage of Tamils', credits: 1},
        {code: 'U23PHL110', name: 'Engineering Physics Lab', credits: 1},
        {code: 'U23BEEL113', name: 'Basic Electrical and Electronics Engineering Lab', credits: 1},
        {code: 'U23PPL112', name: 'Python Programming Lab', credits: 1},
      ],
      '2': [
        {code: 'U23ENG201A', name: 'Technical English', credits: 2},
        {code: 'U23MAT202B', name: 'Discrete Mathematics', credits: 4},
        {code: 'U23CHE204B', name: 'Chemistry For Computer Science', credits: 3},
        {code: 'U23CPR205B', name: 'Programming In C', credits: 3},
        {code: 'U23EGR207', name: 'Engineering Graphics', credits: 3},
        {code: 'U23EC203', name: 'Digital Principles And System Design', credits: 3},
        {code: 'U23CHL211', name: 'Chemistry Lab', credits: 1},
        {code: 'U23CPL212', name: 'C programming Lab', credits: 1},
        {code: 'U23TAM201', name: 'Tamils And Technology', credits: 1},
      ],
      '3': [
        {code: 'U23MAT301D', name: 'Probability and Statistics', credits: 4},
        {code: 'U23CS301', name: 'Data Structures', credits: 3},
        {code: 'U23CS302', name: 'Computer Architecture', credits: 3},
        {code: 'U23CS303', name: 'Object Oriented Programming', credits: 3},
        {code: 'U23CS304', name: 'Operating Systems', credits: 3},
        {code: 'U23CS305', name: 'Computer Information and Ethics', credits: 3},
        {code: 'U23CS306', name: 'Data Structures Lab', credits: 1},
        {code: 'U23CS307', name: 'Object Oriented Programming Lab', credits: 1},
        {code: 'U23GE301', name: 'Soft Skills and Aptitude-I', credits: 1},
        {code: 'Noc24-mg72', name: 'NPTEL:design Thinking-A Primer', credits: 1},
      ],
      '4': [
        {code: 'U23MAT401B', name: 'Numerical Methods', credits: 4},
        {code: 'U23CS401', name: 'Design And Analysis of Algorithms', credits: 3},
        {code: 'U23CS402', name: 'Software Engineering', credits: 3},
        {code: 'U23CS403', name: 'DataBase Management Systems', credits: 3},
        {code: 'U23CS404', name: 'Embedded System Design', credits: 3},
        {code: 'U23CS405', name: 'Software Development Lab', credits: 1},
        {code: 'U23CS403', name: 'Database Management Systems Lab', credits: 1},
      ],
      '5': [
        {code: 'U23CS504', name: 'Machine Learning', credits: 3},
        {code: 'U23CS501', name: 'Computer Networks', credits: 3},
        {code: 'U23CS502', name: 'Artificial Intelligence', credits: 3},
        {code: 'U23CS503', name: 'Theory of Computation', credits: 3},
        {code: 'noc25-cs135', name: 'Elective NPTEL', credits: 3},
        {code: 'U23CS947 / U23CS903', name: 'Professional Elective', credits: 3},
        {code: 'U23CS505', name: 'Computer Networks Laboratory', credits: 2},
        {code: 'U23CS506', name: 'Artificial Intelligence and Machine Learning Laboratory', credits: 1},
        {code: 'U23GE501', name: 'Soft Skills and Aptitude -III', credits: 1},
      ],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  IT: {
    name: 'Info. Technology',
    color: 'var(--it-color, #0891b2)',
    icon: 'network',
    semesters: {
      '1': [
        {code: 'U23IT101', name: 'Programming Fundamentals', credits: 4},
        {code: 'U23IT102', name: 'Discrete Mathematics', credits: 4},
        {code: 'U23IT103', name: 'Digital Systems', credits: 3},
        {code: 'U23IT104', name: 'Computer Organization', credits: 3},
        {code: 'U23IT105', name: 'Communication Skills', credits: 2},
        {code: 'U23IT106', name: 'Programming Lab', credits: 1},
        {code: 'U23IT107', name: 'Digital Systems Lab', credits: 1},
      ],
      '2': [
        {code: 'U23IT201', name: 'Data Structures', credits: 4},
        {code: 'U23IT202', name: 'Database Systems', credits: 4},
        {code: 'U23IT203', name: 'Operating Systems', credits: 3},
        {code: 'U23IT204', name: 'Computer Networks', credits: 3},
        {code: 'U23IT205', name: 'Web Technologies', credits: 3},
        {code: 'U23IT206', name: 'Data Structures Lab', credits: 1},
        {code: 'U23IT207', name: 'Web Technologies Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  ECE: {
    name: 'Electronics & Comm',
    color: 'var(--ece-color, #d97706)',
    icon: 'satellite',
    semesters: {
      '1': [
        {code: 'U23EC101', name: 'Basic Electronics', credits: 4},
        {code: 'U23EC102', name: 'Circuit Theory', credits: 4},
        {code: 'U23EC103', name: 'Engineering Mathematics', credits: 4},
        {code: 'U23EC104', name: 'Programming in C', credits: 3},
        {code: 'U23EC105', name: 'Communication Skills', credits: 2},
        {code: 'U23EC106', name: 'Electronics Lab', credits: 1},
        {code: 'U23EC107', name: 'Programming Lab', credits: 1},
      ],
      '2': [
        {code: 'U23EC201', name: 'Analog Electronics', credits: 4},
        {code: 'U23EC202', name: 'Digital Electronics', credits: 4},
        {code: 'U23EC203', name: 'Signals and Systems', credits: 4},
        {code: 'U23EC204', name: 'Electromagnetic Theory', credits: 3},
        {code: 'U23EC205', name: 'Data Structures', credits: 3},
        {code: 'U23EC206', name: 'Analog Electronics Lab', credits: 1},
        {code: 'U23EC207', name: 'Digital Electronics Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  EEE: {
    name: 'Electrical & Electronics',
    color: 'var(--eee-color, #ca8a04)',
    icon: 'bolt',
    semesters: {
      '1': [
        {code: 'U23EE101', name: 'Basic Electrical Engineering', credits: 4},
        {code: 'U23EE102', name: 'Engineering Mathematics', credits: 4},
        {code: 'U23EE103', name: 'Electronics Engineering', credits: 3},
        {code: 'U23EE104', name: 'Programming in C', credits: 3},
        {code: 'U23EE105', name: 'Communication Skills', credits: 2},
        {code: 'U23EE106', name: 'Electrical Lab', credits: 1},
        {code: 'U23EE107', name: 'Programming Lab', credits: 1},
      ],
      '2': [
        {code: 'U23EE201', name: 'Circuit Theory', credits: 4},
        {code: 'U23EE202', name: 'Electromagnetic Theory', credits: 4},
        {code: 'U23EE203', name: 'Digital Electronics', credits: 4},
        {code: 'U23EE204', name: 'Electrical Machines', credits: 3},
        {code: 'U23EE205', name: 'Data Structures', credits: 3},
        {code: 'U23EE206', name: 'Circuit Theory Lab', credits: 1},
        {code: 'U23EE207', name: 'Digital Electronics Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  MECH: {
    name: 'Mechanical',
    color: 'var(--mech-color, #dc2626)',
    icon: 'cog',
    semesters: {
      '1': [
        {code: 'U23ME101', name: 'Engineering Mechanics', credits: 4},
        {code: 'U23ME102', name: 'Engineering Graphics', credits: 4},
        {code: 'U23ME103', name: 'Engineering Mathematics', credits: 4},
        {code: 'U23ME104', name: 'Basic Electrical Engineering', credits: 3},
        {code: 'U23ME105', name: 'Communication Skills', credits: 2},
        {code: 'U23ME106', name: 'Workshop Practice', credits: 1},
        {code: 'U23ME107', name: 'Engineering Graphics Lab', credits: 1},
      ],
      '2': [
        {code: 'U23ME201', name: 'Thermodynamics', credits: 4},
        {code: 'U23ME202', name: 'Mechanics of Materials', credits: 4},
        {code: 'U23ME203', name: 'Manufacturing Technology', credits: 4},
        {code: 'U23ME204', name: 'Fluid Mechanics', credits: 3},
        {code: 'U23ME205', name: 'Computer Programming', credits: 3},
        {code: 'U23ME206', name: 'Thermodynamics Lab', credits: 1},
        {code: 'U23ME207', name: 'Manufacturing Technology Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  AIML: {
    name: 'AI & Machine Learning',
    color: 'var(--aiml-color, #7c3aed)',
    icon: 'brain',
    semesters: {
      '1': [
        {code: 'U23EG107', name: 'Engineering Graphics', credits: 3},
        {code: 'U23ENG101A', name: 'Communication Skills in English', credits: 3},
        {code: 'U23MAT102A', name: 'Linear Algebra and Calculus with MATLAB', credits: 4},
        {code: 'U23PPR105', name: 'Problem Solving using Python Programming', credits: 3},
        {code: 'U23PHY103E', name: 'Engineering Physics', credits: 3},
        {code: 'U23PHL110', name: 'Engineering Physics Laboratory', credits: 1},
        {code: 'U23PPL112', name: 'Python Programming Laboratory', credits: 1},
        {code: 'U23TAM101', name: 'Heritage of Tamils', credits: 1},
      ],
      '2': [
        {code: 'U23ENG201A', name: 'Technical English', credits: 2},
        {code: 'U23MAT202D', name: 'Discrete Mathematics', credits: 4},
        {code: 'U23BEEE206B', name: 'Basics of Electrical and Electronics Engineering', credits: 3},
        {code: 'U23CPR205', name: 'Programming in C', credits: 3},
        {code: 'U23CHE204C', name: 'Applied Chemistry', credits: 2},
        {code: 'U23EC203', name: 'Digital Principles and System Design', credits: 3},
        {code: 'U23CPL212', name: 'C Programming Laboratory', credits: 1},
        {code: 'U23CHL211', name: 'Chemistry Laboratory', credits: 1},
        {code: 'U23BEEL213B', name: 'BEEE Laboratory', credits: 1},
        {code: 'U23TAM201', name: 'Tamils and Technology', credits: 1},
      ],
      '3': [
        {code: 'U23MAT301E', name: 'Applied Probability and Statistics-I', credits: 4},
        {code: 'U23CS301', name: 'Data Structures', credits: 3},
        {code: 'U23CS302', name: 'Computer Architecture', credits: 3},
        {code: 'U23CS303', name: 'Object Oriented Programming Using Java', credits: 3},
        {code: 'U23AML301', name: 'Data Visualization', credits: 3},
        {code: 'noc25-mg106', name: 'NPTEL: Design Thinking - A Primer', credits: 1},
        {code: 'U23CS306', name: 'Data Structures Laboratory', credits: 1},
        {code: 'U23CS307', name: 'Object Oriented Programming Using Java Laboratory', credits: 1},
        {code: 'U23AML302', name: 'Data Visualization Laboratory', credits: 1},
        {code: 'U23GE301', name: 'Soft Skills and Aptitude-I', credits: 1},
      ],
      '4': [
        {code: 'U23MAT401A', name: 'Applied Probability and Statistics-II', credits: 4},
        {code: 'U23CS403', name: 'Database Management Systems', credits: 3},
        {code: 'U23CS401', name: 'Design and Analysis of Algorithms', credits: 3},
        {code: 'U23AML401', name: 'Artificial Intelligence', credits: 3},
        {code: 'U23CSD402', name: 'Operating Systems', credits: 3},
        {code: 'U23AML402', name: 'Artificial Intelligence Lab', credits: 1},
        {code: 'U23CS405', name: 'Database Management Systems Lab', credits: 1},
        {code: 'U23GE401', name: 'Soft Skills and Aptitude-II', credits: 1},
      ],
      '5': [
        {code: 'U23CS504', name: 'Machine Learning', credits: 3},
        {code: 'U23CS501', name: 'Computer Networks', credits: 3},
        {code: 'U23CSD502', name: 'Software Engineering', credits: 3},
        {code: 'U23CS503', name: 'Theory of Computation', credits: 3},
        {code: 'noc25-cs135', name: 'Elective NPTEL', credits: 3},
        {code: 'U19CS903', name: 'Professional Elective - Agile Methodologies', credits: 3},
        {code: 'U23AML501', name: 'Machine Learning Laboratory', credits: 2},
        {code: 'U23CSD504', name: 'Software Development Laboratory', credits: 1},
        {code: 'U23GE501', name: 'Soft Skills and Aptitude -III', credits: 1},
      ],
      '6': [
        {code: 'U23CS601', name: 'Computer Vision', credits: 3},
        {code: 'U23CS602', name: 'Reinforcement Learning', credits: 3},
        {code: 'U23CS603', name: 'Robotics', credits: 3},
        {code: 'U23CS604', name: 'Cyber Security', credits: 3},
        {code: 'U23CS605', name: 'Blockchain Technology', credits: 3},
        {code: 'U23CS606', name: 'Elective III', credits: 3},
        {code: 'U23CS607', name: 'Project Work II', credits: 3},
      ],
      '7': [
        {code: 'U23CS701', name: 'Advanced Machine Learning', credits: 3},
        {code: 'U23CS702', name: 'AI Ethics and Governance', credits: 3},
        {code: 'U23CS703', name: 'Elective IV', credits: 3},
        {code: 'U23CS704', name: 'Project Work III', credits: 3},
      ],
      '8': [
        {code: 'U23CS801', name: 'Industry Internship', credits: 6},
        {code: 'U23CS802', name: 'Project Work IV', credits: 6},
      ],
    },
  },
  CIVIL: {
    name: 'Civil Engineering',
    color: 'var(--civil-color, #059669)',
    icon: 'building',
    semesters: {
      '1': [
        {code: 'U23CE101', name: 'Engineering Mechanics', credits: 4},
        {code: 'U23CE102', name: 'Engineering Graphics', credits: 4},
        {code: 'U23CE103', name: 'Engineering Mathematics', credits: 4},
        {code: 'U23CE104', name: 'Basic Civil Engineering', credits: 3},
        {code: 'U23CE105', name: 'Communication Skills', credits: 2},
        {code: 'U23CE106', name: 'Surveying', credits: 1},
        {code: 'U23CE107', name: 'Engineering Graphics Lab', credits: 1},
      ],
      '2': [
        {code: 'U23CE201', name: 'Building Materials', credits: 4},
        {code: 'U23CE202', name: 'Structural Analysis', credits: 4},
        {code: 'U23CE203', name: 'Fluid Mechanics', credits: 4},
        {code: 'U23CE204', name: 'Surveying', credits: 3},
        {code: 'U23CE205', name: 'Computer Programming', credits: 3},
        {code: 'U23CE206', name: 'Building Materials Lab', credits: 1},
        {code: 'U23CE207', name: 'Surveying Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  BME: {
    name: 'Bio Medical',
    color: 'var(--bme-color, #db2777)',
    icon: 'heartbeat',
    semesters: {
      '1': [
        {code: 'U23BM101', name: 'Human Anatomy', credits: 4},
        {code: 'U23BM102', name: 'Engineering Mathematics', credits: 4},
        {code: 'U23BM103', name: 'Basic Electronics', credits: 3},
        {code: 'U23BM104', name: 'Programming in C', credits: 3},
        {code: 'U23BM105', name: 'Communication Skills', credits: 2},
        {code: 'U23BM106', name: 'Human Anatomy Lab', credits: 1},
        {code: 'U23BM107', name: 'Programming Lab', credits: 1},
      ],
      '2': [
        {code: 'U23BM201', name: 'Human Physiology', credits: 4},
        {code: 'U23BM202', name: 'Biochemistry', credits: 4},
        {code: 'U23BM203', name: 'Medical Electronics', credits: 4},
        {code: 'U23BM204', name: 'Biomechanics', credits: 3},
        {code: 'U23BM205', name: 'Data Structures', credits: 3},
        {code: 'U23BM206', name: 'Human Physiology Lab', credits: 1},
        {code: 'U23BM207', name: 'Medical Electronics Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  FT: {
    name: 'Fashion Technology',
    color: 'var(--ft-color, #e11d48)',
    icon: 'tshirt',
    semesters: {
      '1': [
        {code: 'U23FT101', name: 'Fiber Science', credits: 4},
        {code: 'U23FT102', name: 'Textile Chemistry', credits: 4},
        {code: 'U23FT103', name: 'Fashion Illustration', credits: 3},
        {code: 'U23FT104', name: 'Pattern Making', credits: 3},
        {code: 'U23FT105', name: 'Communication Skills', credits: 2},
        {code: 'U23FT106', name: 'Textile Chemistry Lab', credits: 1},
        {code: 'U23FT107', name: 'Pattern Making Lab', credits: 1},
      ],
      '2': [
        {code: 'U23FT201', name: 'Textile Processing', credits: 4},
        {code: 'U23FT202', name: 'Apparel Manufacturing', credits: 4},
        {code: 'U23FT203', name: 'Fashion Design', credits: 4},
        {code: 'U23FT204', name: 'Garment Construction', credits: 3},
        {code: 'U23FT205', name: 'Computer Applications', credits: 3},
        {code: 'U23FT206', name: 'Apparel Manufacturing Lab', credits: 1},
        {code: 'U23FT207', name: 'Garment Construction Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  MCT: {
    name: 'Mechatronics',
    color: 'var(--mct-color, #0d9488)',
    icon: 'robot',
    semesters: {
      '1': [
        {code: 'U23MT101', name: 'Engineering Mechanics', credits: 4},
        {code: 'U23MT102', name: 'Engineering Graphics', credits: 4},
        {code: 'U23MT103', name: 'Engineering Mathematics', credits: 4},
        {code: 'U23MT104', name: 'Basic Electronics', credits: 3},
        {code: 'U23MT105', name: 'Communication Skills', credits: 2},
        {code: 'U23MT106', name: 'Workshop Practice', credits: 1},
        {code: 'U23MT107', name: 'Engineering Graphics Lab', credits: 1},
      ],
      '2': [
        {code: 'U23MT201', name: 'Thermodynamics', credits: 4},
        {code: 'U23MT202', name: 'Mechanics of Materials', credits: 4},
        {code: 'U23MT203', name: 'Digital Electronics', credits: 4},
        {code: 'U23MT204', name: 'Fluid Mechanics', credits: 3},
        {code: 'U23MT205', name: 'Computer Programming', credits: 3},
        {code: 'U23MT206', name: 'Thermodynamics Lab', credits: 1},
        {code: 'U23MT207', name: 'Digital Electronics Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  CSD: {
    name: 'CS & Design',
    color: 'var(--csd-color, #4f46e5)',
    icon: 'paintbrush',
    semesters: {
      '1': [
        {code: 'U23CD101', name: 'Design Fundamentals', credits: 4},
        {code: 'U23CD102', name: 'Programming Basics', credits: 4},
        {code: 'U23CD103', name: 'Visual Communication', credits: 3},
        {code: 'U23CD104', name: 'Mathematics for Design', credits: 3},
        {code: 'U23CD105', name: 'Communication Skills', credits: 2},
        {code: 'U23CD106', name: 'Design Studio', credits: 1},
        {code: 'U23CD107', name: 'Programming Lab', credits: 1},
      ],
      '2': [
        {code: 'U23CD201', name: 'User Interface Design', credits: 4},
        {code: 'U23CD202', name: 'Data Structures', credits: 4},
        {code: 'U23CD203', name: 'Web Design', credits: 4},
        {code: 'U23CD204', name: 'Digital Illustration', credits: 3},
        {code: 'U23CD205', name: 'Human-Computer Interaction', credits: 3},
        {code: 'U23CD206', name: 'UI Design Lab', credits: 1},
        {code: 'U23CD207', name: 'Web Design Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  ADS: {
    name: 'AI & Data Science',
    color: 'var(--ads-color, #9333ea)',
    icon: 'database',
    semesters: {
      '1': [
        {code: 'U23DS101', name: 'Programming Fundamentals', credits: 4},
        {code: 'U23DS102', name: 'Linear Algebra', credits: 4},
        {code: 'U23DS103', name: 'Statistics Basics', credits: 3},
        {code: 'U23DS104', name: 'Computational Thinking', credits: 3},
        {code: 'U23DS105', name: 'Communication Skills', credits: 2},
        {code: 'U23DS106', name: 'Programming Lab', credits: 1},
        {code: 'U23DS107', name: 'Statistics Lab', credits: 1},
      ],
      '2': [
        {code: 'U23DS201', name: 'Data Structures', credits: 4},
        {code: 'U23DS202', name: 'Probability and Statistics', credits: 4},
        {code: 'U23DS203', name: 'Database Systems', credits: 4},
        {code: 'U23DS204', name: 'Data Visualization', credits: 3},
        {code: 'U23DS205', name: 'Python Programming', credits: 3},
        {code: 'U23DS206', name: 'Data Structures Lab', credits: 1},
        {code: 'U23DS207', name: 'Database Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  EFE: {
    name: 'Electrical & Computer',
    color: 'var(--efe-color, #0284c7)',
    icon: 'microchip',
    semesters: {
      '1': [
        {code: 'U23EF101', name: 'Circuit Theory', credits: 4},
        {code: 'U23EF102', name: 'Programming Fundamentals', credits: 4},
        {code: 'U23EF103', name: 'Digital Electronics', credits: 3},
        {code: 'U23EF104', name: 'Engineering Mathematics', credits: 3},
        {code: 'U23EF105', name: 'Communication Skills', credits: 2},
        {code: 'U23EF106', name: 'Circuit Theory Lab', credits: 1},
        {code: 'U23EF107', name: 'Programming Lab', credits: 1},
      ],
      '2': [
        {code: 'U23EF201', name: 'Signals and Systems', credits: 4},
        {code: 'U23EF202', name: 'Data Structures', credits: 4},
        {code: 'U23EF203', name: 'Analog Electronics', credits: 4},
        {code: 'U23EF204', name: 'Electromagnetic Theory', credits: 3},
        {code: 'U23EF205', name: 'Computer Organization', credits: 3},
        {code: 'U23EF206', name: 'Analog Electronics Lab', credits: 1},
        {code: 'U23EF207', name: 'Data Structures Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
  EXE: {
    name: 'Electronics & Computer',
    color: 'var(--exe-color, #4338ca)',
    icon: 'desktop',
    semesters: {
      '1': [
        {code: 'U23EX101', name: 'Basic Electronics', credits: 4},
        {code: 'U23EX102', name: 'Programming Fundamentals', credits: 4},
        {code: 'U23EX103', name: 'Digital Logic Design', credits: 3},
        {code: 'U23EX104', name: 'Engineering Mathematics', credits: 3},
        {code: 'U23EX105', name: 'Communication Skills', credits: 2},
        {code: 'U23EX106', name: 'Electronics Lab', credits: 1},
        {code: 'U23EX107', name: 'Programming Lab', credits: 1},
      ],
      '2': [
        {code: 'U23EX201', name: 'Data Structures', credits: 4},
        {code: 'U23EX202', name: 'Analog Electronics', credits: 4},
        {code: 'U23EX203', name: 'Computer Organization', credits: 4},
        {code: 'U23EX204', name: 'Signals and Systems', credits: 3},
        {code: 'U23EX205', name: 'Database Systems', credits: 3},
        {code: 'U23EX206', name: 'Analog Electronics Lab', credits: 1},
        {code: 'U23EX207', name: 'Data Structures Lab', credits: 1},
      ],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
      '8': [],
    },
  },
};

function BranchIcon({type, size = 18, color = 'currentColor'}: {type: string; size?: number; color?: string}) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'code':
      return (
        <svg {...props}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'network':
      return (
        <svg {...props}>
          <rect x="9" y="2" width="6" height="6" rx="1" />
          <rect x="2" y="16" width="6" height="6" rx="1" />
          <rect x="16" y="16" width="6" height="6" rx="1" />
          <path d="M12 8v4m-7 4v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'satellite':
      return (
        <svg {...props}>
          <path d="M4 10a7.5 7.5 0 0 0 10 10" />
          <path d="M4 6a11.5 11.5 0 0 0 14 14" />
          <circle cx="4" cy="20" r="1.5" />
          <path d="m15 4 4 4" />
          <path d="m17 2 5 5-2 2-5-5z" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...props}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'cog':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'brain':
      return (
        <svg {...props}>
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
          <path d="M12 5v14" />
        </svg>
      );
    case 'building':
      return (
        <svg {...props}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
        </svg>
      );
    case 'heartbeat':
      return (
        <svg {...props}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M12 5v4l2 3 3-5 2 2" />
        </svg>
      );
    case 'tshirt':
      return (
        <svg {...props}>
          <path d="M6 3 2 7l4 3v11h12V10l4-3-4-4a4 4 0 0 1-6 2 4 4 0 0 1-6-2Z" />
        </svg>
      );
    case 'robot':
      return (
        <svg {...props}>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
      );
    case 'paintbrush':
      return (
        <svg {...props}>
          <path d="m14 10 4-4a2 2 0 0 1 2.8 2.8l-4 4" />
          <path d="M13 11 6 18c-.8.8-1.5 1-2.5 1 0-1 .2-1.7 1-2.5l7-7" />
          <path d="m14 10 3 3" />
        </svg>
      );
    case 'database':
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'microchip':
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
        </svg>
      );
    case 'desktop':
    default:
      return (
        <svg {...props}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
  }
}

export default function GpaPage() {
  const branchKeys = Object.keys(BRANCHES_DATA);
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');

  // Custom courses added by the student
  const [customSubjects, setCustomSubjects] = useState<Subject[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCredits, setCustomCredits] = useState('3');

  // Active grades keyed by subject code: { [code]: 'O' | 'A+' | ... }
  const [grades, setGrades] = useState<Record<string, string>>({});

  // Mode: SGPA vs CGPA
  const [activeTab, setActiveTab] = useState<'sgpa' | 'cgpa'>('sgpa');

  // CGPA entries
  const [cgpaEntries, setCgpaEntries] = useState([
    {sem: '1', gpa: '8.5', credits: '20'},
    {sem: '2', gpa: '8.8', credits: '21'},
    {sem: '3', gpa: '', credits: '22'},
    {sem: '4', gpa: '', credits: '20'},
  ]);

  const activeDepartment = BRANCHES_DATA[selectedBranch] ?? BRANCHES_DATA.CSE;
  const standardSubjects = activeDepartment.semesters[selectedSemester] ?? [];
  const allCurrentSubjects = useMemo(() => {
    return [...standardSubjects, ...customSubjects];
  }, [standardSubjects, customSubjects]);

  const handleSelectBranch = (key: string) => {
    setSelectedBranch(key);
    setGrades({});
    setCustomSubjects([]);
  };

  const handleSelectSemester = (sem: string) => {
    setSelectedSemester(sem);
    setGrades({});
    setCustomSubjects([]);
  };

  const handleSetGrade = (code: string, grade: string) => {
    setGrades(prev => ({...prev, [code]: grade}));
  };

  const handleSetAllGrades = (grade: string) => {
    const updated: Record<string, string> = {};
    allCurrentSubjects.forEach(s => {
      updated[s.code] = grade;
    });
    setGrades(updated);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const cred = parseInt(customCredits, 10) || 3;
    const newSub: Subject = {
      code: customCode.trim() || `CUSTOM-${customSubjects.length + 1}`,
      name: customName.trim(),
      credits: cred,
    };
    setCustomSubjects(prev => [...prev, newSub]);
    setCustomCode('');
    setCustomName('');
    setCustomCredits('3');
    setShowAddCustom(false);
  };

  // SGPA Calculation
  const calculation = useMemo(() => {
    let totalCredits = 0;
    let earnedCredits = 0;
    let totalWeightedPoints = 0;
    let gradedCount = 0;
    let arrearsCount = 0;

    allCurrentSubjects.forEach(subject => {
      const grade = grades[subject.code];
      totalCredits += subject.credits;

      if (grade !== undefined && grade !== '') {
        gradedCount++;
        const points = GRADE_POINTS[grade] ?? 0;
        totalWeightedPoints += subject.credits * points;
        if (grade !== 'U') {
          earnedCredits += subject.credits;
        } else {
          arrearsCount++;
        }
      }
    });

    const isComplete = gradedCount > 0;
    const sgpa = totalCredits > 0 && isComplete ? totalWeightedPoints / totalCredits : 0;

    return {
      totalCredits,
      earnedCredits,
      totalWeightedPoints,
      gradedCount,
      totalSubjects: allCurrentSubjects.length,
      arrearsCount,
      sgpa: Number(sgpa.toFixed(2)),
    };
  }, [allCurrentSubjects, grades]);

  // Performance tier based on SGPA
  const performance = useMemo(() => {
    if (calculation.gradedCount === 0) return {text: 'Select grades below', color: 'text-muted-foreground'};
    if (calculation.arrearsCount > 0) return {text: `${calculation.arrearsCount} Arrear(s)`, color: 'text-destructive'};
    if (calculation.sgpa >= 9.0) return {text: 'Outstanding (First Class with Distinction)', color: 'text-foreground font-semibold'};
    if (calculation.sgpa >= 8.0) return {text: 'Excellent (First Class)', color: 'text-foreground font-semibold'};
    if (calculation.sgpa >= 7.0) return {text: 'Very Good', color: 'text-foreground'};
    if (calculation.sgpa >= 6.0) return {text: 'Good', color: 'text-foreground'};
    return {text: 'Passing Grade', color: 'text-muted-foreground'};
  }, [calculation]);

  // CGPA Calculation
  const cgpaResult = useMemo(() => {
    let totalCreds = 0;
    let totalPoints = 0;
    let filledCount = 0;

    cgpaEntries.forEach(item => {
      const gpa = parseFloat(item.gpa);
      const cred = parseFloat(item.credits);
      if (!isNaN(gpa) && !isNaN(cred) && cred > 0) {
        totalCreds += cred;
        totalPoints += gpa * cred;
        filledCount++;
      }
    });

    const cgpa = totalCreds > 0 ? totalPoints / totalCreds : 0;
    return {
      cgpa: Number(cgpa.toFixed(2)),
      totalCreds,
      filledCount,
    };
  }, [cgpaEntries]);

  return (
    <main className="min-h-screen w-full bg-background text-foreground antialiased pb-24 transition-colors">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 px-6 py-12">
        {/* Header Navigation */}
        <header className="flex items-center justify-between border-b border-border pb-6">
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70">
            <span>←</span>
            <span>Back to Hub</span>
          </Link>

          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveTab('sgpa')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'sgpa'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              Semester SGPA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cgpa')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'cgpa'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              Overall CGPA
            </button>
          </div>
        </header>

        {/* Title & Live Score Hero Banner */}
        <section className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between rounded-[20px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <span className="self-start rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Regulation 2023 Autonomous Curriculum
            </span>
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground md:text-[32px]">
              GPA & SGPA Calculator
            </h1>
            <p className="text-base text-muted-foreground max-w-lg">
              Select your department and semester to compute your exact SGPA and cumulative credits in real time.
            </p>
          </div>

          {/* Quick HUD Metric */}
          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-foreground text-background font-bold text-2xl shadow-sm">
              {activeTab === 'sgpa' ? calculation.sgpa : cgpaResult.cgpa}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {activeTab === 'sgpa' ? 'Current SGPA' : 'Overall CGPA'}
              </div>
              <div className={`text-sm ${performance.color}`}>
                {activeTab === 'sgpa' ? performance.text : `${cgpaResult.filledCount} Semesters entered`}
              </div>
            </div>
          </div>
        </section>

        {activeTab === 'sgpa' ? (
          <>
            {/* STEP 1: Department Selection */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">1. Select Department</h2>
                <span className="text-sm text-muted-foreground">{branchKeys.length} Departments</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-7">
                {branchKeys.map(key => {
                  const dept = BRANCHES_DATA[key];
                  const isSelected = selectedBranch === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectBranch(key)}
                      className={`flex flex-col items-start justify-between rounded-xl p-3.5 text-left border transition-all ${
                        isSelected
                          ? 'border-foreground bg-foreground text-background shadow-sm'
                          : 'border-border bg-card text-foreground hover:bg-muted/70'
                      }`}>
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-background/20' : 'bg-muted'}`}>
                          <BranchIcon type={dept.icon} size={15} color={isSelected ? 'currentColor' : undefined} />
                        </span>
                        {isSelected && <span className="h-2 w-2 rounded-full bg-background" />}
                      </div>
                      <div className="font-semibold text-sm">{key}</div>
                      <div className={`text-xs truncate w-full ${isSelected ? 'text-background/80' : 'text-muted-foreground'}`} title={dept.name}>
                        {dept.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 2: Semester Selection */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">2. Select Semester</h2>
                <span className="text-sm text-muted-foreground">
                  {activeDepartment.name} • Sem {selectedSemester}
                </span>
              </div>

              <Grid columns={{minWidth: 105, repeat: 'fit'}} gap={2}>
                {SEMESTER_OPTIONS.map(sem => {
                  const isSelected = selectedSemester === sem.id;
                  const subjects = activeDepartment.semesters[sem.id] ?? [];
                  const hasData = subjects.length > 0;

                  return (
                    <SelectableCard
                      key={sem.id}
                      label={sem.name}
                      isSelected={isSelected}
                      variant={sem.variant}
                      onChange={isNow => {
                        if (isNow) {
                          handleSelectSemester(sem.id);
                        }
                      }}>
                      <div className="flex flex-col items-center justify-center py-1 text-center w-full">
                        <Text type="body" weight="bold">
                          Sem {sem.id}
                        </Text>
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          {hasData ? `${subjects.length} courses` : 'Custom'}
                        </span>
                      </div>
                    </SelectableCard>
                  );
                })}
              </Grid>
            </section>

            {/* STEP 3: Subjects & Grade Assignment */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold tracking-tight">3. Assign Grades</h2>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {allCurrentSubjects.length} Courses • {calculation.totalCredits} Credits
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground text-[11px] mr-1">Quick:</span>
                  <button
                    type="button"
                    onClick={() => handleSetAllGrades('O')}
                    className="rounded-md bg-muted px-2 py-1 font-medium text-foreground hover:bg-muted/70 transition-colors">
                    All O
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllGrades('A+')}
                    className="rounded-md bg-muted px-2 py-1 font-medium text-foreground hover:bg-muted/70 transition-colors">
                    All A+
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrades({})}
                    className="rounded-md bg-muted px-2 py-1 font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(!showAddCustom)}
                    className="rounded-md border border-border bg-card px-2 py-1 font-medium text-foreground hover:bg-muted/70 transition-colors">
                    + Custom
                  </button>
                </div>
              </div>

              {/* Add Custom Subject Form */}
              {showAddCustom && (
                <form
                  onSubmit={handleAddSubject}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-xs">
                  <h3 className="text-xs font-semibold text-foreground">Add Custom / Elective Course</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">Code</label>
                      <input
                        type="text"
                        placeholder="e.g. U23CS901"
                        value={customCode}
                        onChange={e => setCustomCode(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">Course Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Mobile Application Development"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        required
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">Credits</label>
                      <select
                        value={customCredits}
                        onChange={e => setCustomCredits(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                        <option value="1">1 Credit</option>
                        <option value="2">2 Credits</option>
                        <option value="3">3 Credits</option>
                        <option value="4">4 Credits</option>
                        <option value="6">6 Credits</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCustom(false)}
                      className="rounded-lg px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-foreground px-3 py-1 text-xs font-medium text-background hover:opacity-90">
                      Add
                    </button>
                  </div>
                </form>
              )}

              {/* Empty state */}
              {allCurrentSubjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card">
                  <h3 className="text-sm font-semibold text-foreground">No Predefined Syllabus for Sem {selectedSemester}</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Add your elective and core subjects manually to compute your GPA.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(true)}
                    className="mt-3 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity">
                    + Add Subject
                  </button>
                </div>
              ) : (
                /* Compact Aesthetic Table using @astryxdesign/core/Table */
                <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                  <Table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <tr>
                        <th className="px-3 py-2.5 text-center w-10">#</th>
                        <th className="px-3 py-2.5">Course</th>
                        <th className="px-3 py-2.5 text-center w-20">Credits</th>
                        <th className="px-3 py-2.5 text-center min-w-[260px]">Grade</th>
                        <th className="px-3 py-2.5 text-right w-16">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {allCurrentSubjects.map((subject, idx) => {
                        const activeGrade = grades[subject.code] ?? '';
                        const points = activeGrade ? GRADE_POINTS[activeGrade] * subject.credits : null;
                        return (
                          <tr
                            key={`${subject.code}-${idx}`}
                            className={`transition-colors hover:bg-muted/20 ${
                              activeGrade ? 'bg-card' : 'bg-card/40'
                            }`}>
                            <td className="px-3 py-2.5 text-center font-mono text-[11px] text-muted-foreground">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                                  {subject.code}
                                </span>
                                <span className="font-medium text-foreground text-xs sm:text-sm">
                                  {subject.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-center font-medium text-xs text-muted-foreground">
                              {subject.credits}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
                                {Object.keys(GRADE_POINTS).map(gradeLetter => {
                                  const isChosen = activeGrade === gradeLetter;
                                  return (
                                    <button
                                      key={gradeLetter}
                                      type="button"
                                      onClick={() => handleSetGrade(subject.code, gradeLetter)}
                                      className={`h-6 w-7 sm:h-6 sm:w-8 rounded-md text-[11px] font-semibold transition-all ${
                                        isChosen
                                          ? 'bg-foreground text-background shadow-xs font-bold'
                                          : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                                      }`}>
                                      {gradeLetter}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-foreground">
                              {points !== null ? (
                                <span>{points}</span>
                              ) : (
                                <span className="text-muted-foreground font-normal text-[11px]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </section>

            {/* STICKY LIVE SUMMARY BAR */}
            <div className="sticky bottom-6 mt-8 z-20">
              <div className="rounded-[20px] border border-border bg-card/95 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
                      <span className="text-xl font-bold">{calculation.sgpa}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-background/80">SGPA</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-base">Semester {selectedSemester} Summary</span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                          {performance.text}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          Credits: <strong className="text-foreground">{calculation.earnedCredits}</strong> / {calculation.totalCredits}
                        </span>
                        <span>•</span>
                        <span>
                          Subjects: <strong className="text-foreground">{calculation.gradedCount}</strong> / {calculation.totalSubjects}
                        </span>
                        <span>•</span>
                        <span>
                          Grade Points: <strong className="text-foreground">{calculation.totalWeightedPoints}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const summary = `🎓 ${selectedBranch} - Semester ${selectedSemester} SGPA: ${calculation.sgpa} / 10\nCredits Earned: ${calculation.earnedCredits}/${calculation.totalCredits}\nStatus: ${performance.text}`;
                        navigator.clipboard?.writeText(summary);
                        alert('GPA summary copied to clipboard!');
                      }}
                      className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/70 transition-colors">
                      Copy Result
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity">
                      Print / PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* CGPA CALCULATOR VIEW */
          <section className="flex flex-col gap-6 rounded-[20px] border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Cumulative GPA (CGPA) Calculator</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your SGPA and total credits for each completed semester.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
                <span className="text-sm text-muted-foreground">Overall CGPA:</span>
                <span className="text-2xl font-bold text-foreground">{cgpaResult.cgpa}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {cgpaEntries.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center rounded-xl border border-border bg-muted/20 p-4">
                  <div className="font-medium text-sm text-foreground">
                    Semester {entry.sem}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">SGPA (0 - 10)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g. 8.75"
                      value={entry.gpa}
                      onChange={e => {
                        const val = e.target.value;
                        setCgpaEntries(prev => {
                          const updated = [...prev];
                          updated[index].gpa = val;
                          return updated;
                        });
                      }}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Semester Credits</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="35"
                      placeholder="e.g. 21"
                      value={entry.credits}
                      onChange={e => {
                        const val = e.target.value;
                        setCgpaEntries(prev => {
                          const updated = [...prev];
                          updated[index].credits = val;
                          return updated;
                        });
                      }}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setCgpaEntries(prev => [
                    ...prev,
                    {sem: String(prev.length + 1), gpa: '', credits: '21'},
                  ]);
                }}
                className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/70 transition-colors">
                + Add Semester
              </button>
              <div className="text-sm text-muted-foreground">
                Total Credits Accounted: <strong className="text-foreground">{cgpaResult.totalCreds}</strong>
              </div>
            </div>
          </section>
        )}

        {/* Academic Grading Scale Reference Guide */}
        <section className="rounded-[20px] border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">
            Academic Grading Scale Reference (Regulation 2023)
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7 text-center">
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-xl font-bold text-foreground">O</div>
              <div className="text-xs font-medium text-foreground">Outstanding</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">10 Points</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-xl font-bold text-foreground">A+</div>
              <div className="text-xs font-medium text-foreground">Excellent</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">9 Points</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-xl font-bold text-foreground">A</div>
              <div className="text-xs font-medium text-foreground">Very Good</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">8 Points</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-xl font-bold text-foreground">B+</div>
              <div className="text-xs font-medium text-foreground">Good</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">7 Points</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-xl font-bold text-foreground">B</div>
              <div className="text-xs font-medium text-foreground">Above Average</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">6 Points</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-xl font-bold text-foreground">C</div>
              <div className="text-xs font-medium text-foreground">Average</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">5 Points</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-xl font-bold text-destructive">U</div>
              <div className="text-xs font-medium text-destructive">Re-appear</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">0 Points</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
