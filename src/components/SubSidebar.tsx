'use client';

import React from 'react';
import {
  Building2,
  CreditCard,
  TrendingUp,
  FileText,
  Landmark,
  Clock,
  Settings as SettingsIcon,
  HelpCircle,
  X,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'usage', label: 'Usage', icon: TrendingUp },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'lending', label: 'Lending', icon: Landmark },
  { id: 'accounting', label: 'Accounting', icon: FileText },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'expenses', label: 'Expenses', icon: CreditCard },
  { id: 'time', label: 'Time', icon: Clock },
  { id: 'advanced', label: 'Advanced', icon: SettingsIcon },
];

interface SubSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SubSidebar({ activeSection, onSectionChange }: SubSidebarProps) {
  return (
    <aside className="w-72 border-r bg-white/70 backdrop-blur-sm flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`
                  group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}