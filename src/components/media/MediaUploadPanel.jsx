import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image, Video, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MediaUploadPanel({ jobId, jobStatus, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [captureSource, setCaptureSource] = useState('');
  const fileInputRef = useRef(null);

  const canUpload = jobStatus !== 'completed';

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please upload an image or video file');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const user = await base44.auth.me();
      
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });

      // Determine media type
      const mediaType = selectedFile.type.startsWith('image/') ? 'photo' : 'video';

      // Create media record
      await base44.entities.JobMedia.create({
        job_id: jobId,
        media_type: mediaType,
        media_url: file_url,
        description: description,
        capture_source: captureSource || null,
        upload_timestamp: new Date().toISOString(),
        uploaded_by: user?.email || 'unknown'
      });

      // Reset form
      setSelectedFile(null);
      setDescription('');
      setCaptureSource('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDescription('');
    setCaptureSource('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!canUpload) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 text-slate-500">
          <Upload className="w-5 h-5" />
          <div>
            <p className="font-medium">Upload Disabled</p>
            <p className="text-sm mt-1">Media uploads are not allowed for completed jobs.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Upload Media</h3>

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all"
        >
          <div className="flex justify-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Image className="w-8 h-8 text-blue-600" />
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Video className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="font-medium text-slate-700">Click to upload photo or video</p>
          <p className="text-sm text-slate-500 mt-1">Images and videos accepted</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              {selectedFile.type.startsWith('image/') ? (
                <Image className="w-8 h-8 text-blue-600" />
              ) : (
                <Video className="w-8 h-8 text-purple-600" />
              )}
              <div>
                <p className="font-medium text-slate-900">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this media shows..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capture_source">Capture Source (Optional)</Label>
            <Select value={captureSource} onValueChange={setCaptureSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile_device">Mobile Device</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="camera_upload">Camera Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}