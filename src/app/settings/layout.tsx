'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import SubSidebar from './SubSidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Extract active section from pathname
  const getActiveSection = () => {
    if (pathname.includes('/company')) return 'company';
    if (pathname.includes('/sales')) return 'sales';
    return 'company'; // default
  };

  const [activeSection, setActiveSection] = useState(getActiveSection());

  return (
    <div className="flex min-h-screen bg-slate-50 mt-5">
      <SubSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}