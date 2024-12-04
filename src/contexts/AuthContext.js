import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe; // Cleanup subscription on component unmount
    }, []);

    const signup = async (email, password, name) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });
            setUser({ ...user, displayName: name }); // Update local state with the name
            return user;
        } catch (error) {
            console.error("Error during signup:", error.message);
            throw error; // Rethrow to handle it at the component level
        }
    };

    const login = async (email, password) => {
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error during login:", error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error during logout:", error.message);
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error("Error during password reset:", error.message);
            throw error;
        }
    };

    const value = {
        user,
        signup,
        login,
        logout,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : <p>Loading...</p>}
        </AuthContext.Provider>
    );
}
