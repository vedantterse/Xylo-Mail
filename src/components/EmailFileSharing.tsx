import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { EmailChips } from './EmailChips';
import { FileDropZone } from './FileDropZone';
import { toast } from "sonner";
import TextPressure from './ui/TextPressure/TextPressure';
// import TextCursor from './ui/TextCursor/TextCursor';

interface FileItem {
  file: File;
  id: string;
}

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
    if (file.size > 4.5 * 1024 * 1024) {
      toast.error('File too large', {
        description: "Maximum size is 4.5MB",
        duration: 4000,
      });
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
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
          <div className="flex items-center justify-center gap-1 text-glass-highlight">
            
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
            />
          </div>

          {/* Message field */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Message (Optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message... \"
              className="glass border-glass-border focus:border-gradient-start focus:ring-gradient-start/20 resize-none min-h-[60px]"
              rows={2}
            />
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

          {/* Footer */}
          <div className="footer-container">
            <p className="footer-content">
              <span className="footer-copyright">© 2025</span>
              <span className="footer-brand">XyloMail</span>
              <span className="footer-divider">•</span>
              <span className="footer-author">
                <span className="author-name">vedantterse</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};