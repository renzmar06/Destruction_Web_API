import Link from 'next/link';
import { Home, ClipboardList, FileText } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome to DestructionOps</h1>
        <p className="text-slate-600 mb-8">Your demolition and cleanup management platform</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/CustomerDashboard" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <Home className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Customer Dashboard</h3>
            <p className="text-slate-600">Access your customer portal and manage your requests</p>
          </Link>
          
          <Link href="/requests" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <ClipboardList className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Service Requests</h3>
            <p className="text-slate-600">Manage all service requests and track progress</p>
          </Link>
          
          <Link href="/estimates" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <FileText className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Estimates</h3>
            <p className="text-slate-600">Create and manage project estimates</p>
          </Link>
        </div>
      </div>
    </div>
  );
}