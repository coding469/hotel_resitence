import { ReactNode } from "react";

export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <span
      className={
        light
          ? "text-[12.5px] font-bold uppercase tracking-[0.2em] text-gold"
          : "text-xs font-bold uppercase tracking-[0.18em] text-terracotta"
      }
    >
      {children}
    </span>
  );
}
