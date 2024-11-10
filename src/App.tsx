import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ChatInput } from '@/components/ChatInput';
import { Paperclip, Copy, RotateCcw, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { exportChat } from '@/utils/chatExport';
import { useChatStore } from '@/store/chat-store';

export default function App() {
  const { user } = useAuth();
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get everything we need from Zustand store
  const {
    currentSession: getCurrentSession,
    currentSessionId,
    setCurrentSession,
    sendMessage,
    toggleStar,
    recentChats: getRecentChats,
    starredChats: getStarredChats,
    updateSessionTitle,
    deleteSession,
    startNewChat,
    isLoading
  } = useChatStore();

  // Get current values from computed properties
  const currentSession = getCurrentSession();
  const recentChats = getRecentChats();
  const starredChats = getStarredChats();

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      description: "Message copied to clipboard",
      duration: 2000
    });
  };

  const handleRetry = async () => {
    const session = getCurrentSession();
    if (!session) return;

    // Find the last user message
    const lastUserMessage = [...session.messages]
      .reverse()
      .find(m => !m.isAI);

    if (lastUserMessage) {
      // Remove all messages after the last user message
      const messageIndex = session.messages.findIndex(m => m.id === lastUserMessage.id);
      const updatedMessages = session.messages.slice(0, messageIndex + 1);
      
      // Resend the message
      await sendMessage(
        lastUserMessage.content,
        lastUserMessage.files,
        lastUserMessage.images
      );
    }
  };

  const handleNewChat = async () => {
    await startNewChat();
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Fixed MedAssist Title */}
      <Link to="/" className="fixed top-0 left-0 p-4 z-40">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-purple-600 via-blue-400 to-purple-600 text-transparent bg-clip-text hover:opacity-80 transition-opacity">
          MedAssist
        </h1>
      </Link>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <>
          {/* Sidebar */}
          <div className="relative">
            <div className={`fixed left-0 top-0 h-full w-[280px] md:w-80 transition-transform duration-300 z-30
              ${isSidebarPinned ? 'translate-x-0' : '-translate-x-[calc(100%-16px)] hover:translate-x-0'}`}
            >
              <div className="h-full backdrop-blur-xl bg-zinc-900/60 relative flex flex-col">
                {/* Gradient Border */}
                <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-purple-600/50 via-blue-400/50 to-purple-600/50" />
                
                {/* Pin Button */}
                <button
                  onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                  className={`absolute right-[-12px] top-4 z-10 p-1 rounded-full bg-zinc-800 border border-zinc-700
                    transition-transform duration-300 ${isSidebarPinned ? 'rotate-180' : ''}`}
                >
                  <ChevronRight size={16} />
                </button>

                {/* Spacer for fixed MedAssist title */}
                <div className="h-16" />

                {/* Sidebar Content */}
                <Sidebar 
                  recentChats={recentChats}
                  starredChats={starredChats}
                  onChatSelect={setCurrentSession}
                  currentSessionId={currentSessionId}
                  onNewChat={handleNewChat}
                  onEditTitle={updateSessionTitle}
                  onDeleteChat={deleteSession}
                />
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 pl-16 md:pl-20">
            <Header />

            <div className="flex-1 overflow-auto pb-32">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4 pt-4">
                {currentSession?.messages.length ? (
                  <>
                    {currentSession.messages.map((message: Message, index: number) => (
                      <div 
                        key={message.id} 
                        className={`flex gap-4 ${message.isAI ? 'bg-zinc-800/50 rounded-lg p-4' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          message.isAI ? 'bg-purple-500' : 'bg-zinc-700'
                        }`}>
                          {message.isAI ? 'AI' : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{message.content}</p>
                          </div>
                          {message.files && message.files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.files.map((file: File, fileIndex: number) => (
                                <div key={fileIndex} className="flex items-center gap-2 bg-zinc-800/50 rounded-md px-2 py-1">
                                  <Paperclip size={14} className="text-zinc-400" />
                                  <span className="text-sm text-zinc-300">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {message.images && message.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {message.images.map((image: File, imageIndex: number) => (
                                <img
                                  key={imageIndex}
                                  src={URL.createObjectURL(image)}
                                  alt={`Uploaded ${imageIndex + 1}`}
                                  className="rounded-md w-full object-cover"
                                />
                              ))}
                            </div>
                          )}
                          {message.isAI && (
                            <div className="flex items-center gap-2 mt-2">
                              <button 
                                onClick={() => handleCopy(message.content)}
                                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300"
                              >
                                <Copy size={12} />
                                Copy
                              </button>
                              {index === currentSession.messages.length - 1 && message.isAI && (
                                <button 
                                  onClick={handleRetry}
                                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300"
                                >
                                  <RotateCcw size={12} />
                                  Retry
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* Add this div for auto-scroll */}
                  </>
                ) : (
                  <div className="h-[calc(100vh-200px)] flex items-center justify-center p-4">
                    <div className="text-center space-y-4 max-w-lg mx-auto">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-400 to-purple-600 text-transparent bg-clip-text">
                        Welcome to MedAssist
                      </h1>
                      <p className="text-zinc-400 text-sm sm:text-base px-4">
                        Your AI-powered medical assistant. Ask me anything about health, 
                        medical conditions, or general wellness advice.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ChatInput />
          </div>
          <Toaster />
        </>
      )}
    </div>
  );
}