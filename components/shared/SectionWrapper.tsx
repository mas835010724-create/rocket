import React from "react";
import SectionTitle from "./SectionTitle";

interface SectionWrapperProps {
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
  className?: string;
  icon?: string;
}

export default function SectionWrapper({
  title,
  viewAllHref,
  children,
  className = "",
  icon,
}: SectionWrapperProps) {
  return (
    <section className={`${className}`}>
      <div>
        <SectionTitle title={title} viewAllHref={viewAllHref} icon={icon} />
      </div>
      {children}
    </section>
  );
}
