import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Video, Download, Eye, Trash2, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function MediaGallery({ media, jobStatus, onDelete, isLoading }) {
  const [selectedMedia, setSelectedMedia] = useState(null);

  const canDelete = jobStatus !== 'completed';

  const handleView = (item) => {
    setSelectedMedia(item);
  };

  const handleDownload = (item) => {
    window.open(item.media_url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Media Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Media Gallery</h3>
          <span className="text-sm text-slate-500">{media.length} items</span>
        </div>

        {media.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No media uploaded yet</p>
            <p className="text-sm mt-1">Upload photos or videos to document this job</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 transition-all"
              >
                <div className="aspect-square relative">
                  {item.media_type === 'photo' ? (
                    <img
                      src={item.media_url}
                      alt={item.description || 'Job media'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <Video className="w-12 h-12 text-white" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleView(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onDelete(item)}
                        className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="absolute top-2 left-2">
                    <div className="px-2 py-1 bg-black bg-opacity-60 rounded text-xs text-white flex items-center gap-1">
                      {item.media_type === 'photo' ? (
                        <ImageIcon className="w-3 h-3" />
                      ) : (
                        <Video className="w-3 h-3" />
                      )}
                      {item.media_type}
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  {item.description && (
                    <p className="text-sm text-slate-700 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {item.upload_timestamp ? format(new Date(item.upload_timestamp), 'MMM d, yyyy') : 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <User className="w-3 h-3" />
                    {item.uploaded_by || 'Unknown'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-12 right-0 rounded-full"
              >
                <Eye className="w-5 h-5" />
              </Button>

              {selectedMedia.media_type === 'photo' ? (
                <img
                  src={selectedMedia.media_url}
                  alt={selectedMedia.description || 'Job media'}
                  className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedMedia.media_url}
                  controls
                  className="w-full h-auto max-h-[90vh] rounded-lg"
                />
              )}

              {selectedMedia.description && (
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <p className="text-slate-900">{selectedMedia.description}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}