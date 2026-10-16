import { ReactNode } from "react";

export function Wrap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[1180px] px-5 md:px-8 ${className}`}>
      {children}
    </div>
  );
}
