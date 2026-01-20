import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackForm({ request, customerId, existingFeedback, onSubmitSuccess }) {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [serviceQuality, setServiceQuality] = useState(existingFeedback?.service_quality || 0);
  const [communication, setCommunication] = useState(existingFeedback?.communication || 0);
  const [timeliness, setTimeliness] = useState(existingFeedback?.timeliness || 0);
  const [comments, setComments] = useState(existingFeedback?.comments || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData) => {
      if (existingFeedback) {
        return await base44.entities.ServiceRequestFeedback.update(existingFeedback.id, feedbackData);
      } else {
        return await base44.entities.ServiceRequestFeedback.create(feedbackData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServiceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['serviceFeedback'] });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onSubmitSuccess) onSubmitSuccess();
      }, 3000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    submitFeedbackMutation.mutate({
      request_id: request.id,
      customer_id: customerId,
      rating,
      service_quality: serviceQuality || rating,
      communication: communication || rating,
      timeliness: timeliness || rating,
      comments: comments.trim()
    });
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => label === 'Overall Rating' && setHoverRating(star)}
            onMouseLeave={() => label === 'Overall Rating' && setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (label === 'Overall Rating' ? (hoverRating || value) : value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="border-b border-blue-200">
        <CardTitle className="text-lg">
          {existingFeedback ? 'Update Your Feedback' : 'How Was Your Service?'}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Your feedback helps us improve our service quality
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <StarRating
            value={rating}
            onChange={setRating}
            label="Overall Rating *"
          />

          {/* Detailed Ratings */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <StarRating
              value={serviceQuality}
              onChange={setServiceQuality}
              label="Service Quality"
            />
            <StarRating
              value={communication}
              onChange={setCommunication}
              label="Communication"
            />
            <StarRating
              value={timeliness}
              onChange={setTimeliness}
              label="Timeliness"
            />
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Additional Comments (Optional)
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-slate-500">{comments.length}/1000 characters</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitFeedbackMutation.isPending || rating === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {submitFeedbackMutation.isPending ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                {existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
              </>
            )}
          </Button>
        </form>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Thank you for your feedback!</p>
                <p className="text-sm text-green-700">We appreciate you taking the time to share your experience.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}