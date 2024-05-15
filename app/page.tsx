'use client';

import { useEffect, useRef, useState } from 'react';

import { useUIState, useActions } from 'ai/rsc';
import { BotCard, UserMessage } from '@/components/llm-stocks/message';

import { type AI } from './action';
import { ChatScrollAnchor } from '@/lib/hooks/chat-scroll-anchor';
import Textarea from 'react-textarea-autosize';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ChatList } from '@/components/chat-list';
import { EmptyScreen } from '@/components/empty-screen';
import { AudioRecorder } from 'react-audio-voice-recorder';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoMdRefresh } from 'react-icons/io';
import { Header } from '@/components/header';

export default function Page() {
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage, submitFonMessage } = useActions<typeof AI>();
  const [inputValue, setInputValue] = useState('');
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const searchParams = useSearchParams();

  const stt = searchParams.get('stt');

  const router = useRouter();

  const sttFon = stt === 'fon';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        if (
          e.target &&
          ['INPUT', 'TEXTAREA'].includes((e.target as any).nodeName)
        ) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (inputRef?.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef]);

  const submitFn = sttFon ? submitFonMessage : submitUserMessage;
  return (
    <div>
      <Header showExtraMessage={messages.length === 0 && !sttFon} />
      <div className="pb-[200px] pt-4 ">
        {messages.length ? (
          <>
            <ChatList messages={messages} />
          </>
        ) : sttFon ? (
          <>
            <ChatList
              messages={[
                {
                  id: '1',
                  display: (
                    <BotCard>
                      You are now in Fon Talk mode. Use the microphone button to
                      record your message in Fon or write a text in Fon and you
                      will receive a translation and response in English.
                    </BotCard>
                  ),
                },
              ]}
            />
          </>
        ) : (
          <EmptyScreen
            submitMessage={async message => {
              // Add user message UI
              setMessages(currentMessages => [
                ...currentMessages,
                {
                  id: Date.now(),
                  display: <UserMessage>{message}</UserMessage>,
                },
              ]);

              // Submit and get response message
              const responseMessage = await submitFn(message);
              setMessages(currentMessages => [
                ...currentMessages,
                responseMessage,
              ]);
            }}
          />
        )}
        <ChatScrollAnchor trackVisibility={true} />
      </div>
      <div className="fixed bg-appBlue inset-x-0 bottom-0 w-full  peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
        <div className="mx-auto sm:max-w-[1000px]">
          <div className="px-4 py-2 space-y-4  shadow-lg sm:rounded-t-xl  md:py-4">
            <form
              ref={formRef}
              onSubmit={async (e: any) => {
                e.preventDefault();

                // Blur focus on mobile
                if (window.innerWidth < 600) {
                  e.target['message']?.blur();
                }

                const value = inputValue.trim();
                setInputValue('');
                if (!value) return;

                // Add user message UI
                setMessages(currentMessages => [
                  ...currentMessages,
                  {
                    id: Date.now(),
                    display: <UserMessage>{value}</UserMessage>,
                  },
                ]);

                try {
                  // Submit and get response message

                  const responseMessage = await submitFn(value);

                  setMessages(currentMessages => [
                    ...currentMessages,
                    responseMessage,
                  ]);
                } catch (error) {
                  // You may want to show a toast or trigger an error state.
                  console.error(error);
                }
              }}
            >
              <div className="relative flex flex-col w-full px-12 overflow-hidden max-h-60 grow  rounded-md border-2 border-appOrange ">
                <div className="absolute left-4  p-0 rounded-full top-3">
                  <AudioRecorder
                    onRecordingComplete={async blob => {
                      const url = URL.createObjectURL(blob);

                      const formData = new FormData();

                      const audiofile = new File([blob], 'audiofile', {
                        type: 'audio/mp4',
                      });

                      formData.append('file', audiofile);
                      formData.append('url', url);

                      const responseMessage = await submitFn(formData);

                      setMessages(currentMessages => [
                        ...currentMessages,
                        responseMessage,
                      ]);
                    }}
                  />
                </div>
                <Textarea
                  ref={inputRef}
                  tabIndex={0}
                  onKeyDown={onKeyDown}
                  placeholder="Send a message."
                  className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none text-white"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  name="message"
                  rows={1}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />

                <div className="absolute top-4 right-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        className="ml-2 bg-appOrange hover:bg-appOrange "
                        onClick={() => {
                          setInputValue('');
                          setMessages([]);
                          router.push('/');
                        }}
                        size="icon"
                      >
                        <IoMdRefresh className="text-black text-xl" />
                        <span className="sr-only">Start again</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start again</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
