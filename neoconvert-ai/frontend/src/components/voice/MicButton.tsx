import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
  onMuteToggle: () => void;
  isMuted: boolean;
}

const MicButton: React.FC<MicButtonProps> = ({ 
  isListening, 
  onClick, 
  onMuteToggle, 
  isMuted 
}) => {
  return (
    <div className="flex items-center gap-4">
      {/* Main Mic Button */}
      <button
        onClick={onClick}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center 
          transition-all duration-300 hover:scale-105 
          ${isListening 
            ? 'bg-gradient-to-r from-red-500 to-red-300 animate-pulse' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400'
          }`}
      >
        {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs 
          bg-black/80 text-white px-2 py-0.5 rounded">
          {isListening ? 'Listening...' : 'Speak'}
        </span>
      </button>
      
      {/* Mute/Unmute Button */}
      <button
        onClick={onMuteToggle}
        className={`w-10 h-10 rounded-full flex items-center justify-center 
          transition-all duration-300 hover:scale-105
          ${isMuted 
            ? 'bg-gradient-to-r from-gray-500 to-gray-300' 
            : 'bg-gradient-to-r from-green-500 to-green-300 hover:from-green-400 hover:to-green-200'
          }`}
      >
        {isMuted ? <Volume2 className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs 
          bg-black/80 text-white px-2 py-0.5 rounded">
          {isMuted ? 'Unmute' : 'Mute'}
        </span>
      </button>
    </div>
  );
};

export default MicButton;
