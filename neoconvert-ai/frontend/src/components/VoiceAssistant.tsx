import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, RotateCcw } from 'lucide-react';
import axios from 'axios';

interface VoiceAssistantProps {
  onResponse?: (response: string) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onResponse }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(transcriptSegment);
          } else {
            interimTranscript += transcriptSegment;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const sendToAI = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/twin', {
        message: transcript,
        context: { source: 'voice' }
      });

      if (res.data.success) {
        setResponse(res.data.data.response);
        if (onResponse) {
          onResponse(res.data.data.response);
        }
        // Speak the response
        speakResponse(res.data.data.response);
      }
    } catch (err) {
      console.error('AI request failed:', err);
      setResponse('Sorry, I could not process your request.');
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const reset = () => {
    setTranscript('');
    setResponse('');
    window.speechSynthesis.cancel();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="cyber-card rounded-2xl p-8 border border-cyan-500/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-display neon-text mb-2">🎤 Voice Assistant</h2>
          <p className="text-gray-400">Talk to your AI Financial Twin</p>
        </div>

        {/* Microphone Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all transform hover:scale-110 ${
              isListening
                ? 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400'
            }`}
          >
            {isListening ? <MicOff size={48} /> : <Mic size={48} />}
            <span className="absolute text-xs bottom-2">{isListening ? 'Stop' : 'Start'}</span>
          </button>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="mb-6 p-4 bg-black/30 border border-cyan-500/30 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">You said:</p>
            <p className="text-cyan-300 text-lg">{transcript}</p>
          </div>
        )}

        {/* Send Button */}
        {transcript && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={sendToAI}
              disabled={loading}
              className="flex-1 cyber-button py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? '⏳ Processing...' : '✨ Send to AI'}
            </button>
            <button
              onClick={reset}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        )}

        {/* AI Response */}
        {response && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">🤖 AI Response:</p>
              {isSpeaking && <Volume2 size={20} className="text-green-400 animate-pulse" />}
            </div>
            <p className="text-white text-lg leading-relaxed">{response}</p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Click the microphone button, speak your question, then click Send to get AI financial advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
