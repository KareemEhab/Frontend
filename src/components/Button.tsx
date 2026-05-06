import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

const navShared =
  "inline-flex cursor-pointer items-center justify-center border border-solid font-sans text-[0.875rem] font-medium leading-[160%] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00B8FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export type ButtonVariant = "submit" | "submitFit" | "navLogin" | "navSignUp";

const variantClassName: Record<ButtonVariant, string> = {
  submit:
    "inline-block w-full cursor-pointer rounded-lg border border-transparent bg-[#00B8FF] text-center font-sans text-[0.875rem] font-medium leading-[160%] text-white pt-[0.8125rem] pb-[0.8125rem] transition-colors duration-200 hover:bg-[#0095d9] active:bg-[#0088c7] focus:outline-none focus:ring-2 focus:ring-[#00B8FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#00B8FF]",
  submitFit:
    "inline-flex w-fit cursor-pointer items-center justify-center rounded-lg border border-transparent bg-[#00B8FF] font-sans text-[0.875rem] font-medium leading-[160%] text-white px-[1.75rem] py-[1rem] transition-colors duration-200 hover:bg-[#0095d9] active:bg-[#0088c7] focus:outline-none focus:ring-2 focus:ring-[#00B8FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#00B8FF]",
  navLogin: `${navShared} rounded-none border-[#00B8FF] bg-transparent p-[0.625rem] text-[#00B8FF] hover:bg-[#00B8FF]/10 active:bg-[#00B8FF]/15`,
  navSignUp: `${navShared} rounded-none border-transparent bg-[#00B8FF] p-[0.625rem] text-white hover:bg-[#0095d9] active:bg-[#0088c7]`,
};

export type ButtonProps = {
  variant: ButtonVariant;
  children: ReactNode;
  to?: string;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({ variant, children, type = "button", to, className = "", ...rest }: ButtonProps) {
  const cls = [variantClassName[variant], className].filter(Boolean).join(" ");

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
