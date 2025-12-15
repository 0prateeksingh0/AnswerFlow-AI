import { useState } from "react";
import { Send } from "lucide-react";

interface QuestionFormProps {
    onSuccess?: () => void;
}

export function QuestionForm({ onSuccess }: QuestionFormProps) {
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            setError("Question cannot be blank");
            return;
        }

        setLoading(true);
        setError("");

        // Requirement: Use AJAX XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8000/questions/", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                setLoading(false);
                if (xhr.status >= 200 && xhr.status < 300) {
                    setContent("");
                    if (onSuccess) onSuccess();
                } else {
                    try {
                        const resp = JSON.parse(xhr.responseText);
                        setError(resp.detail || "Failed to submit question");
                    } catch (err) {
                        setError("An error occurred");
                    }
                }
            }
        };

        const data = JSON.stringify({ content: content, is_anonymous: true });
        xhr.send(data);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-20 relative z-10">
            <div className="flex flex-col gap-6">
                <label htmlFor="question" className="text-3xl font-bold tracking-tight text-white/90">
                    Ask the community.
                </label>
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-500 to-white opacity-10 blur transition duration-1000 group-hover:opacity-20"></div>
                    <input
                        id="question"
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-8 text-xl glass-input rounded-2xl font-light placeholder-white/20"
                        placeholder="Type your question here..."
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors"
                    >
                        {loading ? <span className="text-sm">Sending...</span> : <Send size={24} strokeWidth={1.5} />}
                    </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><span className="w-1 h-4 bg-red-400 block"></span> {error}</p>}
            </div>
        </form>
    );
}
