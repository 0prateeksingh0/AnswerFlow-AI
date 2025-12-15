"use client";

import { useEffect, useState } from "react";
import { QuestionForm } from "@/components/QuestionForm";
import { QuestionCard } from "@/components/QuestionCard";
import { useWebSocket } from "@/hooks/useWebSocket";
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
  sentiment?: string; // Creative Feature
  answers: Answer[];
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { user, token } = useAuth();
  const { lastMessage } = useWebSocket("ws://localhost:8000/ws");

  // Initial fetch
  useEffect(() => {
    fetch("http://localhost:8000/questions/")
      .then((res) => res.json())
      .catch((err) => console.error(err))
      .then((data) => {
        if (Array.isArray(data)) setQuestions(data);
      });
  }, []);

  // Handle Real-time updates
  useEffect(() => {
    if (!lastMessage) return;

    // {"type": "new_question/new_answer/status_update", "data": ...}
    const { type, data, question_id } = lastMessage;

    if (type === "new_question") {
      setQuestions((prev) => {
        // Add new question. If escalated, put top, logic is handled by sorting usually
        // But for real-time append, we need to respect sorting.
        // Simplest: Add to list and re-sort.
        const newList = [data, ...prev];
        // Re-sort: Escalated first, then timestamp desc
        return newList.sort((a, b) => {
          const priorityA = a.status === "Escalated" ? 0 : 1;
          const priorityB = b.status === "Escalated" ? 0 : 1;
          if (priorityA !== priorityB) return priorityA - priorityB;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      });
    } else if (type === "new_answer") {
      setQuestions((prev) => prev.map(q => {
        if (q.id === parseInt(question_id || data.question_id)) {
          return { ...q, answers: [...(q.answers || []), data] };
        }
        return q;
      }));
    } else if (type === "status_update") {
      setQuestions((prev) => {
        // Update status AND sentiment if present
        const updated = prev.map(q => q.id === data.id ? { ...q, ...data } : q);
        return updated.sort((a, b) => {
          const priorityA = a.status === "Escalated" ? 0 : 1;
          const priorityB = b.status === "Escalated" ? 0 : 1;
          if (priorityA !== priorityB) return priorityA - priorityB;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      });
    }

  }, [lastMessage]);

  const handleAnswer = async (id: number, content: string) => {
    if (!token) {
      alert("Please login to answer");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/questions/${id}/answer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error("Failed to answer");
    } catch (e) {
      alert("Error posting answer");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8000/questions/${id}/status?status=${status}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (e) {
      alert("Error updating status");
    }
  };

  return (
    <div className="space-y-20">
      <div className="text-center pt-8">
        <h1 className="text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">
          COMMUNITY<span className="text-gray-600">.</span>
        </h1>
        <p className="text-gray-500 uppercase tracking-[0.3em] text-xs font-medium">Real-time Q&A · Sentiment Analysis · AI Powered</p>
      </div>

      <QuestionForm />

      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl">
            <p className="text-gray-500 font-light text-lg">No questions yet.</p>
          </div>
        ) : (
          questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              isAdmin={user?.role === "admin"}
              onAnswer={handleAnswer}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
