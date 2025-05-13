import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">CRM</span>
              </div>
            </div>
          </Link>
        </div>

        {children}

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} WorkspaxCRM. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
