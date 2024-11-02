import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ChatInput } from '@/components/ChatInput';
import { Paperclip, Copy, RotateCcw, ChevronRight, User, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useChatSessions } from '@/hooks/use-chat-sessions';

interface Message {
  id: string;
  content: string;
  files?: File[];
  images?: File[];
  timestamp: Date;
  isAI?: boolean;
}

const App = () => {
  const [messageInput, setMessageInput] = useState('');
  const { toast } = useToast();
  const { 
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    updateSession,
    toggleStar,
    recentChats,
    starredChats,
    updateSessionTitle,
    deleteSession,
    startNewChat
  } = useChatSessions();

  const currentSession = currentSessionId 
    ? sessions.find(s => s.id === currentSessionId)
    : null;

  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      description: "Message copied to clipboard",
      duration: 2000
    });
  };

  const handleRetry = () => {
    if (!currentSessionId || !currentSession) return;

    // Remove the last AI message
    const lastUserMessageIndex = [...currentSession.messages].reverse().findIndex(m => !m.isAI);
    if (lastUserMessageIndex !== -1) {
      const actualIndex = currentSession.messages.length - 1 - lastUserMessageIndex;
      const updatedMessages = currentSession.messages.slice(0, actualIndex + 1);
      updateSession(currentSessionId, updatedMessages);

      // Simulate new AI response
      setTimeout(() => {
        const newAiResponse = {
          id: Date.now().toString(),
          content: "This is a regenerated response with different content to show the retry functionality working.",
          timestamp: new Date(),
          isAI: true
        };
        updateSession(currentSessionId, [...updatedMessages, newAiResponse]);
      }, 1000);
    }
  };

  const handleSendMessage = async (content: string, files?: File[], images?: File[]) => {
    if (content.trim() || files?.length || images?.length) {
      const userMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        files,
        images,
        timestamp: new Date(),
        isAI: false
      };

      let sessionId = currentSessionId;
      let messages: Message[];

      if (!sessionId) {
        // Create new session if this is the first message
        sessionId = createNewSession(userMessage);
        messages = [userMessage];
      } else {
        // Add to existing session
        messages = [...(currentSession?.messages || []), userMessage];
        updateSession(sessionId, messages);
      }

      setMessageInput('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          content: `Thank you for your message. Here's a simulated AI response that demonstrates proper text wrapping and formatting.`,
          timestamp: new Date(),
          isAI: true
        };
        updateSession(sessionId!, [...messages, aiResponse]);
      }, 1000);
    }
  };

  const handleStarClick = () => {
    if (currentSessionId) {
      toggleStar(currentSessionId);
    }
  };

  const handleNewChat = () => {
    startNewChat();
    setMessageInput('');
  };

  const isCurrentSessionStarred = currentSession?.isStarred || false;

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
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

            {/* MedAssist Title */}
            <div className="p-4">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-l from-purple-600 via-blue-400 to-purple-600 text-transparent bg-clip-text">
                MedAssist
              </h1>
            </div>

            {/* Main Sidebar Content */}
            <div className="flex-1 overflow-auto">
              <Sidebar 
                recentChats={recentChats}
                starredChats={starredChats}
                onChatSelect={setCurrentSessionId}
                currentSessionId={currentSessionId}
                onNewChat={handleNewChat}
                onEditTitle={updateSessionTitle}
                onDeleteChat={deleteSession}
              />
            </div>

            {/* Profile and Logout Section */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center gap-3 mb-2 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <User size={16} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">John Doe</div>
                  <div className="text-xs text-zinc-400 truncate">john@example.com</div>
                </div>
              </div>
              <button className="w-full flex items-center gap-2 p-2 text-sm text-zinc-400 hover:text-zinc-300 rounded-lg hover:bg-zinc-800/50">
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 ml-4 md:ml-20"> 
        <Header 
          isStarred={isCurrentSessionStarred} 
          onStarClick={handleStarClick}
        />

        <div className="flex-1 overflow-auto pb-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4 pt-4">
            {currentSession?.messages.length ? (
              currentSession.messages.map((message, index) => (
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
                        {message.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="flex items-center gap-2 bg-zinc-800/50 rounded-md px-2 py-1">
                            <Paperclip size={14} className="text-zinc-400" />
                            <span className="text-sm text-zinc-300">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.images && message.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {message.images.map((image, imageIndex) => (
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
              ))
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

        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ChatInput 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onSend={handleSendMessage}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default App;