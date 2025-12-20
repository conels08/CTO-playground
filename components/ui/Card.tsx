import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = "", title }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-6 shadow-sm ${className}`}
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
      )}
      {children}
    </div>
  );
}
