import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Paperclip, Upload, Trash2, FileText, Image as ImageIcon, Download } from "lucide-react";

const attachmentTypeLabels = {
  vendor_invoice: 'Vendor Invoice',
  receipt: 'Receipt',
  supporting_document: 'Supporting Document'
};

export default function AttachmentsSection({ expenseId, isReadOnly }) {
  const [uploading, setUploading] = useState(false);
  const [attachmentType, setAttachmentType] = useState('vendor_invoice');
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: attachments = [] } = useQuery({
    queryKey: ['expenseAttachments', expenseId],
    queryFn: () => expenseId ? base44.entities.ExpenseAttachment.filter({ expense_id: expenseId }) : [],
    enabled: !!expenseId
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ExpenseAttachment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseAttachments', expenseId] });
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.ExpenseAttachment.create({
        expense_id: expenseId,
        attachment_type: attachmentType,
        file_url,
        file_name: file.name,
        upload_timestamp: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['expenseAttachments', expenseId] });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (attachment) => {
    if (confirm('Delete this attachment?')) {
      deleteMutation.mutate(attachment.id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Paperclip className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Attachments</h3>
      </div>

      {isReadOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          Attachments are locked for approved expenses.
        </div>
      )}

      {!isReadOnly && expenseId && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Attachment Type</Label>
              <Select value={attachmentType} onValueChange={setAttachmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(attachmentTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload File</Label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 h-10 gap-2"
                  variant="outline"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {attachments.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No attachments yet</p>
          </div>
        ) : (
          attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900 text-sm">{attachment.file_name}</p>
                  <p className="text-xs text-slate-500">{attachmentTypeLabels[attachment.attachment_type]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.file_url, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
                {!isReadOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}