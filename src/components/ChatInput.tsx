import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Image, Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (content: string, files?: File[], images?: File[]) => void;
}

export function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() || files.length || images.length) {
      onSend(value, files, images);
      setFiles([]);
      setImages([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (e.target.accept.includes('image')) {
      setImages(prev => [...prev, ...selectedFiles]);
    } else {
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  return (
    <div className="p-6 border-t border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-900/50">
      <div className="max-w-3xl mx-auto">
        <div className="relative group">
          {/* Animated Border Background */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600/50 via-blue-400/50 to-purple-600/50 rounded-xl blur opacity-30 group-hover:opacity-40 transition duration-1000 ${isInputFocused ? 'opacity-75' : ''}`} />
          
          {/* Main Input Container */}
          <div className="relative bg-zinc-900 rounded-lg p-1 ring-1 ring-zinc-700/50 backdrop-blur-xl">
            <div className="relative flex items-end">
              <textarea
                placeholder="How can I help you today?"
                value={value}
                onChange={onChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="min-h-[52px] max-h-[200px] w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:outline-none resize-none"
                style={{ scrollbarWidth: 'none' }}
              />

              {/* Right Side Actions */}
              <div className="flex items-center gap-2 pr-2 pb-2">
                {/* Upload Buttons */}
                <div className="flex gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    <Paperclip size={18} className="text-zinc-400 hover:text-zinc-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    <Image size={18} className="text-zinc-400 hover:text-zinc-300" />
                  </button>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-zinc-700/50" />

                {/* Send Button */}
                <button 
                  onClick={handleSubmit}
                  className={`p-1.5 rounded-md transition-all duration-200 flex items-center gap-2
                    ${value.trim() 
                      ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                      : 'bg-zinc-800 text-zinc-400'}`}
                >
                  <Send size={18} className={value.trim() ? 'text-white' : 'text-zinc-400'} />
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

        {/* Helpful Text */}
        <div className="mt-3 text-center text-xs text-zinc-500">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}