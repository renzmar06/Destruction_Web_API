import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateAffidavit, fetchAffidavits } from '@/redux/slices/affidavitsSlice';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, X } from "lucide-react";

export default function RevokeDocumentModal({ affidavit, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleRevoke = async () => {
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateAffidavit({
        id: affidavit._id || affidavit.id,
        data: {
          affidavit_status: 'revoked',
          revoked: true,
          revoked_timestamp: new Date().toISOString(),
          revocation_reason: reason
        }
      })).unwrap();
      await dispatch(fetchAffidavits());
      onSuccess?.('Affidavit revoked successfully.');
      onClose();
    } catch (error) {
      onSuccess?.('Failed to revoke affidavit: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl border-2 border-red-600" style={{ borderRadius: 0 }}>
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-bold uppercase">Revoke Document</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-red-50 border-l-4 border-red-600 p-4">
            <p className="text-sm font-semibold text-red-900 mb-2">CRITICAL ACTION</p>
            <p className="text-sm text-red-800">
              Revoking this document will permanently mark it as REVOKED. The document will remain publicly verifiable 
              but will display revocation status, timestamp, and reason. This action is IRREVERSIBLE.
            </p>
          </div>

          {/* Document Info */}
          <div className="border border-slate-300 bg-slate-50 p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-4 font-semibold text-slate-700">Document ID</td>
                  <td className="py-2 text-slate-900 font-mono">{affidavit.affidavit_number}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-4 font-semibold text-slate-700">Customer</td>
                  <td className="py-2 text-slate-900">{affidavit.customer_name}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-semibold text-slate-700">Job Reference</td>
                  <td className="py-2 text-slate-900">{affidavit.job_reference}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Revocation Reason */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">
              Revocation Reason <span className="text-red-600">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter mandatory reason for revocation (e.g., 'Clerical error in material quantities', 'Regulatory correction required', 'Duplicate issuance')"
              rows={4}
              className="w-full border-slate-300"
            />
            <p className="text-xs text-slate-600 mt-2">
              This reason will be permanently recorded and publicly visible on the verification page.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-300">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRevoke}
              disabled={isSubmitting || !reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Revoking...' : 'Revoke Document'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}