async function startNewSession() {
    const response = await fetch('https://infamous-toad-5gqrrvvp6jjg2vwqj-8000.app.github.dev/start_session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data; // Contains session_id and agent details
  }

export { startNewSession };
