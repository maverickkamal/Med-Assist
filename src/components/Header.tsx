import { Button } from '@/components/ui/button';
import { Star, StarOff, Share2 } from 'lucide-react';
import { useChatStore } from '@/store/chat-store';

export function Header() {
  const { 
    currentSession: getCurrentSession,
    currentSessionId,
    toggleStar,
    exportChat
  } = useChatStore();

  const currentSession = getCurrentSession();
  const isStarred = currentSession?.isStarred || false;

  const handleStarClick = () => {
    if (currentSessionId) {
      toggleStar(currentSessionId);
    }
  };

  const handleShare = () => {
    if (currentSession) {
      exportChat(currentSession.messages);
    }
  };

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <div className="h-16 px-4 flex items-center justify-end">
        {/* Right side - Star and Share buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStarClick}
            className="text-zinc-400 hover:text-yellow-400"
          >
            {isStarred ? (
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}