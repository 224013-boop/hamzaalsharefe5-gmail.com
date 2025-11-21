
import React, { useState, useRef, useEffect } from 'react';
import { LoadingState } from '../types';
import { blobToBase64 } from '../services/audioUtils';

interface Props {
  onSendMessage: (text: string) => void;
  onSendAudio: (base64Audio: string) => void;
  loadingState: LoadingState;
}

export const InputArea: React.FC<Props> = ({ onSendMessage, onSendAudio, loadingState }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || loadingState !== LoadingState.Idle) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' }); // or audio/webm
        const base64 = await blobToBase64(audioBlob);
        onSendAudio(base64);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const isLoading = loadingState !== LoadingState.Idle && loadingState !== LoadingState.Recording;

  return (
    <div className="bg-slate-900 p-4 border-t border-slate-800">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 focus-within:border-amber-500 transition-colors flex items-center relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={loadingState === LoadingState.Recording ? "Recording... tap mic to stop" : "Ask Maswadh Salon..."}
            className="w-full bg-transparent text-slate-100 p-3 px-4 outline-none resize-none max-h-32 min-h-[50px]"
            rows={1}
            disabled={loadingState === LoadingState.Recording || isLoading}
            dir="auto"
          />
        </div>

        {/* Audio Record Button */}
        <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || (inputText.length > 0)}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
                isRecording 
                ? 'bg-red-500 text-white animate-pulse scale-110' 
                : inputText.length > 0 
                    ? 'hidden' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-amber-500'
            }`}
        >
             {isRecording ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
             ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
             )}
        </button>

        {/* Send Text Button */}
        {inputText.length > 0 && (
             <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-3 rounded-full bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-lg flex-shrink-0"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
        )}
      </div>
      
      {/* Status Indicator */}
      <div className="max-w-3xl mx-auto h-6 mt-1 flex justify-center items-center text-xs font-medium text-amber-500/80">
          {loadingState === LoadingState.Recording && <span>Listening...</span>}
          {loadingState === LoadingState.Transcribing && <span>Transcribing Audio...</span>}
          {loadingState === LoadingState.Thinking && <span className="animate-pulse">Maswadh AI is thinking...</span>}
      </div>
    </div>
  );
};
