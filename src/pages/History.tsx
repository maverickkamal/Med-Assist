import { useNavigate } from 'react-router-dom';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Pencil, Trash2, Star, ArrowLeft } from 'lucide-react';

export const History = () => {
  const navigate = useNavigate();
  const { 
    recentChats, 
    toggleStar, 
    updateSessionTitle, 
    deleteSession 
  } = useChatSessions();

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
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
              <p className="text-sm text-zinc-400">{chat.daysAgo}</p>
              
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/?chat=${chat.id}`)}
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
  );
}; 