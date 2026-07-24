"use client";

import Link, { LinkProps } from "next/link";
import { useSearchParams } from "next/navigation";
import { AnchorHTMLAttributes, ReactNode } from "react";

type SmartLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
  children?: ReactNode;
};

export default function SmartLink({ href, children, ...props }: SmartLinkProps) {
  const searchParams = useSearchParams();
  const cp = searchParams.get("cp");

  let finalHref = href;

  if (cp && typeof href === "string") {
    // Check if href already has parameters
    const separator = href.includes("?") ? "&" : "?";
    finalHref = `${href}${separator}cp=${cp}`;
  } else if (cp && typeof href === "object" && href.pathname) {
     // Handle URL object
     const existingQuery = typeof href.query === "object" && href.query !== null ? href.query : {};
     finalHref = {
        ...href,
        query: {
            ...existingQuery,
            cp: cp
        }
     }
  }

  return (
    <Link href={finalHref} {...props}>
      {children}
    </Link>
  );
}
