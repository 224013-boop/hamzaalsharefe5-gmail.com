import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface Props {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-md relative ${
          isUser
            ? 'bg-amber-600 text-white rounded-br-none'
            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
        }`}
      >
        {/* Sender Name for Model */}
        {!isUser && (
          <div className="text-amber-400 text-sm font-bold mb-2 pb-1 border-b border-slate-700/50 inline-block">
            صالون مسودة
          </div>
        )}

        {/* Message Text */}
        <div className="whitespace-pre-wrap text-base leading-relaxed" dir="auto">
          {message.text}
        </div>

        {/* Grounding Sources (Search/Maps) */}
        {message.groundingChunks && message.groundingChunks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-600/50">
            <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Sources</p>
            <div className="flex flex-wrap gap-2">
              {message.groundingChunks.map((chunk, idx) => {
                if (chunk.web) {
                  return (
                    <a
                      key={idx}
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-blue-300 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h12" /></svg>
                      {chunk.web.title || 'Web Source'}
                    </a>
                  );
                }
                if (chunk.maps) {
                  return (
                    <a
                      key={idx}
                      href={chunk.maps.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-green-300 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {chunk.maps.title || 'Google Maps'}
                    </a>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
        
        <div className="text-[10px] opacity-50 mt-1 text-right">
           {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};