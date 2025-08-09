import React, { useState } from 'react';
import { Send, MessageSquare, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { EmailChips } from './EmailChips';
import { FileDropZone } from './FileDropZone';
import { toast } from "sonner";
import TextPressure from './ui/TextPressure/TextPressure';
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";

interface FileItem {
  file: File;
  id: string;
}

const MAX_TOTAL_SIZE = 4.5 * 1024 * 1024; // 4.5MB

export const EmailFileSharing: React.FC = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const canSend = emails.length > 0 && files.length > 0;

  const handleSend = async () => {
    if (!canSend) return;

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('emails', JSON.stringify(emails));
      formData.append('message', message);
      
      files.forEach((fileItem) => {
        formData.append('files', fileItem.file);
      });

      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          toast.success('Files sent successfully! ✅', {
            description: data.message,
            duration: 4000,
          });
        } else if (data.partialSuccess) {
          toast.warning('Partially sent! ⚠️', {
            description: data.message,
            duration: 4000,
          });
        }

        // Reset form on success
        setEmails([]);
        setMessage('');
        setFiles([]);
      } else {
        throw new Error(data.error || 'Failed to send files');
      }
    } catch (error: unknown) {
      console.error('Send error:', error);
      const errorMessage = error instanceof Error ? error.message : "Please try again later.";
      toast.error('Failed to send files', {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileValidation = (file: File) => {
    if (file.size > MAX_TOTAL_SIZE) {
      toast.error('File too large', {
        description: "Individual file size cannot exceed 4.5MB",
        duration: 4000,
      });
      return false;
    }

    const totalSize = files.reduce((sum, item) => sum + item.file.size, 0) + file.size;
    if (totalSize > MAX_TOTAL_SIZE) {
      toast.error('Combined size too large', {
        description: "Total size of all files cannot exceed 4.5MB",
        duration: 4000,
      });
      return false;
    }

    return true;
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header - removed info button from here */}
        <div className="text-center mb-3 md:mb-4">
          <div style={{ position: 'relative', height: '110px' }}>
            <TextPressure
              text="XyloMail"
              flex={true}
              alpha={false}
              stroke={true}
              width={false}
              weight={true}
              italic={false}
              textColor="#420b56c2"
              strokeColor="#ffffff"
              minFontSize={9}
            />
          </div>
        </div>

        {/* Main card */}
        <div className="glass-card rounded-2xl p-3 md:p-4 space-y-2.5 w-full max-w-[90vw] md:max-w-[400px] mx-auto">
          {/* Fixed height container for scrollable content */}
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            <EmailChips 
              emails={emails} 
              onEmailsChange={setEmails}
              maxEmails={5}
            />

            <FileDropZone 
              files={files}
              onFilesChange={setFiles}
              onFileValidation={handleFileValidation}
              maxTotalSize={MAX_TOTAL_SIZE}
            />
          </div>

          {/* Message field with enhanced styling */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Message (Optional)
            </label>
            <div className="relative group">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message..."
                className="glass w-full rounded-lg border-glass-border min-h-[60px] px-3 py-2 text-sm
                  focus:border-gradient-start focus:ring-1 focus:ring-gradient-start/20
                  placeholder:text-white/30 resize-none transition-all duration-200
                  backdrop-blur-sm bg-white/[0.025]
                  "
                rows={2}
              />
              <div className="absolute inset-0 -z-10 rounded-lg glass-card opacity-0  transition-opacity duration-300" />
            </div>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!canSend || isLoading}
            className={`w-full metallic-button text-white/90 font-medium text-sm md:text-base h-12 mt-2 relative group ${
              isLoading ? 'sending' : ''
            }`}
            size="lg"
          >
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              <Send className="send-icon h-4 w-4" />
              <span className={`${isLoading ? 'dots-animation' : ''} tracking-wide`}>
                {isLoading ? 'Sending' : 'Send Files'}
              </span>
            </span>
          </Button>

          {/* Modified Footer with Info Button */}
          <div className="footer-container relative">
            <p className="footer-content text-center">
              <span className="footer-copyright">© 2025</span>
              <span className="footer-brand">XyloMail</span>
              <span className="footer-divider">•</span>
              <span className="footer-author">
                <span className="author-name">vedantterse</span>
              </span>
            </p>

            <HoverCard openDelay={100}>
              <HoverCardTrigger asChild>
                <button 
                  className="absolute right-1 top-1/2 -translate-y-1/4 p-1 rounded-full hover:bg-white/5 transition-colors group"
                  aria-label="Information"
                >
                  <Info className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent 
                align="start"
                side="right"
                sideOffset={12}
                className="w-80 glass-card border-none shadow-xl p-4 text-sm"
              >
                <div className="space-y-3">
                  <h4 className="font-medium text-gradient-start">How It Works</h4>
                  <div className="space-y-2 text-white/80">
                    <p>• Files are delivered within 3-4 minutes</p>
                    <p>• Maximum transfer size: 4.5MB </p>
                    <p>• Up to 5 recipients per send</p>
                    <p>• Files are sent as a ZIP archive</p>
                  </div>
                  
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-white/60">
                      Having issues? Contact support at{" "}
                      <a 
                        href="mailto:vedantterse@xylosync.in"
                        className="text-gradient-start hover:underline"
                      >
                        vedantterse@xylosync.in
                      </a>
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </div>
    </div>
  );
};