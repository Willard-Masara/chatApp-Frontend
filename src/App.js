import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Get user's geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    } else {
      console.log('Geolocation is not available');
    }

    // Fetch initial messages
    axios.get('http://localhost:3001/api/messages')
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
      });

    // Listen for new messages from the server
    socket.on('newMessage', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (sender && message && latitude && longitude) {
      axios.post('http://localhost:3001/api/messages', { sender, message, latitude, longitude })
        .then(() => {
          setSender('');
          setMessage('');
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    } else {
      console.log('Sender, message, latitude, and longitude are required');
    }
  };

  return (
    <div className="App">
      <h1>Emergency Chat</h1>
      <div className="message-container">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <strong>{msg.sender}: </strong>
            {msg.message}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Your Name"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;


