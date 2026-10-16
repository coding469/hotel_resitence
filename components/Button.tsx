import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "invert" | "ghost" | "dark" | "whatsapp";

const base =
  "inline-flex items-center gap-2 rounded-full font-bold transition-all duration-200";

const variants: Record<Variant, string> = {
  primary:
    "bg-terracotta text-paper hover:-translate-y-0.5 hover:opacity-90",
  invert:
    "bg-paper text-espresso hover:-translate-y-0.5 hover:opacity-90",
  ghost:
    "border border-paper/40 text-paper hover:bg-paper/10",
  dark: "bg-espresso text-paper hover:opacity-85",
  whatsapp:
    "bg-whatsapp text-white hover:-translate-y-0.5 hover:bg-whatsapp-dark",
};

const sizes = {
  default: "px-7 py-[15px] text-[14.5px]",
  small: "px-5 py-[11px] text-[13.5px]",
};

export function Button({
  href,
  variant = "primary",
  small = false,
  external = false,
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  small?: boolean;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const classes = `${base} ${variants[variant]} ${
    small ? sizes.small : sizes.default
  } ${className}`;

  if (external || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
