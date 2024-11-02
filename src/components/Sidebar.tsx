import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  recentChats: { id: string; title: string; daysAgo: string; }[];
  starredChats: { id: string; title: string; }[];
  onChatSelect: (id: string) => void;
  currentSessionId: string | null;
  onNewChat: () => void;
  onEditTitle: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
}

export const Sidebar = ({ 
  recentChats, 
  starredChats, 
  onChatSelect,
  currentSessionId,
  onNewChat,
  onEditTitle,
  onDeleteChat
}: SidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();

  const handleEditClick = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleEditSubmit = (id: string) => {
    if (editTitle.trim()) {
      onEditTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const displayedRecentChats = recentChats.slice(0, 5);
  const hasMoreChats = recentChats.length > 5;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <Button 
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 mb-2">Recent</h2>
          <div className="space-y-1">
            {displayedRecentChats.map((chat) => (
              <div key={chat.id} className="group relative">
                {editingId === chat.id ? (
                  <div className="flex items-center gap-2 p-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleEditSubmit(chat.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit(chat.id)}
                      className="w-full bg-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => onChatSelect(chat.id)}
                    className={`w-full text-left p-2 rounded-lg text-sm ${
                      currentSessionId === chat.id 
                        ? 'bg-zinc-800/50 text-white' 
                        : 'text-zinc-400 hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="truncate">{chat.title}</div>
                    <div className="text-xs text-zinc-500">{chat.daysAgo}</div>
                  </button>
                )}
                
                <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(chat.id, chat.title);
                    }}
                    className="p-1 hover:bg-zinc-700 rounded"
                  >
                    <Pencil size={14} className="text-zinc-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-zinc-700 rounded"
                  >
                    <Trash2 size={14} className="text-zinc-400" />
                  </button>
                </div>
              </div>
            ))}

            {hasMoreChats && (
              <button
                onClick={() => navigate('/history')}
                className="w-full text-left p-2 text-sm text-zinc-400 hover:text-zinc-300"
              >
                See more...
              </button>
            )}
          </div>
        </div>

        {starredChats.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-zinc-400 mb-2">Starred</h2>
            <div className="space-y-1">
              {starredChats.map((chat) => (
                <div key={chat.id} className="group relative">
                  {editingId === chat.id ? (
                    <div className="flex items-center gap-2 p-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleEditSubmit(chat.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit(chat.id)}
                        className="w-full bg-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onChatSelect(chat.id)}
                      className={`w-full text-left p-2 rounded-lg text-sm ${
                        currentSessionId === chat.id 
                          ? 'bg-zinc-800/50 text-white' 
                          : 'text-zinc-400 hover:bg-zinc-800/30'
                      }`}
                    >
                      <div className="truncate">{chat.title}</div>
                    </button>
                  )}
                  
                  <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(chat.id, chat.title);
                      }}
                      className="p-1 hover:bg-zinc-700 rounded"
                    >
                      <Pencil size={14} className="text-zinc-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="p-1 hover:bg-zinc-700 rounded"
                    >
                      <Trash2 size={14} className="text-zinc-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};