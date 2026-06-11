import { createContext, useState, useEffect } from "react";
import API_BASE_URL from "./config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                        headers: {
                            "Authorization": `Bearer ${storedToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                        setToken(storedToken);
                    } else {
                        // Token is invalid
                        localStorage.removeItem("token");
                        setToken(null);
                    }
                } catch (error) {
                    console.error("Auth check error:", error);
                    localStorage.removeItem("token");
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const signup = async (name, email, password) => {
        setAuthError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.errors?.[0]?.msg || "Signup failed");
            }

            localStorage.setItem("token", data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            setAuthError(error.message);
            return { success: false, error: error.message };
        }
    };

    const login = async (email, password) => {
        setAuthError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.errors?.[0]?.msg || "Login failed");
            }

            localStorage.setItem("token", data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            setAuthError(error.message);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        authError,
        signup,
        login,
        logout,
        isAuthenticated: !!token
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
