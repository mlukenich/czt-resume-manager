// Fix: Added export to make this file a module and defined all necessary types.
export interface WorkExperience {
  job_title: string;
  company: string;
  duration: string;
}

export interface TechnicalSkills {
  programming_languages: string[];
  frameworks: string[];
  databases: string[];
  platforms_tools: string[];
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  years_of_experience: number;
  ai_summary: string;
  security_clearance: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  original_resume_url: string | null;
  parsed_skills: TechnicalSkills;
  parsed_experience: WorkExperience[];
}

export interface CandidateNotes {
  salaryRange: string;
  potentialContracts: string;
  generalNotes: string;
  potentialRoles: string[];
}

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
  password?: string; // Only used for creation/login
}

export interface Session {
  user: Omit<User, 'password'>; // Ensure password is not stored in session
  token: string;
}