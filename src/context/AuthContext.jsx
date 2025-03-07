import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUser, logout as apiLogout } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUser();
                setUser(data);

            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setLoading(false);
            }

        };
        fetchUser();
    }, []);

    const login = async (userData) => {
        setUser(userData);
        navigate("/home");
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);
