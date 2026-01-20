import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Mail, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function DeliveryLogSection({ logs, isLoading }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <ClipboardList className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Delivery Log</h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No delivery attempts yet</p>
          <p className="text-sm mt-1">Send the invoice to see delivery history here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Method</TableHead>
                <TableHead className="font-semibold">Recipient</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Timestamp</TableHead>
                <TableHead className="font-semibold">Sent By</TableHead>
                <TableHead className="font-semibold">Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-b border-slate-100">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.delivery_method === 'email' ? (
                        <Mail className="w-4 h-4 text-blue-600" />
                      ) : log.delivery_method === 'sms' ? (
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      ) : (
                        <Mail className="w-4 h-4 text-purple-600" />
                      )}
                      <span className="capitalize">{log.delivery_method}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{log.recipient}</p>
                      {log.cc_recipients && (
                        <p className="text-xs text-slate-500 mt-0.5">CC: {log.cc_recipients}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.delivery_status === 'sent' ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Sent
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                        <XCircle className="w-3 h-3" />
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {log.sent_timestamp ? format(new Date(log.sent_timestamp), 'MMM d, yyyy h:mm a') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{log.sent_by || 'Unknown'}</TableCell>
                  <TableCell className="text-sm text-red-600">
                    {log.error_message || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
        <strong>Note:</strong> Delivery log is append-only and cannot be edited or deleted.
      </div>
    </div>
  );
}