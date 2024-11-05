import { Message } from '@/types/chat';

export function exportChat(messages: Message[], format: 'txt' | 'json' | 'md' = 'txt') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  let content = '';
  let filename = '';

  switch (format) {
    case 'txt':
      content = messages
        .map(m => `${m.isAI ? 'AI' : 'You'} (${new Date(m.timestamp).toLocaleString()}):\n${m.content}\n\n`)
        .join('');
      filename = `chat-export-${timestamp}.txt`;
      break;

    case 'json':
      content = JSON.stringify(messages, null, 2);
      filename = `chat-export-${timestamp}.json`;
      break;

    case 'md':
      content = messages
        .map(m => `### ${m.isAI ? 'AI' : 'You'}\n*${new Date(m.timestamp).toLocaleString()}*\n\n${m.content}\n\n`)
        .join('');
      filename = `chat-export-${timestamp}.md`;
      break;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 