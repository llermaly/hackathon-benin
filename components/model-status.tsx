'use client';
import React, { useEffect } from 'react';
import { IoMdRefresh } from 'react-icons/io';
import { spinner } from './llm-stocks';

const ModelStatus = () => {
  const [ttsModelStatus, setTTSModelStatus] = React.useState<boolean>(false);
  const [sttModelStatus, setSTTModelStatus] = React.useState<boolean>(false);
  const [isLoadingTTS, setIsLoadingTTS] = React.useState<boolean>(false);
  const [isLoadingSTT, setIsLoadingSTT] = React.useState<boolean>(false);

  const fetchTTSModel = async () => {
    setIsLoadingTTS(true);
    const response = await fetch('/api/tts', {
      method: 'GET',
    });

    const jsonResponse = await response.json();
    setIsLoadingTTS(false);
    setTTSModelStatus(jsonResponse?.ok);
  };

  const fetchSTTModel = async () => {
    setIsLoadingSTT(true);
    const response = await fetch('/api/stt', {
      method: 'GET',
    });

    const jsonResponse = await response.json();
    setIsLoadingSTT(false);
    setSTTModelStatus(jsonResponse?.ok);
  };

  useEffect(() => {
    fetchTTSModel();
    fetchSTTModel();
  }, []);

  return (
    <div>
      <div className="font-semibold">Models status</div>
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        TTS Model
        <div
          className={`h-3 w-3  rounded-full ${ttsModelStatus ? 'bg-green-500' : 'bg-orange-500'}`}
        />
        {isLoadingTTS ? (
          spinner
        ) : (
          <IoMdRefresh
            className="h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={fetchTTSModel}
          />
        )}
      </div>
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        STT Model
        <div
          className={`h-3 w-3  rounded-full ${sttModelStatus ? 'bg-green-500' : 'bg-orange-500'}`}
        />
        {isLoadingSTT ? (
          spinner
        ) : (
          <IoMdRefresh
            className="h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={fetchSTTModel}
          />
        )}
      </div>
    </div>
  );
};

export default ModelStatus;
