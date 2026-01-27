import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Image, Video, Calendar, Upload, FileText, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

/**
 * @typedef {Object} AttachedDocument
 * @property {string} document_id
 * @property {string} file_name
 * @property {string} file_path
 * @property {string} file_type
 * @property {Date|string} upload_date
 */

/**
 * @typedef {Object} MediaReferencesSectionProps
 * @property {Array} media
 * @property {string[]} selectedMediaIds
 * @property {(ids: string[]) => void} onSelectionChange
 * @property {boolean} isReadOnly
 * @property {AttachedDocument[]} [attachedDocuments]
 * @property {(document: any, removeId?: string) => void} [onDocumentAttach]
 */

/**
 * @param {MediaReferencesSectionProps} props
 */
export default function MediaReferencesSection({ media, selectedMediaIds, onSelectionChange, isReadOnly, attachedDocuments = [], onDocumentAttach }) {
  const [uploading, setUploading] = useState(false);

  const handleToggle = (mediaId) => {
    if (isReadOnly) return;
    
    if (selectedMediaIds.includes(mediaId)) {
      onSelectionChange(selectedMediaIds.filter(id => id !== mediaId));
    } else {
      onSelectionChange([...selectedMediaIds, mediaId]);
    }
  };

  const generateDocumentId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `DOC-${timestamp}`;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const documentId = generateDocumentId();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_id', documentId);

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        if (onDocumentAttach) {
          onDocumentAttach(result.data);
        }
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (documentId) => {
    if (onDocumentAttach) {
      onDocumentAttach(null, documentId); // Pass null as document and documentId to remove
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Attachment Section */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <h3 className="font-semibold text-blue-900">Attached Documents</h3>
          </div>
          {!isReadOnly && (
            <div className="relative">
              <input
                type="file"
                id="document-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button
                onClick={() => document.getElementById('document-upload').click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                size="sm"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Attach Document'}
              </Button>
            </div>
          )}
        </div>

        {attachedDocuments.length === 0 ? (
          <div className="text-center py-4 text-blue-600">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-sm">No documents attached</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attachedDocuments.map((doc) => (
              <div key={doc.document_id} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{doc.file_name}</p>
                    <p className="text-xs text-slate-500">ID: {doc.document_id}</p>
                    <p className="text-xs text-slate-500">
                      {doc.upload_date ? format(new Date(doc.upload_date), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </p>
                  </div>
                </div>
                {!isReadOnly && (
                  <Button
                    onClick={() => handleRemoveDocument(doc.document_id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {!isReadOnly && (
          <p className="text-xs text-blue-600 mt-3">
            Attach documents to generate unique IDs for verification workflow.
          </p>
        )}
      </div>

      {/* Media References Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-900">Supporting Media</h3>
          </div>
          <span className="text-sm text-slate-500">
            {selectedMediaIds.length} of {media.length} selected
          </span>
        </div>

        {isReadOnly && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            Media references are locked. These media items are referenced in the affidavit.
          </div>
        )}

        {media.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Image className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No media available for this job</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`border-2 rounded-lg p-3 transition-all ${
                  selectedMediaIds.includes(item.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  {!isReadOnly && (
                    <Checkbox
                      checked={selectedMediaIds.includes(item.id)}
                      onCheckedChange={() => handleToggle(item.id)}
                      className="mt-1"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.media_type === 'photo' ? (
                        <Image className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Video className="w-4 h-4 text-purple-600" />
                      )}
                      <span className="font-medium text-slate-900 capitalize">{item.media_type}</span>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {item.upload_timestamp ? format(new Date(item.upload_timestamp), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </div>
                    
                    {item.uploaded_by && (
                      <p className="text-xs text-slate-500 mt-1">By: {item.uploaded_by}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isReadOnly && media.length > 0 && (
          <p className="text-sm text-slate-500 mt-4">
            Select media items to reference in the affidavit. Media cannot be edited here.
          </p>
        )}
      </div>
    </div>
  );
}