import 'server-only';

import { createAI, createStreamableUI, getMutableAIState } from 'ai/rsc';
import OpenAI from 'openai';

import fs from 'fs';

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase,
  Stocks,
  Events,
} from '@/components/llm-stocks';

import {
  runAsyncFnWithoutBlocking,
  sleep,
  formatNumber,
  runOpenAICompletion,
} from '@/lib/utils';
import { z } from 'zod';
import { StockSkeleton } from '@/components/llm-stocks/stock-skeleton';
import { EventsSkeleton } from '@/components/llm-stocks/events-skeleton';
import { StocksSkeleton } from '@/components/llm-stocks/stocks-skeleton';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const inferenceApiKey = process.env.HUGGINGFACE_API_KEY || '';

async function ttsFon(data: string) {
  'use server';
  const response = await fetch(
    'https://api-inference.huggingface.co/models/facebook/mms-tts-fon',
    {
      headers: {
        Authorization: `Bearer ${inferenceApiKey}`,
      },
      method: 'POST',
      body: data,
    },
  );
  const result = await response.blob();
  let buffer = Buffer.from(await result.arrayBuffer());
  return 'data:' + result.type + ';base64,' + buffer.toString('base64');
}

async function submitUserMessage(content: string | FormData) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>,
  );

  let srcAudio = null;

  if (content instanceof FormData) {
    reply.update(<BotMessage>Transcribing audio to text...</BotMessage>);

    const audiofile = content.get('file') as File;
    const audioUrl = content.get('url') as string;

    srcAudio = audioUrl;

    const transcription = await openai.audio.transcriptions.create({
      file: audiofile,
      model: 'whisper-1',
    });

    content = transcription.text;

    reply.update(<BotMessage>Transcription result is: "{content}"</BotMessage>);
  }

  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  const completion = runOpenAICompletion(openai, {
    model: 'gpt-4',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `\
  You are a language translation bot designed to help users translate text from any language into Fon. 
  Users can input text in any language, and you should provide the translation in Fon.
  
  Regardless of the input language, always call \`translate_text\` to perform the translation into Fon. This function should detect the source language automatically and provide the translation in Fon.`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
      {
        name: 'translate_text',
        description:
          'Translate text between English and Fon. Determine the source language and provide the translation in the target language.',
        parameters: z.object({
          sourceLang: z
            .string()
            .describe('The source language of the text.')
            .default('English'),
          sourceLangCode: z
            .string()
            .describe('The source language code of the text.')
            .default('en'),
          text: z.string().describe('The text to be translated.'),
        }),
      },
    ],

    temperature: 0,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<BotMessage>{content}</BotMessage>);
    if (isFinal) {
      reply.done();
      aiState.done([...aiState.get(), { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall(
    'translate_text',
    async ({ sourceLang, sourceLangCode, text }) => {
      reply.update(
        <BotCard>
          <p>
            Translating from {sourceLang} ({sourceLangCode}) to Fon (fon)...
          </p>
        </BotCard>,
      );

      await sleep(2000);

      const response = await fetch(
        `https://translator-api.glosbe.com/translateByLang?sourceLang=${sourceLangCode}&targetLang=fon`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: text,
        },
      );

      const jsonResponse = await response.json();

      const base64Audio = await ttsFon(jsonResponse.translation);

      reply.done(
        <BotCard>
          <div>
            {srcAudio && (
              <p>
                <audio src={srcAudio} controls className="w-full" />
              </p>
            )}
            <p>
              {srcAudio ? 'Transcript' : 'Text'}: {text}
            </p>
            <p>Translation: {jsonResponse?.translation}</p>
            {base64Audio && (
              <p>
                <audio src={base64Audio} controls className="w-full" />
              </p>
            )}
          </div>
        </BotCard>,
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'translate_text',
          content: JSON.stringify({
            sourceLang,
            text,
          }),
        },
      ]);
    },
  );

  return {
    id: Date.now(),
    display: reply.value,
  };
}

// Define necessary types and create the AI.

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
  },
  initialUIState,
  initialAIState,
});
