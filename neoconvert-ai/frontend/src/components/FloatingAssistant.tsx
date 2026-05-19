import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Mic, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config/api';

type ChatMessage = { role: 'user' | 'assistant'; text: string };
const SUGGESTED_QUESTIONS = [
  'How do I convert USD to INR?',
  'What is Universal Value Index in this app?',
  'How does Quantum Prediction work?',
  'Which mode should I use for travel budgeting?',
  'How does the Currency Map feature work?',
  'What is the difference between Earth, Space, and Quantum conversion?',
  'How do I split a bill with friends in different currencies?',
  'How does the Bio-Adaptive stress feature affect transactions?',
  'What does Ethical Analysis score mean?',
  'How can I use AI Twin for conversion decisions?',
  'Which mode is best for comparing living costs across countries?',
  'How do I use voice assistant in this app?'
];

const FloatingAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi, I am your currency assistant. Ask about exchange rates, conversion, or app features.'
    }
  ]);
  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const askAssistant = async (question: string) => {
    if (!question.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/assistant`, { question });
      const answer = res.data?.data?.answer || 'Sorry, I could not answer that.';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
      speak(answer);
    } catch (_) {
      const fallback = 'I could not connect right now. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', text: fallback }]);
      speak(fallback);
    } finally {
      setLoading(false);
    }
  };

  const onSend = async () => {
    const q = input;
    setInput('');
    await askAssistant(q);
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setInput(transcript);
          await askAssistant(transcript);
        }
      };
    }
    recognitionRef.current.start();
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl flex items-center justify-center"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[60] w-[340px] max-w-[90vw] h-[460px] bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <p className="font-semibold text-white">NeoConvert Assistant</p>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {messages.map((m, idx) => (
                <div key={idx} className={`text-sm p-2 rounded-lg ${m.role === 'assistant' ? 'bg-cyan-500/15 text-cyan-100' : 'bg-white/10 text-white ml-8'}`}>
                  {m.text}
                </div>
              ))}
              {loading && <div className="text-xs text-gray-400">Thinking...</div>}
              {messages.length <= 1 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-400 mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        onClick={() => askAssistant(question)}
                        className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-200"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSend();
                  }}
                  placeholder="Ask about rates or app..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm"
                />
                <button onClick={startVoice} className="px-3 rounded-lg bg-white/10 text-white">
                  <Mic className="w-4 h-4" />
                </button>
                <button onClick={onSend} className="px-3 rounded-lg bg-cyan-500 text-black">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAssistant;
