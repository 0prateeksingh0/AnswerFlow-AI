import { cn } from "@/lib/utils";

type Status = "Pending" | "Answered" | "Escalated";

interface StatusBadgeProps {
    status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles = {
        Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        Answered: "bg-green-500/10 text-green-400 border-green-500/20",
        Escalated: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", styles[status])}>
            {status}
        </span>
    );
}
