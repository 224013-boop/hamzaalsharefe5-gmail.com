
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[];
    }[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isAudio?: boolean;
  groundingChunks?: GroundingChunk[];
}

export enum LoadingState {
  Idle,
  Recording,
  Transcribing,
  Thinking
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}
