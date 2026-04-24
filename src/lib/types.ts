
export type UserRole = 'admin' | 'company' | 'employee';

export type EmployeeRole = 
  | 'General Employee' 
  | 'Developer' 
  | 'Network Engineer' 
  | 'Manager' 
  | 'HR' 
  | 'IT Staff';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  contactEmail: string;
  adminId: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  companyId: string;
  name: string;
  email: string;
  role: EmployeeRole;
  assessmentStatus: 'not_started' | 'in_progress' | 'completed';
}

export interface Question {
  id: string;
  category: 'basic' | 'role_based' | 'dpdp' | 'scenario';
  role: EmployeeRole | 'all';
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy: 'admin' | 'ai';
  createdAt: string;
}

export interface Score {
  score: number;
  total: number;
  percentage: number;
}

export interface Assessment {
  id: string;
  employeeId: string;
  companyId: string;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed';
  selectedRole: EmployeeRole;
  responses: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    timeTaken: number;
  }[];
  scores?: {
    basic: Score;
    role_based: Score;
    dpdp: Score;
    scenario: Score;
    overall: number;
    maturityLevel: number;
  };
  badges: string[];
  recommendations: string[];
}
