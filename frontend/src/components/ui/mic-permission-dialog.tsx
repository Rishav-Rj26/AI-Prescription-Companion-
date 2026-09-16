"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, ShieldCheck } from "lucide-react";

interface MicPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function MicPermissionDialog({ open, onOpenChange, onConfirm }: MicPermissionDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Mic className="h-6 w-6 text-indigo-600" />
          </div>
          <DialogTitle className="text-center text-xl">Microphone Access</DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            We need access to your microphone to transcribe your voice into text.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-md my-2 border border-gray-100 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Privacy First:</strong> Audio is processed in real-time and is <strong>never recorded, stored, or logged</strong>.</p>
            <p className="text-xs text-gray-500 mt-1">You can revoke this permission at any time in your browser settings.</p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700" 
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            Allow Microphone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
