import { useNavigate } from 'react-router-dom';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Layout } from '@/components/Layout';
import { ArrowLeft, Star, Trash2 } from 'lucide-react';

export function History() {
  const navigate = useNavigate();
  const { 
    recentChats, 
    toggleStar, 
    deleteSession 
  } = useChatSessions();

  const handleChatOpen = (chatId: string) => {
    navigate(`/chat?chat=${chatId}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Back to Chat
          </button>

          <h1 className="text-2xl font-bold mb-6">Chat History</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentChats.map((chat) => (
              <div key={chat.id} className="bg-zinc-800/50 rounded-lg p-4 group relative">
                <h3 className="font-medium mb-2 pr-20 truncate">{chat.title}</h3>
                <p className="text-sm text-zinc-400">
                  {chat.daysAgo === '0' ? 'Today' : 
                   chat.daysAgo === '1' ? 'Yesterday' : 
                   `${chat.daysAgo} days ago`}
                </p>
                
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => handleChatOpen(chat.id)}
                    className="text-zinc-400 hover:text-white"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => toggleStar(chat.id)}
                    className="text-zinc-400 hover:text-yellow-400"
                  >
                    <Star size={16} />
                  </button>
                  <button
                    onClick={() => deleteSession(chat.id)}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
} 