'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Ratings & Reviews</h1>
      
      <div className="flex space-x-1 border-b border-gray-200 mb-8">
        <Link
          href="/my-section/reviews/not-reviewed"
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            pathname === "/my-section/reviews/not-reviewed"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-800"
          )}
        >
          Not Reviewed
        </Link>
        <Link
          href="/my-section/reviews/reviewed"
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            pathname === "/my-section/reviews/reviewed"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-800"
          )}
        >
          Reviewed
        </Link>
      </div>

      {children}
    </div>
  );
}
