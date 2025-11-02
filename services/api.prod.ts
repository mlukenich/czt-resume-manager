// --- IMPORTANT ---
// This file provides a "production" API implementation that uses the browser's localStorage.
// This is suitable for a single-user demonstration or portfolio piece as it provides data persistence across sessions.
// However, it is NOT a true multi-user backend. All data is stored on the client-side.
// For a real multi-user application, you would replace this file's logic with calls to a real backend server.
// A blueprint for this can be found in `services/api.backend.ts`.

import { Candidate, User } from '../types';
// Fix: Use GoogleGenAI instead of the deprecated GoogleGenerativeAI.
import { GoogleGenAI, Type } from '@google/genai';

// In a real app, this would be your database. For this demo, we use localStorage.
const getStoredCandidates = (): Candidate[] => {
    const data = localStorage.getItem('prod-candidates');
    return data ? JSON.parse(data) : [];
};

const saveStoredCandidates = (candidates: Candidate[]) => {
    localStorage.setItem('prod-candidates', JSON.stringify(candidates));
};

const getStoredUsers = (): User[] => {
    const data = localStorage.getItem('prod-users');
    if (data) {
        return JSON.parse(data);
    }
    // Default users if none exist
    const defaultUsers = [
        { id: 1, username: 'admin', password: 'admin', isAdmin: true },
        { id: 2, username: 'user', password: 'user', isAdmin: false },
    ];
    localStorage.setItem('prod-users', JSON.stringify(defaultUsers));
    return defaultUsers;
};

const saveStoredUsers = (users: User[]) => {
    localStorage.setItem('prod-users', JSON.stringify(users));
};

// Initialize with some data if empty
if (!localStorage.getItem('prod-candidates')) {
    // We can add some initial candidates if we want
    saveStoredCandidates([]);
}

// --- User Management ---
export const login = (username: string, password?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        const users = getStoredUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            resolve(userWithoutPassword);
        } else {
            reject(new Error('Invalid username or password.'));
        }
    });
};

export const getAllUsers = (): Promise<User[]> => {
    return new Promise((resolve) => {
        const users = getStoredUsers();
        resolve(users.map(({ password, ...user }) => user)); // Don't send passwords
    });
};

export const createUser = (userData: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve, reject) => {
        const users = getStoredUsers();
        if (users.some(u => u.username === userData.username)) {
            return reject(new Error('Username already exists.'));
        }
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newUser: User = { ...userData, id: newId };
        users.push(newUser);
        saveStoredUsers(users);
        const { password, ...userWithoutPassword } = newUser;
        resolve(userWithoutPassword);
    });
};

export const updateUserRole = (userId: number, isAdmin: boolean): Promise<User> => {
    return new Promise((resolve, reject) => {
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users[userIndex].isAdmin = isAdmin;
            saveStoredUsers(users);
            const { password, ...userWithoutPassword } = users[userIndex];
            resolve(userWithoutPassword);
        } else {
            reject(new Error('User not found.'));
        }
    });
};

export const deleteUser = (userId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        let users = getStoredUsers();
        const initialLength = users.length;
        users = users.filter(u => u.id !== userId);
        if (users.length < initialLength) {
            saveStoredUsers(users);
            resolve();
        } else {
            reject(new Error('User not found.'));
        }
    });
};


// --- Candidate Management ---
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const uploadResume = async (file: File): Promise<Candidate> => {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key is not configured. Please ensure the API_KEY environment variable is set in your deployment settings.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const filePart = await fileToGenerativePart(file);
    const resumeTextContent = await file.text(); // A simple text extraction for the prompt
    
    const prompt = `Based on the following resume content, parse it into a structured JSON object. The JSON object must conform to this schema:
    {
        "name": "string",
        "email": "string",
        "phone_number": "string | null",
        "years_of_experience": "number",
        "ai_summary": "string (A 2-3 sentence professional summary highlighting key skills and experience)",
        "security_clearance": "string | null",
        "github_url": "string | null",
        "linkedin_url": "string | null",
        "parsed_skills": {
            "programming_languages": "string[]",
            "frameworks": "string[]",
            "databases": "string[]",
            "platforms_tools": "string[]"
        },
        "parsed_experience": [
            { "job_title": "string", "company": "string", "duration": "string" }
        ]
    }
    
    Resume content:
    ${resumeTextContent.substring(0, 8000)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ parts: [ { text: prompt } ] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone_number: { type: Type.STRING },
                years_of_experience: { type: Type.NUMBER },
                ai_summary: { type: Type.STRING, description: "A 2-3 sentence professional summary highlighting key skills and experience" },
                // Fix: `nullable` is not a valid property in responseSchema. The prompt is sufficient to instruct the model to return null.
                security_clearance: { type: Type.STRING },
                github_url: { type: Type.STRING },
                linkedin_url: { type: Type.STRING },
                parsed_skills: {
                    type: Type.OBJECT,
                    properties: {
                        programming_languages: { type: Type.ARRAY, items: { type: Type.STRING }},
                        frameworks: { type: Type.ARRAY, items: { type: Type.STRING }},
                        databases: { type: Type.ARRAY, items: { type: Type.STRING }},
                        platforms_tools: { type: Type.ARRAY, items: { type: Type.STRING }},
                    }
                },
                parsed_experience: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            job_title: { type: Type.STRING },
                            company: { type: Type.STRING },
                            duration: { type: Type.STRING },
                        }
                    }
                }
            }
        }
      }
    });

    const parsedData = JSON.parse(response.text);

    const candidates = getStoredCandidates();
    const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
    
    const newCandidate: Candidate = {
        ...parsedData,
        id: newId,
        original_resume_url: '#' // In a real app, this would be a URL to stored file
    };

    candidates.unshift(newCandidate);
    saveStoredCandidates(candidates);

    return newCandidate;
};

export const searchCandidates = async (query: string): Promise<Candidate[]> => {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key is not configured. Please ensure the API_KEY environment variable is set in your deployment settings.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const candidates = getStoredCandidates();
    if (candidates.length === 0) return [];
    
    const summaries = candidates.map(c => `ID: ${c.id}, Summary: ${c.ai_summary}`).join('\n');
    
    const prompt = `From the following list of candidate summaries, please return a JSON array of the candidate IDs that are the most relevant to this search query: "${query}". Return only the IDs of the top 3 most relevant candidates.

    Example Response: [1, 5, 2]
    
    Candidate Summaries:
    ${summaries}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [ { text: prompt }] }],
    });
    
    try {
        // Clean the response text to ensure it's valid JSON
        const cleanedText = response.text.replace(/```json|```/g, '').trim();
        const relevantIds: number[] = JSON.parse(cleanedText);
        return candidates.filter(c => relevantIds.includes(c.id));
    } catch (e) {
        console.error("Failed to parse Gemini search response:", e);
        // Fallback to simple keyword search if AI fails
        return candidates.filter(c => c.ai_summary.toLowerCase().includes(query.toLowerCase()));
    }
};

export const getCandidateById = (id: number): Promise<Candidate | null> => {
    const candidates = getStoredCandidates();
    const candidate = candidates.find(c => c.id === id);
    return Promise.resolve(candidate || null);
};

export const getAllCandidates = (): Promise<Candidate[]> => {
    const candidates = getStoredCandidates();
    return Promise.resolve([...candidates]);
};


// --- Session Management ---
export const getSession = () => {
  const sessionJson = localStorage.getItem('rms-session');
  if (sessionJson) {
    try {
        const session = JSON.parse(sessionJson);
        // Basic validation
        if(session && session.user && session.token) {
            return session;
        }
    } catch(e) {
        return null;
    }
  }
  return null;
};

export const createSession = (user: User) => {
  const { password, ...userToStore } = user;
  const session = { user: userToStore, token: `prod-token-for-${user.username}-${Date.now()}` };
  localStorage.setItem('rms-session', JSON.stringify(session));
  return session;
};

export const clearSession = () => {
  localStorage.removeItem('rms-session');
};