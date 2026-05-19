import React from 'react';

interface TranscriptProps {
  transcript: string;
  isListening: boolean;
}

const Transcript: React.FC<TranscriptProps> = ({ transcript, isListening }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-cyan-300">Live Transcript</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium 
          ${isListening ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {isListening ? '● Listening' : '○ Ready'}
        </span>
      </div>
      
      <div className="h-32 overflow-y-auto p-4 bg-black/20 border border-cyan-500/30 rounded-lg">
        <div className="space-y-2 text-gray-300 leading-relaxed">
          {transcript.split('\n').map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">{line}</div>
          ))}
          {!transcript && (
            <p className="text-gray-500 text-center py-8">Start speaking to see transcript...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transcript;