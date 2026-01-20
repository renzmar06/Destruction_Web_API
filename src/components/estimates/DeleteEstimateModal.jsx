import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";

export default function DeleteEstimateModal({ estimate, open, onClose, onConfirm, isDeleting }) {
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    
    // Validate estimate status
    const allowedStatuses = ['draft', 'expired', 'cancelled'];
    if (!allowedStatuses.includes(estimate?.estimate_status)) {
      setError('This estimate cannot be deleted because it has already been converted or finalized.');
      return;
    }

    await onConfirm();
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete estimate?</DialogTitle>
          <DialogDescription className="space-y-2 pt-2">
            <p>
              You're about to delete <span className="font-semibold text-slate-900">Estimate {estimate?.estimate_number}</span>.
              This action cannot be undone.
            </p>
            <p className="text-slate-500 text-sm">
              Deleted estimates are permanently removed from your records.
            </p>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete estimate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}