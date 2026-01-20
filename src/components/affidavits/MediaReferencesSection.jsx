import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Image, Video, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function MediaReferencesSection({ media, selectedMediaIds, onSelectionChange, isReadOnly }) {
  const handleToggle = (mediaId) => {
    if (isReadOnly) return;
    
    if (selectedMediaIds.includes(mediaId)) {
      onSelectionChange(selectedMediaIds.filter(id => id !== mediaId));
    } else {
      onSelectionChange([...selectedMediaIds, mediaId]);
    }
  };

  return (
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
  );
}