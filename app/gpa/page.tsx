'use client';

import {useState, useMemo, type CSSProperties} from 'react';
import Link from 'next/link';

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
    color: '#3B82F6',
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
    color: '#06B6D4',
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
    color: '#F59E0B',
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
    color: '#EAB308',
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
    color: '#EF4444',
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
    color: '#8B5CF6',
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
    color: '#10B981',
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
    color: '#EC4899',
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
    color: '#F43F5E',
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
    color: '#14B8A6',
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
    color: '#6366F1',
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
    color: '#A855F7',
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
    color: '#0284C7',
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
    color: '#4F46E5',
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

// SVG Icon renderer matching each department
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

  // CGPA entries: { sem: string, gpa: string, credits: string }[]
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

  // Handle branch switch
  const handleSelectBranch = (key: string) => {
    setSelectedBranch(key);
    setGrades({});
    setCustomSubjects([]);
  };

  // Handle semester switch
  const handleSelectSemester = (sem: string) => {
    setSelectedSemester(sem);
    setGrades({});
    setCustomSubjects([]);
  };

  // Assign grade to a subject
  const handleSetGrade = (code: string, grade: string) => {
    setGrades(prev => ({...prev, [code]: grade}));
  };

  // Quick actions: set all subjects
  const handleSetAllGrades = (grade: string) => {
    const updated: Record<string, string> = {};
    allCurrentSubjects.forEach(s => {
      updated[s.code] = grade;
    });
    setGrades(updated);
  };

  // Add custom subject
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
    if (calculation.gradedCount === 0) return {text: 'Select your grades below', color: '#6B7280'};
    if (calculation.arrearsCount > 0) return {text: `${calculation.arrearsCount} Arrear(s) Pending`, color: '#EF4444'};
    if (calculation.sgpa >= 9.0) return {text: 'Outstanding • First Class with Distinction', color: '#10B981'};
    if (calculation.sgpa >= 8.0) return {text: 'Excellent • First Class', color: '#3B82F6'};
    if (calculation.sgpa >= 7.0) return {text: 'Very Good', color: '#8B5CF6'};
    if (calculation.sgpa >= 6.0) return {text: 'Good', color: '#F59E0B'};
    return {text: 'Passing Grade', color: '#6B7280'};
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
    <div className="min-h-screen bg-[#0d0f14] text-neutral-100 antialiased pb-24 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-20 transition-all duration-700"
          style={{backgroundColor: activeDepartment.color}}
        />
        <div className="absolute top-[40%] -left-32 w-80 h-80 rounded-full blur-[120px] bg-indigo-500/10" />
        <div className="absolute top-[60%] -right-32 w-80 h-80 rounded-full blur-[120px] bg-purple-500/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between pb-8 border-b border-neutral-800/80">
          <Link
            href="/landing"
            className="group inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2 text-sm font-medium text-neutral-300 backdrop-blur-md transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white">
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            <span>Back to Hub</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-neutral-900/90 p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveTab('sgpa')}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'sgpa'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}>
                Semester SGPA
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cgpa')}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'cgpa'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}>
                Overall CGPA
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="py-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between gap-6 border-b border-neutral-800/80">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Regulation 2023 Autonomous Curriculum
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              GPA & SGPA Calculator
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-xl">
              Choose your department and semester to compute your exact grade points with live academic honors analytics.
            </p>
          </div>

          {/* Quick Score HUD badge in hero */}
          <div className="mt-6 sm:mt-0 flex items-center justify-center sm:justify-end">
            <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/70 p-4 backdrop-blur-xl shadow-xl flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-bold text-2xl transition-colors shadow-inner"
                style={{
                  backgroundColor: `${activeDepartment.color}15`,
                  color: activeDepartment.color,
                  border: `1px solid ${activeDepartment.color}35`,
                }}>
                {activeTab === 'sgpa' ? calculation.sgpa : cgpaResult.cgpa}
              </div>
              <div className="text-left">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  {activeTab === 'sgpa' ? 'Computed SGPA' : 'Overall CGPA'}
                </div>
                <div className="text-xs font-medium" style={{color: performance.color}}>
                  {activeTab === 'sgpa' ? performance.text : `${cgpaResult.filledCount} Semesters Calculated`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'sgpa' ? (
          <>
            {/* STEP 1: Department Selection */}
            <section className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-300">
                    1
                  </span>
                  <h2 className="text-base font-semibold text-white">Select Department</h2>
                </div>
                <span className="text-xs text-neutral-400">{branchKeys.length} Departments Available</span>
              </div>

              {/* Department Pills / Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {branchKeys.map(key => {
                  const dept = BRANCHES_DATA[key];
                  const isSelected = selectedBranch === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectBranch(key)}
                      className={`group relative flex flex-col items-start justify-between rounded-xl p-3 text-left transition-all duration-200 border ${
                        isSelected
                          ? 'bg-neutral-800/90 shadow-lg scale-[1.02]'
                          : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-850 hover:border-neutral-700'
                      }`}
                      style={{
                        borderColor: isSelected ? dept.color : undefined,
                        boxShadow: isSelected ? `0 0 16px ${dept.color}20` : undefined,
                      }}>
                      <div className="flex items-center justify-between w-full mb-2">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${dept.color}18`,
                            color: dept.color,
                          }}>
                          <BranchIcon type={dept.icon} size={16} color={dept.color} />
                        </span>
                        {isSelected && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{backgroundColor: dept.color}}
                          />
                        )}
                      </div>
                      <div className="font-bold text-sm tracking-tight text-white">{key}</div>
                      <div className="text-[11px] text-neutral-400 truncate w-full" title={dept.name}>
                        {dept.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 2: Semester Selection */}
            <section className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-300">
                    2
                  </span>
                  <h2 className="text-base font-semibold text-white">Select Semester</h2>
                </div>
                <span className="text-xs text-neutral-400">
                  {activeDepartment.name} • Sem {selectedSemester}
                </span>
              </div>

              {/* Semester Tabs */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8'].map(sem => {
                  const isSelected = selectedSemester === sem;
                  const subjects = activeDepartment.semesters[sem] ?? [];
                  const hasData = subjects.length > 0;

                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => handleSelectSemester(sem)}
                      className={`relative flex flex-col items-center justify-center rounded-xl py-3 px-2 border transition-all ${
                        isSelected
                          ? 'bg-neutral-800 text-white font-semibold border-indigo-500 shadow-md scale-[1.02]'
                          : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}>
                      <span className="text-xs uppercase tracking-wider text-neutral-400">Sem</span>
                      <span className="text-xl font-bold text-white">{sem}</span>
                      <span className="mt-1 text-[10px] text-neutral-400 font-mono">
                        {hasData ? `${subjects.length} sub` : 'Custom'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 3: Subjects & Grade Assignment */}
            <section className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-300">
                    3
                  </span>
                  <h2 className="text-base font-semibold text-white">
                    Enter Subject Grades ({allCurrentSubjects.length} Courses)
                  </h2>
                </div>

                {/* Quick actions for setting all grades */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-neutral-400">Quick Fill:</span>
                  <button
                    type="button"
                    onClick={() => handleSetAllGrades('O')}
                    className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                    All O (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllGrades('A+')}
                    className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors">
                    All A+ (9)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrades({})}
                    className="rounded-lg bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-400 hover:text-white transition-colors">
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(!showAddCustom)}
                    className="rounded-lg border border-neutral-700 bg-neutral-800/80 px-2.5 py-1 text-xs font-semibold text-neutral-200 hover:border-neutral-500 transition-colors">
                    + Add Subject
                  </button>
                </div>
              </div>

              {/* Add Custom Subject Drawer */}
              {showAddCustom && (
                <form
                  onSubmit={handleAddSubject}
                  className="mb-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 sm:p-5 backdrop-blur-md">
                  <div className="text-sm font-bold text-white mb-3">Add Custom or Elective Course</div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-1">
                        Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. U23CS901"
                        value={customCode}
                        onChange={e => setCustomCode(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-1">
                        Course Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cloud Computing & DevOps"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-1">
                        Credits
                      </label>
                      <select
                        value={customCredits}
                        onChange={e => setCustomCredits(e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                        <option value="1">1 Credit</option>
                        <option value="2">2 Credits</option>
                        <option value="3">3 Credits</option>
                        <option value="4">4 Credits</option>
                        <option value="6">6 Credits</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCustom(false)}
                      className="rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:text-white">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">
                      Add to List
                    </button>
                  </div>
                </form>
              )}

              {/* No subjects in this semester state */}
              {allCurrentSubjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800/80 text-neutral-400 mb-3">
                    <BranchIcon type="code" size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-white">No Predefined Syllabus for Semester {selectedSemester}</h3>
                  <p className="mt-1 text-sm text-neutral-400 max-w-md mx-auto">
                    You can still calculate your GPA! Add your elective and core subjects using the button below.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(true)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                    + Add Subjects Manually
                  </button>
                </div>
              ) : (
                /* Subjects Cards List */
                <div className="flex flex-col gap-3">
                  {allCurrentSubjects.map((subject, idx) => {
                    const activeGrade = grades[subject.code] ?? '';
                    return (
                      <div
                        key={`${subject.code}-${idx}`}
                        className={`rounded-2xl border transition-all duration-150 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          activeGrade
                            ? 'bg-neutral-900/90 border-neutral-800 shadow-md'
                            : 'bg-neutral-900/50 border-neutral-850 hover:border-neutral-800'
                        }`}>
                        {/* Course Info */}
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800/90 border border-neutral-700/60 font-mono text-xs font-bold text-neutral-300">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                                {subject.code}
                              </span>
                              <span className="text-xs font-medium text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-md">
                                {subject.credits} {subject.credits === 1 ? 'Credit' : 'Credits'}
                              </span>
                              {activeGrade && (
                                <span className="text-xs font-bold text-emerald-400">
                                  Points: {GRADE_POINTS[activeGrade] * subject.credits}
                                </span>
                              )}
                            </div>
                            <h4 className="mt-1 font-semibold text-sm sm:text-base text-white">
                              {subject.name}
                            </h4>
                          </div>
                        </div>

                        {/* Grade Selector Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap justify-start md:justify-end">
                          {Object.entries(GRADE_POINTS).map(([gradeLetter, gradeVal]) => {
                            const isChosen = activeGrade === gradeLetter;
                            let activeStyle = 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white';

                            if (isChosen) {
                              if (gradeLetter === 'O') activeStyle = 'bg-emerald-500 text-white font-bold border-emerald-400 shadow-lg shadow-emerald-500/30';
                              else if (gradeLetter === 'A+') activeStyle = 'bg-blue-500 text-white font-bold border-blue-400 shadow-lg shadow-blue-500/30';
                              else if (gradeLetter === 'A') activeStyle = 'bg-cyan-500 text-white font-bold border-cyan-400 shadow-lg shadow-cyan-500/30';
                              else if (gradeLetter === 'B+') activeStyle = 'bg-amber-500 text-black font-bold border-amber-400 shadow-lg shadow-amber-500/30';
                              else if (gradeLetter === 'B') activeStyle = 'bg-yellow-500 text-black font-bold border-yellow-400 shadow-lg shadow-yellow-500/30';
                              else if (gradeLetter === 'C') activeStyle = 'bg-orange-500 text-white font-bold border-orange-400 shadow-lg shadow-orange-500/30';
                              else if (gradeLetter === 'U') activeStyle = 'bg-red-500 text-white font-bold border-red-400 shadow-lg shadow-red-500/30';
                            }

                            return (
                              <button
                                key={gradeLetter}
                                type="button"
                                onClick={() => handleSetGrade(subject.code, gradeLetter)}
                                className={`rounded-xl border px-3 py-2 text-xs transition-all active:scale-95 min-w-[42px] flex flex-col items-center ${activeStyle}`}>
                                <span className="font-bold">{gradeLetter}</span>
                                <span className="text-[9px] opacity-80">{gradeVal}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* REAL-TIME SUMMARY & ANALYTICS BAR */}
            <div className="sticky bottom-6 mt-12 z-20">
              <div className="rounded-2xl border border-neutral-700/80 bg-neutral-900/90 p-4 sm:p-5 backdrop-blur-2xl shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left: Overall score metrics */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25">
                      <span className="text-2xl font-black tracking-tight">{calculation.sgpa}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">SGPA</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">Semester {selectedSemester} Summary</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{backgroundColor: `${performance.color}20`, color: performance.color}}>
                          {performance.text}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                        <span>
                          Credits: <strong className="text-white">{calculation.earnedCredits}</strong> / {calculation.totalCredits}
                        </span>
                        <span>•</span>
                        <span>
                          Subjects: <strong className="text-white">{calculation.gradedCount}</strong> / {calculation.totalSubjects}
                        </span>
                        <span>•</span>
                        <span>
                          Total Points: <strong className="text-white">{calculation.totalWeightedPoints}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const summary = `🎓 ${selectedBranch} - Semester ${selectedSemester} SGPA: ${calculation.sgpa} / 10\nCredits Earned: ${calculation.earnedCredits}/${calculation.totalCredits}\nStatus: ${performance.text}`;
                        navigator.clipboard?.writeText(summary);
                        alert('GPA summary copied to clipboard!');
                      }}
                      className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-750 transition-colors shadow-sm">
                      Copy Result
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30">
                      Print / PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* CGPA CALCULATOR VIEW */
          <section className="mt-8">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Cumulative GPA (CGPA) Calculator</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Enter your SGPA and total credits for each completed semester.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-neutral-850 px-4 py-3 rounded-2xl border border-neutral-750">
                  <span className="text-xs text-neutral-400">Calculated CGPA:</span>
                  <span className="text-2xl font-black text-indigo-400">{cgpaResult.cgpa}</span>
                </div>
              </div>

              {/* CGPA Semester Rows */}
              <div className="mt-6 flex flex-col gap-3">
                {cgpaEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-4">
                    <div className="font-semibold text-sm text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      Semester {entry.sem}
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-1">
                        SGPA (Out of 10)
                      </label>
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
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-1">
                        Semester Credits
                      </label>
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
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCgpaEntries(prev => [
                      ...prev,
                      {sem: String(prev.length + 1), gpa: '', credits: '21'},
                    ]);
                  }}
                  className="rounded-xl border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-750 transition-colors">
                  + Add Another Semester
                </button>
                <div className="text-xs text-neutral-400">
                  Total Credits Accounted: <strong className="text-white">{cgpaResult.totalCreds}</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Academic Grading Scale Reference Guide */}
        <section className="mt-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-3">Academic Grading System & Grade Points Reference</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center text-xs">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="text-lg font-black text-emerald-400">O</div>
              <div className="font-semibold text-white">Outstanding</div>
              <div className="text-neutral-400 mt-1 font-mono">10 Points</div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="text-lg font-black text-blue-400">A+</div>
              <div className="font-semibold text-white">Excellent</div>
              <div className="text-neutral-400 mt-1 font-mono">9 Points</div>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
              <div className="text-lg font-black text-cyan-400">A</div>
              <div className="font-semibold text-white">Very Good</div>
              <div className="text-neutral-400 mt-1 font-mono">8 Points</div>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="text-lg font-black text-amber-400">B+</div>
              <div className="font-semibold text-white">Good</div>
              <div className="text-neutral-400 mt-1 font-mono">7 Points</div>
            </div>
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
              <div className="text-lg font-black text-yellow-400">B</div>
              <div className="font-semibold text-white">Above Average</div>
              <div className="text-neutral-400 mt-1 font-mono">6 Points</div>
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
              <div className="text-lg font-black text-orange-400">C</div>
              <div className="font-semibold text-white">Average</div>
              <div className="text-neutral-400 mt-1 font-mono">5 Points</div>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
              <div className="text-lg font-black text-red-400">U</div>
              <div className="font-semibold text-white">Re-appear</div>
              <div className="text-neutral-400 mt-1 font-mono">0 Points</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
