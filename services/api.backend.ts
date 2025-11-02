// This file serves as a blueprint for connecting the frontend to a real, multi-user backend API.
// To use this, you would need to:
// 1. Build a backend server (e.g., using Node.js/Express, Python/Django, etc.).
// 2. Implement the API endpoints defined below, which would interact with a shared database.
// 3. Update the `services/api.ts` file to export from this file instead of `api.prod.ts`.
// 4. Configure your deployment environment (e.g., Netlify) to proxy requests from '/api/v1' to your backend server to avoid CORS issues.

import { Candidate, User, Session } from '../types';

const API_BASE_URL = '/api/v1'; // Using a relative path for proxying

// A helper function to process API responses
const handleResponse = async (response: Response) => {
    if (response.ok) {
        // Handle '204 No Content' success case
        if (response.status === 204) {
            return;
        }
        return response.json();
    } else {
        const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
};

// A helper to get the auth token for authenticated requests
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- User Management ---
export const login = async (username: string, password?: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    // Expect the backend to return { user: User, token: string }
    const { user, token } = await handleResponse(response);
    if (!token) {
        throw new Error('Login successful, but no auth token was provided by the server.');
    }
    // Store the token for subsequent requests
    localStorage.setItem('authToken', token);
    return user;
};

export const getAllUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

export const updateUserRole = async (userId: number, isAdmin: boolean): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isAdmin }),
    });
    return handleResponse(response);
};

export const deleteUser = async (userId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    await handleResponse(response);
};

// --- Candidate Management ---
export const uploadResume = async (file: File): Promise<Candidate> => {
    const formData = new FormData();
    formData.append('resume', file);

    // Note: When using fetch with FormData, you should NOT set the 'Content-Type' header yourself.
    // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/candidates/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });
    return handleResponse(response);
};

export const searchCandidates = async (query: string): Promise<Candidate[]> => {
    const response = await fetch(`${API_BASE_URL}/candidates/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const getCandidateById = async (id: number): Promise<Candidate | null> => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const getAllCandidates = async (): Promise<Candidate[]> => {
    const response = await fetch(`${API_BASE_URL}/candidates`, { headers: getAuthHeaders() });
    return handleResponse(response);
};


// --- Session Management ---
// In a real backend scenario, session is managed via auth tokens.
// These functions bridge that system with the app's React context.

export const getSession = (): Session | null => {
  // On app load, this function checks for the user info and token.
  // A robust implementation would also include a call to a `/api/v1/auth/me` endpoint
  // to verify the token is still valid and get the latest user data.
  const sessionJson = localStorage.getItem('rms-session');
  const token = localStorage.getItem('authToken');

  if (sessionJson && token) {
    try {
        const session = JSON.parse(sessionJson);
        if (session && session.user) {
            return { user: session.user, token };
        }
    } catch(e) {
        // If parsing fails, clear out the bad data
        clearSession();
        return null;
    }
  }
  return null;
};

export const createSession = (user: User): Session => {
  // This is called right after a successful login.
  // The token has already been set in localStorage by the login function.
  // This function's job is to store the user object for the UI.
  const token = localStorage.getItem('authToken');
  if (!token) {
      throw new Error("Cannot create session without an auth token.");
  }
  const session = { user, token };
  // We store the user object in a separate localStorage item for easy access by the UI.
  localStorage.setItem('rms-session', JSON.stringify({ user }));
  return session;
};

export const clearSession = (): void => {
  // Clear all session-related data on logout.
  localStorage.removeItem('rms-session');
  localStorage.removeItem('authToken');
};