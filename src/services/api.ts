async function startNewSession() {
    const response = await fetch('https://scaling-telegram-564q9jg5jrgf776g-8000.app.github.dev/start_session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data; // Contains session_id and agent details
  }

async function sendMessage(sessionId: string, content: string, imagePaths?: string[], files?: string[]) {
  const response = await fetch('https://scaling-telegram-564q9jg5jrgf776g-8000.app.github.dev/send_message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: {
        session_id: sessionId,
        content: content
      },
      image_paths: imagePaths || [],
      files: files || []
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to send message');
  }

  const data = await response.json();
  return data.response;
}

export { startNewSession, sendMessage };
