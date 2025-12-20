import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = "", title }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border bg-white p-6 shadow-sm",
        "dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
