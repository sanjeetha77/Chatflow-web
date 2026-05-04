import React, { createContext, useState, useEffect } from 'react';
import { updateUser as updateApi } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('chatflow_user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (user) => {
        setCurrentUser(user);
        sessionStorage.setItem('chatflow_user', JSON.stringify(user));
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('chatflow_user');
    };

    const updateUserProfile = async (data) => {
        try {
            const updatedUser = await updateApi(currentUser._id, data);
            setCurrentUser(updatedUser);
            sessionStorage.setItem('chatflow_user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
