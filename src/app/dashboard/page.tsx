import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Users, FileText, Calendar, DollarSign, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/requests" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ClipboardList className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Service Requests</h3>
                    <p className="text-slate-600">Manage all service requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customers" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Customers</h3>
                    <p className="text-slate-600">Manage customer accounts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/estimates" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Estimates</h3>
                    <p className="text-slate-600">Create and manage estimates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/jobs" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Jobs</h3>
                    <p className="text-slate-600">Schedule and track jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/invoices" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
                    <p className="text-slate-600">Manage billing and payments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports" className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Reports</h3>
                    <p className="text-slate-600">View analytics and reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}