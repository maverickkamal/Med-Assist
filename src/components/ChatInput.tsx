import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image, Paperclip, X, Sparkles } from 'lucide-react';
import { useChatStore } from '@/store/chat-store';

export function ChatInput() {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { sendMessage } = useChatStore();

  const handleSubmit = async () => {
    if (content.trim() || files.length || images.length) {
      try {
        // Capture current values before clearing
        const currentContent = content.trim();
        const currentFiles = [...files];
        const currentImages = [...images];

        // Clear input immediately for better UX
        setContent('');
        setFiles([]);
        setImages([]);

        // Send message with captured values
        await sendMessage(currentContent, currentFiles, currentImages);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      handleSubmit(); // Call handleSubmit directly
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const selectedFiles = Array.from(e.target.files || []);
    if (type === 'file') {
      setFiles(prev => [...prev, ...selectedFiles]);
    } else {
      setImages(prev => [...prev, ...selectedFiles]);
    }
    e.target.value = ''; // Reset input
  };

  const removeFile = (index: number, type: 'file' | 'image') => {
    if (type === 'file') {
      setFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 to-zinc-900/0 pb-[env(safe-area-inset-bottom)] pl-16 md:pl-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 pb-4">
          {/* File Attachments */}
          {(files.length > 0 || images.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-zinc-800/50 rounded-md px-2 py-1">
                  <Paperclip size={14} className="text-zinc-400" />
                  <span className="text-sm text-zinc-300">{file.name}</span>
                  <button onClick={() => removeFile(index, 'file')}>
                    <X size={14} className="text-zinc-400 hover:text-zinc-200" />
                  </button>
                </div>
              ))}
              {images.map((image, index) => (
                <div key={index} className="flex items-center gap-2 bg-zinc-800/50 rounded-md px-2 py-1">
                  <Image size={14} className="text-zinc-400" />
                  <span className="text-sm text-zinc-300">{image.name}</span>
                  <button onClick={() => removeFile(index, 'image')}>
                    <X size={14} className="text-zinc-400 hover:text-zinc-200" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="relative flex items-end gap-2 bg-zinc-800/50 rounded-lg p-2">
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                className="min-h-[60px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e, 'file')}
                className="hidden"
                multiple
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => handleFileChange(e, 'image')}
                accept="image/*"
                className="hidden"
                multiple
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-zinc-400 hover:text-zinc-300"
              >
                <Paperclip size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => imageInputRef.current?.click()}
                className="text-zinc-400 hover:text-zinc-300"
              >
                <Image size={18} />
              </Button>

              {/* Divider */}
              <div className="w-px h-6 bg-zinc-700/50" />

              {/* Send Button */}
              <button 
                onClick={handleSubmit}
                className={`p-1.5 rounded-md transition-all duration-200 flex items-center gap-2
                  ${content.trim() 
                    ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                    : 'bg-zinc-800 text-zinc-400'}`}
              >
                <Send size={18} className={content.trim() ? 'text-white' : 'text-zinc-400'} />
              </button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800/50 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-zinc-400">MedAssist AI</span>
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs">Beta</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span>Medical AI Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}