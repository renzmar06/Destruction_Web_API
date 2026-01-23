'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { loadUserFromStorage, fetchCurrentUser } from '@/redux/slices/authSlice';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  ChevronDown, 
  Settings,
  ClipboardList,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  DollarSign,
  CheckSquare,
  Package,
  Truck,
  FileCheck,
  User,
  Shield,
  Receipt
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadUserFromStorage());
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // useEffect(() => {
  //   if (user) {
  //     alert(`User role: ${user.role || 'No role found'}`);
  //   }
  // }, [user]);

  

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/' },
    { id: 'requests', label: 'Service Requests', icon: ClipboardList, href: '/service-requests' },
    { id: 'products-services', label: 'Products Services', icon: Package, href: '/products-services' },
    { id: 'estimates', label: 'Estimates', icon: FileText, href: '/estimates' },
    { id: 'jobs', label: 'Jobs', icon: Calendar, href: '/jobs' },
    { id: 'affidavits', label: 'Affidavits', icon: FileCheck, href: '/affidavits' },
    { id: 'verify-document', label: 'Verify Document', icon: Shield, href: '/verify-document' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, href: '/expenses' },
    { id: 'customer-task', label: 'Task', icon: FileText, href: '/customer-task' },
    { id: 'customers', label: 'Customers', icon: Users, href: '/customers' },
    { id: 'vendors', label: 'Vendors', icon: Truck, href: '/vendors' },
    { id: 'invoices', label: 'Invoices', icon: DollarSign, href: '/invoices' }
    
  ];

  const customerPages = [
    { id: 'customer-dashboard', label: 'Dashboard', icon: Home, href: '/CustomerDashboard' },
    { id: 'customer-requests', label: 'My Requests', icon: ClipboardList, href: '/customer-requests' },
    { id: 'customer-estimates', label: 'My Estimates', icon: FileText, href: '/customer-estimates' },
    { id: 'customer-jobs', label: 'My Jobs', icon: Calendar, href: '/customer-jobs' },
    { id: 'customer-invoices', label: 'My Invoices', icon: DollarSign, href: '/customer-invoices' },
    { id: 'customer-document', label: 'My document', icon: Shield, href: '/customer-document' },
    { id: 'customer-messages', label: 'Messages', icon: MessageSquare, href: '/customer-message' }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo / Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <span className="font-bold text-lg">DestructionOps</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          
          {/* Show customer pages directly for customers */}
          {user?.role === 'customer' ? (
            customerPages.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })
          ) : (
            /* Show admin navigation for non-customers */
            navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-slate-800 p-3">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 ${
            collapsed ? 'justify-center' : ''
          }`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-blue-400 font-medium">
                  {user.role || 'User'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings (Bottom) */}
      <div className="border-t border-slate-800 p-2">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            isActive('/settings')
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium">Settings</span>
          )}
        </Link>
      </div>
    </aside>
  );
}