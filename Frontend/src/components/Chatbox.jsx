import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';

const defaultMessages = [
  { role: 'bot', text: "Hi! I'm your Dhor assistant. How can I help you?" }
];

export default function Chatbox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await chatAPI.getMessages();

        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map(msg => ({
              role: msg.role,
              text: msg.text,
            }))
          );
        } else {
          setMessages(defaultMessages);
        }

        setInput('');
        setOpen(false);
      } catch (error) {
        setMessages(defaultMessages);
      }
    };

    loadMessages();
  }, [user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentInput = input;
    const userMsg = { role: 'user', text: currentInput };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatAPI.sendMessage(currentInput);

      setMessages(prev => [
        ...prev,
        { role: 'bot', text: data.reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Something went wrong. Try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 mb-3">
          <div className="bg-blue-600 text-white px-4 py-3 font-semibold flex justify-between items-center">
            <span>Dhor Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white text-lg">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-sm">
                  Typing...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask something..."
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700"
      >
        💬
      </button>
    </div>
  );
}