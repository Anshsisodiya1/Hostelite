import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();


export const useAuth = () => useContext(AuthContext); 


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // load auth data on referesh

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (token, user) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setToken(token);
        setUser(user);
    };
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
         <AuthContext.Provider 
            value={{ 
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token,
                loading
            }}
            >
            {children}
            </AuthContext.Provider>
    );
};
