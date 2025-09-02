"use client";

import Link from "next/link";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";

interface BreadcrumbItem {
  label: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
      <div className="flex items-center space-x-2">
        {items.map((item, index) => (
          <div key={item.url} className="flex items-center space-x-2">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            )}
            <Link
              href={item.url}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
            >
              {item.label}
            </Link>
          </div>
        ))}
      </div>
  );
}
