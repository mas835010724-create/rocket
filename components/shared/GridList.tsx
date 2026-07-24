import React from "react";

interface GridListProps {
  children: React.ReactNode;
  className?: string;
}

export default function GridList({ children, className = "" }: GridListProps) {
  const defaultGridClass = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  return (
    <div className={`grid ${defaultGridClass} gap-x-3 gap-y-5 ${className}`}>
      {children}
    </div>
  );
}
