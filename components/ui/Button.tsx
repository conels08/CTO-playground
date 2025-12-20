import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium " +
    "transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "active:translate-y-[0.5px]";

  const variantStyles = {
    primary:
      "bg-blue-600 text-white shadow-sm " +
      "hover:bg-blue-500 hover:shadow-md " +
      "active:bg-blue-600",

    secondary:
      "bg-gray-600 text-white shadow-sm " +
      "hover:bg-gray-500 hover:shadow-md " +
      "active:bg-gray-600",

    outline:
      // This is tuned for your current DARK UI
      "border border-white/15 bg-white/5 text-white shadow-sm " +
      "hover:bg-white/10 hover:border-white/25 hover:shadow-md " +
      "active:bg-white/5",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
