import { useState, useRef } from 'react';
import { Paperclip, Image as ImageIcon, Send, X } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (content: string, files?: File[], images?: File[]) => void;
}

export const ChatInput = ({ value, onChange, onSend }: ChatInputProps) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (value.trim() || files.length || images.length) {
      onSend(value, files, images);
      setFiles([]);
      setImages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...uploadedFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedImages = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...uploadedImages]);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative group mb-6">
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600/50 via-blue-400/50 to-purple-600/50 rounded-xl blur opacity-30 group-hover:opacity-40 transition duration-1000 ${isInputFocused ? 'opacity-75' : ''}`} />
          
          <div className="relative bg-zinc-900/50 rounded-lg p-1 backdrop-blur-xl">
            {(files.length > 0 || images.length > 0) && (
              <div className="px-4 pt-2 flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-zinc-800/50 rounded-md px-2 py-1 group/item">
                    <Paperclip size={14} className="text-zinc-400" />
                    <span className="text-xs text-zinc-300">{file.name}</span>
                    <button 
                      onClick={() => removeFile(index)}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity ml-1 hover:text-zinc-200"
                    >
                      <X size={14} className="text-zinc-400" />
                    </button>
                  </div>
                ))}
                {images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2 bg-zinc-800/50 rounded-md px-2 py-1 group/item">
                    <ImageIcon size={14} className="text-zinc-400" />
                    <span className="text-xs text-zinc-300">{image.name}</span>
                    <button 
                      onClick={() => removeImage(index)}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity ml-1 hover:text-zinc-200"
                    >
                      <X size={14} className="text-zinc-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative flex items-end">
              <textarea
                placeholder="How can MedAssist help you today?"
                value={value}
                onChange={onChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={handleKeyPress}
                className="min-h-[52px] max-h-[200px] w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:outline-none resize-none"
                style={{ scrollbarWidth: 'none' }}
              />

              <div className="flex items-center gap-2 pr-2 pb-2">
                <div className="flex gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.rtf,.csv,.xlsx,.xls,.ppt,.pptx"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    <Paperclip size={18} className="text-zinc-400 hover:text-zinc-300" />
                  </button>
                  
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                  <button 
                    onClick={() => imageInputRef.current?.click()}
                    className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    <ImageIcon size={18} className="text-zinc-400 hover:text-zinc-300" />
                  </button>
                </div>

                <div className="w-px h-6 bg-zinc-700/50" />

                <button 
                  onClick={handleSendMessage}
                  className={`p-1.5 rounded-md transition-all duration-200 flex items-center gap-2
                    ${(value.trim() || files.length > 0 || images.length > 0)
                      ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                      : 'bg-zinc-800 text-zinc-400'}`}
                >
                  <Send size={18} className={(value.trim() || files.length > 0 || images.length > 0) ? 'text-white' : 'text-zinc-400'} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-500 mb-4">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
};