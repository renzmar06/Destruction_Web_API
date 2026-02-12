'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MessageModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (content: string) => Promise<void>;
  recipientName?: string;
}

export default function MessageModal({ open, onClose, onSend, recipientName }: MessageModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      await onSend(content);
      setContent('');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message {recipientName && `to ${recipientName}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              rows={6}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading || !content.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
