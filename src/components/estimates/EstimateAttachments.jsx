import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, Upload, Trash2, FileText, Image, File } from "lucide-react";

const attachmentTypeLabels = {
  scope_of_work: 'Scope of Work',
  load_breakdown: 'Load Breakdown',
  pre_destruction_photos: 'Pre-Destruction Photos',
  customer_instructions: 'Customer Instructions',
  other: 'Other'
};

export default function EstimateAttachments({ estimateId }) {
  const [uploading, setUploading] = useState(false);
  const [attachmentType, setAttachmentType] = useState('scope_of_work');
  const queryClient = useQueryClient();

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['estimateAttachments', estimateId],
    queryFn: () => estimateId ? base44.entities.EstimateAttachment.filter({ estimate_id: estimateId }) : [],
    enabled: !!estimateId
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EstimateAttachment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateAttachments', estimateId] });
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !estimateId) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.EstimateAttachment.create({
        estimate_id: estimateId,
        attachment_type: attachmentType,
        file_url: file_url,
        file_name: file.name,
        upload_timestamp: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['estimateAttachments', estimateId] });
      e.target.value = '';
    } catch (error) {
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return Image;
    if (['pdf'].includes(ext)) return FileText;
    return File;
  };

  if (!estimateId) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Paperclip className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Attachments</h3>
        </div>
        <p className="text-sm text-slate-500">Save the estimate first to add attachments.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Paperclip className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Attachments</h3>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="attachment_type">Attachment Type</Label>
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

          <div className="flex items-end">
            <Button
              variant="outline"
              disabled={uploading}
              className="gap-2"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Upload scope documents, photos, load breakdowns, and instructions that will reference into the job
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-500">Loading attachments...</div>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-slate-500">No attachments added yet.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.file_name);
            return (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-sm text-slate-900">{attachment.file_name}</p>
                    <p className="text-xs text-slate-500">
                      {attachmentTypeLabels[attachment.attachment_type]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.file_url, '_blank')}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(attachment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}