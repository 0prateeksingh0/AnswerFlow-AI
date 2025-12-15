import { StatusBadge } from "./StatusBadge";
import { MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Answer {
    id: number;
    content: string;
    user_id: number;
    timestamp: string;
}

interface Question {
    id: number;
    content: string;
    timestamp: string;
    status: "Pending" | "Answered" | "Escalated";
    is_anonymous: boolean;
    sentiment?: string;
    answers: Answer[];
}

interface QuestionCardProps {
    question: Question;
    isAdmin?: boolean;
    onAnswer?: (id: number, content: string) => void;
    onStatusChange?: (id: number, status: string) => void;
}

export function QuestionCard({ question, isAdmin, onAnswer, onStatusChange }: QuestionCardProps) {
    const [replyText, setReplyText] = useState("");
    const [showReply, setShowReply] = useState(false);

    const [loadingSuggestion, setLoadingSuggestion] = useState(false);
    const { token } = useAuth(); // Get token

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyText.trim() && onAnswer) {
            onAnswer(question.id, replyText);
            setReplyText("");
            setShowReply(false);
        }
    };

    const handleSuggest = async () => {
        if (!token) return;
        setLoadingSuggestion(true);
        try {
            const res = await fetch(`http://localhost:8000/questions/${question.id}/suggest`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.suggestion) {
                setReplyText(data.suggestion);
                setShowReply(true);
            }
        } catch (e) {
            console.error("Failed to get suggestion", e);
        } finally {
            setLoadingSuggestion(false);
        }
    };

    return (
        <div className={cn(
            "p-8 rounded-2xl transition-all duration-300 group border border-transparent hover:border-white/10",
            question.status === "Escalated" ? "glass-panel bg-white/5 border-red-500/20" : "glass-panel"
        )}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center border border-white/10">
                        <span className="text-[10px] font-bold text-gray-300">
                            {question.is_anonymous ? "G" : "U"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm tracking-wide text-white uppercase">
                                {question.is_anonymous ? "Guest" : "User"}
                            </span>
                            <span className="text-xs text-gray-600 font-mono">
                                • {new Date(question.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                </div>

                <div className="flex items-center gap-3">
                    {/* Sentiment Badge */}
                    {question.sentiment && (
                        <span className={cn(
                            "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full",
                            question.sentiment === "Positive" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                question.sentiment === "Negative" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                    "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        )}>
                            {question.sentiment}
                        </span>
                    )}

                    {/* Status Badge */}
                    <div className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                        question.status === "Escalated" ? "bg-red-500 text-black border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" :
                            question.status === "Answered" ? "bg-white/10 text-white border-white/20" :
                                "text-gray-500 border-gray-800"
                    )}>
                        {question.status}
                    </div>
                    {isAdmin && (
                        <select
                            value={question.status}
                            onChange={(e) => onStatusChange?.(question.id, e.target.value)}
                            className="bg-black text-white text-xs border border-gray-800 rounded px-2 py-1 outline-none focus:border-white/40"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Answered">Answered</option>
                            <option value="Escalated">Escalated</option>
                        </select>
                    )}
                </div>
            </div>

            <p className="text-xl text-gray-200 font-light leading-relaxed mb-8 pl-1">{question.content}</p>

            {/* Answers Section */}
            {question.answers && question.answers.length > 0 && (
                <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
                    {question.answers.map((ans) => (
                        <div key={ans.id} className="text-sm font-light flex gap-3">
                            <div className="w-1 h-auto bg-white/20 rounded-full"></div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Replied</span>
                                <span className="text-gray-300 leading-relaxed">{ans.content}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Bar */}
            <div className="flex gap-6 items-center pt-4 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setShowReply(!showReply)}
                    className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <MessageSquare size={12} strokeWidth={2} />
                    {question.answers?.length > 0 ? "Reply" : "Answer"}
                </button>
                {isAdmin && (
                    <button
                        onClick={handleSuggest}
                        disabled={loadingSuggestion}
                        className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors shadow-purple-500/20"
                    >
                        {loadingSuggestion ? "..." : "AI Suggest"}
                    </button>
                )}
            </div>

            {/* Reply Input */}
            {showReply && (
                <form onSubmit={handleReplySubmit} className="mt-6 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full text-base glass-input p-4 rounded-xl resize-none font-light min-h-[100px]"
                        placeholder="Type your answer..."
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="glass-button px-6 py-2 rounded-lg text-xs uppercase tracking-widest"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
