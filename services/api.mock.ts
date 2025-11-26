// Fix: Implemented the mock API with sample data.
import { Candidate, User } from '../types';

let nextCandidateId = 4;
const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone_number: '555-123-4567',
    years_of_experience: 8,
    ai_summary: 'A skilled Senior Java Developer with extensive experience in AWS and microservices architecture. Proven ability to lead teams and deliver high-quality software solutions.',
    security_clearance: 'Top Secret',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
    original_resume_url: '#',
    parsed_skills: {
      programming_languages: ['Java', 'Python', 'JavaScript'],
      frameworks: ['Spring Boot', 'React', 'Node.js'],
      databases: ['PostgreSQL', 'MongoDB', 'Redis'],
      platforms_tools: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
    },
    parsed_experience: [
      { job_title: 'Senior Software Engineer', company: 'Tech Solutions Inc.', duration: '2018 - Present' },
      { job_title: 'Software Engineer', company: 'Innovate Corp.', duration: '2015 - 2018' },
    ],
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone_number: '555-987-6543',
    years_of_experience: 5,
    ai_summary: 'A mid-level Cloud Engineer specializing in Google Cloud Platform. Strong background in infrastructure as code and CI/CD pipelines.',
    security_clearance: null,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
    original_resume_url: '#',
    parsed_skills: {
      programming_languages: ['Go', 'Python'],
      frameworks: [],
      databases: ['BigQuery', 'Cloud SQL'],
      platforms_tools: ['GCP', 'Terraform', 'Ansible', 'GitLab CI'],
    },
    parsed_experience: [
      { job_title: 'Cloud Engineer', company: 'Cloudy Skies LLC', duration: '2019 - Present' },
      { job_title: 'DevOps Engineer', company: 'StartupX', duration: '2017 - 2019' },
    ],
  },
   {
    id: 3,
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    phone_number: null,
    years_of_experience: 12,
    ai_summary: 'An experienced Cloud Architect with a demonstrated history of designing and implementing scalable and resilient cloud solutions on Azure. Certified Azure Solutions Architect Expert.',
    security_clearance: 'Secret',
    github_url: null,
    linkedin_url: 'https://linkedin.com',
    original_resume_url: '#',
    parsed_skills: {
      programming_languages: ['C#', '.NET', 'PowerShell'],
      frameworks: ['ASP.NET Core'],
      databases: ['MS SQL Server', 'Cosmos DB'],
      platforms_tools: ['Azure', 'ARM Templates', 'Azure DevOps', 'Kubernetes'],
    },
    parsed_experience: [
      { job_title: 'Cloud Architect', company: 'Enterprise Cloud Systems', duration: '2016 - Present' },
      { job_title: 'Senior .NET Developer', company: 'Legacy Software Co.', duration: '2010 - 2016' },
    ],
  },
];

// --- User Management ---
let nextUserId = 3;
let MOCK_USERS: User[] = [
    { id: 1, username: 'admin', password: 'admin', isAdmin: true },
    { id: 2, username: 'user', password: 'user', isAdmin: false },
];

export const login = (username: string, password?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = MOCK_USERS.find(u => u.username === username && u.password === password);
            if (user) {
                const { password, ...userWithoutPassword } = user;
                resolve(userWithoutPassword);
            } else {
                reject(new Error('Invalid username or password.'));
            }
        }, 500);
    });
};

export const getAllUsers = (): Promise<User[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_USERS.map(({ password, ...user }) => user)); // Don't send passwords to client
        }, 300);
    });
};

export const createUser = (userData: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (MOCK_USERS.some(u => u.username === userData.username)) {
                return reject(new Error('Username already exists.'));
            }
            const newUser: User = { ...userData, id: nextUserId++ };
            MOCK_USERS.push(newUser);
            const { password, ...userWithoutPassword } = newUser;
            resolve(userWithoutPassword);
        }, 300);
    });
};

export const updateUserRole = (userId: number, isAdmin: boolean): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
            if (userIndex > -1) {
                MOCK_USERS[userIndex].isAdmin = isAdmin;
                const { password, ...userWithoutPassword } = MOCK_USERS[userIndex];
                resolve(userWithoutPassword);
            } else {
                reject(new Error('User not found.'));
            }
        }, 300);
    });
};

export const deleteUser = (userId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const initialLength = MOCK_USERS.length;
            MOCK_USERS = MOCK_USERS.filter(u => u.id !== userId);
            if (MOCK_USERS.length < initialLength) {
                resolve();
            } else {
                reject(new Error('User not found.'));
            }
        }, 300);
    });
};

// --- Candidate Management ---
export const uploadResume = (file: File): Promise<Candidate> => {
  console.log('Uploading file:', file.name);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCandidate: Candidate = {
        id: nextCandidateId++,
        name: 'New Candidate',
        email: 'new.candidate@example.com',
        phone_number: '555-555-5555',
        years_of_experience: 3,
        ai_summary: 'This is a newly uploaded candidate. Summary generated by AI based on the resume content.',
        security_clearance: null,
        github_url: null,
        linkedin_url: null,
        original_resume_url: '#',
        parsed_skills: {
            programming_languages: ['Python', 'SQL'],
            frameworks: ['Flask'],
            databases: ['SQLite'],
            platforms_tools: ['Git', 'Docker'],
        },
        parsed_experience: [
            { job_title: 'Junior Developer', company: 'A Good Company', duration: '2021-2023' }
        ],
      };
      MOCK_CANDIDATES.unshift(newCandidate);
      resolve(newCandidate);
    }, 1500);
  });
};

export const searchCandidates = (query: string): Promise<Candidate[]> => {
    console.log('Searching for:', query);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (query.toLowerCase().includes('java')) {
                resolve(MOCK_CANDIDATES.filter(c => c.id === 1));
            } else if (query.toLowerCase().includes('cloud')) {
                resolve(MOCK_CANDIDATES.filter(c => c.id === 2 || c.id === 3));
            } else {
                 resolve(MOCK_CANDIDATES.slice(0, 2));
            }
        }, 1000);
    });
};

export const getCandidateById = (id: number): Promise<Candidate | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const candidate = MOCK_CANDIDATES.find((c) => c.id === id);
            resolve(candidate || null);
        }, 500);
    });
};

export const getAllCandidates = (): Promise<Candidate[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...MOCK_CANDIDATES]);
        }, 800);
    });
};


// --- Session Management ---
export const getSession = () => {
  const sessionJson = localStorage.getItem('rms-session');
  if (sessionJson) {
    return JSON.parse(sessionJson);
  }
  return null;
};

export const createSession = (user: User) => {
  const { password, ...userToStore } = user;
  const session = { user: userToStore, token: `mock-token-for-${user.username}` };
  localStorage.setItem('rms-session', JSON.stringify(session));
  return session;
};

export const clearSession = () => {
  localStorage.removeItem('rms-session');
};