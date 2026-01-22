import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Lock, FileCheck, Search, Download, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  issued: { label: 'Issued', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  locked: { label: 'Locked', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  revoked: { label: 'Revoked', className: 'bg-red-100 text-red-700 border-red-200' }
};

export default function AffidavitList({ affidavits, onView, onLock, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAffidavits = affidavits.filter(affidavit =>
    affidavit.affidavit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affidavit.job_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affidavit.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (affidavit, type) => {
    alert(`${type} download functionality will be implemented`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search affidavits..."
            className="pl-10 h-12 border-slate-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Affidavit #</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Job Reference</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Issued Date</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAffidavits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  {searchTerm ? 'No affidavits found' : 'No affidavits yet. Create an affidavit from a completed job.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAffidavits.map((affidavit) => (
                <motion.tr
                  key={affidavit.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900">{affidavit.affidavit_number}</TableCell>
                  <TableCell className="text-slate-700">{affidavit.customer_name}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{affidavit.job_reference}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[affidavit.affidavit_status]?.className}>
                      {statusConfig[affidavit.affidavit_status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {affidavit.date_issued ? new Date(affidavit.date_issued).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(affidavit)}
                        className="h-8 gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {(affidavit.affidavit_status === 'issued' || affidavit.affidavit_status === 'locked') && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(affidavit, 'Certificate')}
                            className="h-8 gap-2 text-green-600 hover:text-green-700"
                            title="Download Certificate of Destruction"
                          >
                            <Download className="w-4 h-4" />
                            Cert
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(affidavit, 'Affidavit')}
                            className="h-8 gap-2 text-blue-600 hover:text-blue-700"
                            title="Download Legal Affidavit"
                          >
                            <Download className="w-4 h-4" />
                            Aff
                          </Button>
                        </>
                      )}
                      {affidavit.affidavit_status === 'issued' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLock(affidavit)}
                          className="h-8 gap-2 text-purple-600 hover:text-purple-700"
                        >
                          <Lock className="w-4 h-4" />
                          Lock
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}