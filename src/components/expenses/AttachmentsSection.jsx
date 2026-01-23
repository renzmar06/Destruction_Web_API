import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Paperclip, Upload, Trash2, FileText, Download } from "lucide-react";

const attachmentTypeLabels = {
  vendor_invoice: 'Vendor Invoice',
  receipt: 'Receipt',
  supporting_document: 'Supporting Document'
};

export default function AttachmentsSection({ expenseId, isReadOnly }) {
  const [uploading, setUploading] = useState(false);
  const [attachmentType, setAttachmentType] = useState('vendor_invoice');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (expenseId) {
      fetchAttachments();
    }
  }, [expenseId]);

  const fetchAttachments = async () => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`);
      const result = await response.json();
      if (result.success && result.data.attachments) {
        setAttachments(result.data.attachments);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Starting file upload:', file.name, 'for expense:', expenseId);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('attachmentType', attachmentType);

      console.log('Uploading to:', `/api/expenses/${expenseId}/attachments`);
      const response = await fetch(`/api/expenses/${expenseId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload response:', result);
      
      if (result.success) {
        setAttachments(prev => [...prev, result.data]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        console.log('File uploaded successfully');
      } else {
        console.error('Upload failed:', result.message);
        alert(result.message || 'Upload failed');
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
      console.log('Deleting attachment:', attachment.filename);
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
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
          attachments.map((attachment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900 text-sm">{attachment.filename}</p>
                  <p className="text-xs text-slate-500">{attachmentTypeLabels[attachment.attachmentType] || 'Document'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.url, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}