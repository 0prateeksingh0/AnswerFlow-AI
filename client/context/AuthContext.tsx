import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    username: string;
    role: "admin" | "guest";
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, username: string, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check local storage on mount
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (token: string, username: string, role: string) => {
        localStorage.setItem("token", token);
        const userData = { username, role: role as "admin" | "guest" };
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(token);
        setUser(userData);
        router.push("/");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
