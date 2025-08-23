"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";

export default function Breadcrumbs() {
  const pathname = usePathname(); // e.g. "/dashboard/tenants"
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "tenants"]

  // build paths progressively for links
  const urlPathLink = segments.map((seg, index) => {
    return {
      label: seg.charAt(0).toUpperCase() + seg.slice(1), // Capitalize
      url: "/" + segments.slice(0, index + 1).join("/"),
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
      <div className="flex items-center space-x-2">
        {urlPathLink.map((link, index) => (
          <div key={link.url} className="flex items-center space-x-2">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            )}
            <Link
              href={link.url}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
            >
              {link.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
