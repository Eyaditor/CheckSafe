import React, { useState } from 'react';
import axios from 'axios';
import '../components/style/Chatpage.css';

// Using the backend URL stored in the environment variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ChatPage = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChat = async () => {
        if (!query.trim()) {
            setError('Please ask a question.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const requestUrl = `${BACKEND_URL}/ask-question?question=${encodeURIComponent(query)}`;
            console.log("Request URL:", requestUrl);

            const result = await axios.get(requestUrl);
            console.log("API Response:", result.data.content);
            setResponse(result.data.content);
        } catch (error) {
            console.error('Error with API:', error);
            setError('There was an error processing your request. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <h1>Cyber Safety Chat</h1>
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about cyber safety"
                rows="4"
                className="chat-input"
            />
            <button onClick={handleChat} disabled={loading} className="send-button">
                {loading ? 'Sending...' : 'Send'}
            </button>

            {error && <p className="error-message">{error}</p>}
            {response && <div className="response-container"><p>{response}</p></div>}
        </div>
    );
};

export default ChatPage;
