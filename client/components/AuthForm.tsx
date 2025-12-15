import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export function AuthForm({ type }: { type: "login" | "register" }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const url = type === "login"
            ? "http://localhost:8000/auth/token"
            : "http://localhost:8000/auth/register";

        try {
            let body;
            let headers = {};

            if (type === "login") {
                // OAuth2PasswordRequestForm expects form data
                const formData = new FormData();
                formData.append("username", username);
                formData.append("password", password);
                body = formData;
                // Fetch automatically sets Content-Type for FormData
            } else {
                body = JSON.stringify({ username, email, password });
                headers = { "Content-Type": "application/json" };
            }

            const res = await fetch(url, {
                method: "POST",
                headers: headers,
                body: body,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Authentication failed");
            }

            const data = await res.json();

            if (type === "login") {
                // Decode token to get role/username? 
                // For MVP we can just trust the response or decode the JWT on client.
                // Let's decode the JWT simple payload
                const payload = JSON.parse(atob(data.access_token.split('.')[1]));
                login(data.access_token, payload.sub, payload.role || "guest");
            } else {
                // After register, redirect to login
                router.push("/login");
            }

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto p-8 glass-panel rounded-2xl">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-black mb-2 text-white capitalize tracking-tighter">{type}</h2>
                <p className="text-gray-500 text-sm">Welcome back to the community</p>
            </div>

            {error && <div className="bg-red-500/10 text-red-400 p-3 mb-6 text-sm border border-red-500/20 rounded-lg text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-500 ml-1">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 glass-input rounded-xl text-lg"
                        placeholder="Enter username"
                        required
                    />
                </div>

                {type === "register" && (
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-gray-500 ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 glass-input rounded-xl text-lg"
                            placeholder="Enter email"
                            required
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-500 ml-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 glass-input rounded-xl text-lg"
                        placeholder="Enter password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full glass-button py-4 rounded-xl text-sm uppercase tracking-widest mt-4"
                >
                    {type === "login" ? "Sign In" : "Create Account"}
                </button>
            </form>
        </div>
    );
}
