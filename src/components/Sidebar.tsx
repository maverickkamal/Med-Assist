import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  PlusCircle, 
  Settings, 
  LogOut,
  ChevronDown,
  MessageSquare,
  Star,
  Trash
} from 'lucide-react';

interface SidebarProps {
  recentChats: { id: string; title: string; daysAgo: string }[];
  starredChats: { id: string; title: string }[];
  onChatSelect: (id: string) => void;
  currentSessionId: string | null;
  onNewChat: () => void;
  onEditTitle: (sessionId: string, newTitle: string) => void;
  onDeleteChat: (sessionId: string) => void;
}

export function Sidebar({
  recentChats,
  starredChats,
  onChatSelect,
  currentSessionId,
  onNewChat,
  onEditTitle,
  onDeleteChat
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const { resetChat } = useChat();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNewChat = async () => {
    await resetChat();
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-4 border-b border-zinc-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between hover:bg-zinc-800/50"
            >
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-zinc-800">
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-zinc-100">
                    {user?.user_metadata?.name || 'User'}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {user?.email}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <Link to="/settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button 
          onClick={handleNewChat}
          className="w-full bg-zinc-800 hover:bg-zinc-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat Lists */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Starred Chats */}
        {starredChats.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2">STARRED CHATS</h3>
            <div className="space-y-1">
              {starredChats.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className={`w-full justify-start ${
                    currentSessionId === chat.id ? 'bg-zinc-800' : ''
                  }`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <Star className="mr-2 h-4 w-4 text-yellow-400" />
                  <span className="truncate">{chat.title}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Chats */}
        {recentChats.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2">RECENT CHATS</h3>
            <div className="space-y-1">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className="group flex items-center"
                >
                  <Button
                    variant="ghost"
                    className={`flex-1 justify-start ${
                      currentSessionId === chat.id ? 'bg-zinc-800' : ''
                    }`}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span className="truncate">{chat.title}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => onDeleteChat(chat.id)}
                  >
                    <Trash className="h-4 w-4 text-zinc-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}