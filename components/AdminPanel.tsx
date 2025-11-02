import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types.ts';
import { getAllUsers, createUser, updateUserRole, deleteUser } from '../services/api.ts';

const INITIAL_ROLES = ['SWE', 'SE', 'CLOUD SWE', 'CLOUD ARCH', 'DBA', 'DBE', 'SA', 'DEVOPS'];

const AdminPanel: React.FC = () => {
    // Role Management State
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [newRole, setNewRole] = useState('');
    const [isRolesSaved, setIsRolesSaved] = useState(false);

    // User Management State
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [newUser, setNewUser] = useState({ username: '', password: '', isAdmin: false });
    const [userError, setUserError] = useState('');

    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
        setIsLoadingUsers(false);
    }, []);

    useEffect(() => {
        // Load available roles
        const savedRolesRaw = localStorage.getItem('rms-available-roles');
        setAvailableRoles(savedRolesRaw ? JSON.parse(savedRolesRaw) : INITIAL_ROLES);
        
        // Load users
        fetchUsers();
    }, [fetchUsers]);

    // Role Management Handlers
    const handleAddRole = () => {
        if (newRole.trim() && !availableRoles.includes(newRole.trim().toUpperCase())) {
            const updatedRoles = [...availableRoles, newRole.trim().toUpperCase()];
            setAvailableRoles(updatedRoles);
            localStorage.setItem('rms-available-roles', JSON.stringify(updatedRoles));
            setNewRole('');
            showRolesSavedConfirmation();
        }
    };

    const handleRemoveRole = (roleToRemove: string) => {
        const updatedRoles = availableRoles.filter(role => role !== roleToRemove);
        setAvailableRoles(updatedRoles);
        localStorage.setItem('rms-available-roles', JSON.stringify(updatedRoles));
        showRolesSavedConfirmation();
    };
    
    const showRolesSavedConfirmation = () => {
        setIsRolesSaved(true);
        setTimeout(() => setIsRolesSaved(false), 2000);
    };

    // User Management Handlers
    const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setNewUser(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            setUserError('Username and password are required.');
            return;
        }
        setUserError('');
        try {
            await createUser(newUser);
            setNewUser({ username: '', password: '', isAdmin: false });
            fetchUsers();
        } catch (error) {
            if (error instanceof Error) setUserError(error.message);
        }
    };
    
    const handleToggleAdmin = async (userId: number, isAdmin: boolean) => {
        try {
            await updateUserRole(userId, isAdmin);
            fetchUsers();
        } catch (error) {
            if (error instanceof Error) setUserError(error.message);
        }
    };
    
    const handleDeleteUser = async (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUser(userId);
                fetchUsers();
            } catch (error) {
                if (error instanceof Error) setUserError(error.message);
            }
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 text-center">Admin Panel</h2>

            {/* Role Management */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-700 mb-4">Manage Potential Roles</h3>
                <div className="flex space-x-2 mb-4">
                    <input type="text" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="e.g., SRE" className="flex-grow w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary/50"/>
                    <button onClick={handleAddRole} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark">Add Role</button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex flex-wrap gap-2">
                        {availableRoles.map(role => (
                            <span key={role} className="flex items-center bg-slate-200 text-slate-800 text-sm font-medium pl-3 pr-1 py-1 rounded-full">
                                {role}
                                <button onClick={() => handleRemoveRole(role)} className="ml-2 text-slate-500 hover:bg-slate-300 rounded-full p-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                {isRolesSaved && <p className="text-sm text-green-600 mt-2 text-right">Changes saved!</p>}
            </div>

            {/* User Management */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-700 mb-4">User Management</h3>
                <form onSubmit={handleCreateUser} className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700">Username</label>
                        <input type="text" name="username" value={newUser.username} onChange={handleNewUserChange} className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"/>
                    </div>
                    <div className="md:col-span-1">
                         <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"/>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center h-full mt-1">
                           <input id="isAdmin" name="isAdmin" type="checkbox" checked={newUser.isAdmin} onChange={handleNewUserChange} className="h-4 w-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary"/>
                           <label htmlFor="isAdmin" className="ml-2 block text-sm text-slate-900">Is Admin?</label>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark w-full">Create User</button>
                    </div>
                     {userError && <p className="text-sm text-red-600 md:col-span-3">{userError}</p>}
                </form>

                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead className="border-b-2 border-slate-200 bg-slate-50">
                            <tr>
                                <th className="p-3 font-semibold text-sm text-slate-600">Username</th>
                                <th className="p-3 font-semibold text-sm text-slate-600">Role</th>
                                <th className="p-3 font-semibold text-sm text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-slate-200">
                                    <td className="p-3">{user.username}</td>
                                    <td className="p-3">{user.isAdmin ? 'Admin' : 'User'}</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button onClick={() => handleToggleAdmin(user.id, !user.isAdmin)} className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Toggle Admin</button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;