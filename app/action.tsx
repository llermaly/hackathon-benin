import 'server-only';

import { createAI, createStreamableUI, getMutableAIState } from 'ai/rsc';
import OpenAI from 'openai';

import { spinner, BotCard, BotMessage } from '@/components/llm-stocks';

import { sleep, runOpenAICompletion } from '@/lib/utils';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import { FaRegCheckCircle } from 'react-icons/fa';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
const inferenceApiKey = process.env.HUGGINGFACE_API_KEY || '';

async function sttFon(data: any) {
  'use server';

  const response = await fetch(
    'https://api-inference.huggingface.co/models/chrisjay/fonxlsr',
    {
      headers: {
        Authorization: `Bearer ${inferenceApiKey}`,
      },
      method: 'POST',
      body: data,
    },
  );
  if (response.status !== 200) {
    throw new Error('An error occurred');
  }
  const result = await response.json();

  return result;
}

const blobToBase64 = async (blob: Blob) => {
  let buffer = Buffer.from(await blob.arrayBuffer());
  return 'data:' + blob.type + ';base64,' + buffer.toString('base64');
};

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
  if (response.status !== 200) {
    throw new Error('An error occurred');
  }

  const result = await response.blob();
  return result;
}

const Row = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center gap-2">{children}</li>
);

async function submitFonMessage(content: string | FormData) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  const checkIcon = <FaRegCheckCircle className="text-green-500 h-5 w-5" />;

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>,
  );

  let srcAudio = null;

  if (content instanceof FormData) {
    reply.update(
      <BotCard>
        <ul>
          <Row>Transcribing Fon audio {spinner}</Row>
        </ul>
      </BotCard>,
    );

    const audiofile = content.get('file') as File;
    const audioUrl = content.get('url') as string;

    srcAudio = audioUrl;

    let stt = null;

    try {
      stt = await sttFon(audiofile);
    } catch (error) {
      reply.done(
        <BotCard>
          Huggingface API is not available or models are not loaded, please try
          again later.
        </BotCard>,
      );
      return {
        id: Date.now(),
        display: reply.value,
      };
    }

    if (!stt?.text || stt?.text?.trim() === '') {
      reply.done(
        <BotCard>
          <ul>
            <Row>Transcribing Fon audio {checkIcon}</Row>
          </ul>
          <p>Could not found any text in the audio, please try again.</p>
        </BotCard>,
      );
      return {
        id: Date.now(),
        display: reply.value,
      };
    }

    content = stt.text as string;

    reply.update(
      <BotCard>
        <ul>
          <Row>Transcribing Fon audio {checkIcon}</Row>
        </ul>
      </BotCard>,
    );
  }

  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  const completion = runOpenAICompletion(openai, {
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `\
        You are an expert Fon translator, the user will ask or submit a text in Fon and you will translate it to English. You can also provide additional information about the Fon culture related to what the user submitted.

        You will always call the function \`translate_fon_en\` when the user submits a text`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
      {
        name: 'translate_fon_en',
        description: 'Translate text from Fon to English.',
        parameters: z.object({
          text: z.string().describe('The text to be translated.'),
          additionalInfo: z
            .string()
            .describe(
              'Additional information about the word or what the user submitted related to the Fon Culture',
            ),
        }),
      },
    ],

    temperature: 0,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<BotMessage>{spinner}</BotMessage>);
    if (isFinal) {
      reply.done();
      aiState.done([...aiState.get(), { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall(
    'translate_fon_en',
    async ({ text, additionalInfo }) => {
      reply.update(
        <BotCard>
          <ul>
            <Row>Transcribing Fon audio {checkIcon}</Row>
            <Row>Translating to English {spinner}</Row>
          </ul>
        </BotCard>,
      );

      const response = await fetch(
        `https://translator-api.glosbe.com/translateByLang?sourceLang=fon&targetLang=en`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: text,
        },
      );

      const jsonResponse = await response.json();

      reply.update(
        <BotCard>
          <ul>
            <Row>Transcribing Fon audio {checkIcon}</Row>
            <Row>Translating to English {checkIcon}</Row>
            <Row>Generating response {spinner}</Row>
          </ul>
        </BotCard>,
      );

      await sleep(1000);

      reply.update(
        <BotCard>
          <ul>
            <Row>Transcribing Fon audio {checkIcon}</Row>
            <Row>Translating to English {checkIcon}</Row>
            <Row>Generating response {checkIcon}</Row>
          </ul>
        </BotCard>,
      );

      await sleep(1000);

      reply.done(
        <BotCard>
          The translation of "{text}" from Fon to English is "
          {jsonResponse?.translation}"<br />
          {additionalInfo}
        </BotCard>,
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'translate_fon_en',
          content: JSON.stringify({
            text,
            additionalInfo,
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

async function submitUserMessage(content: string | FormData) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  const checkIcon = <FaRegCheckCircle className="text-green-500 h-5 w-5" />;

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
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `\
You are a tourism guide which is helping a tourist to prepare to its trip to Benin. You are an expert of Fon culture, and an expert translator.

Your possible tasks include:
-You can translate text from English to Fon.
-You can translate text from Fon to English.
-Suggest information, recommendations or places in Benin or the Fon culture.

If the user want to translate or generate audio from english to fon, call the function \`translate_en_fon\`.
If the user want to translate from fon to english, call the function \`translate_fon_en\`.
If the user is asking for places recommendations in Benin or Fon culture call \`places_recommendations\`.`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
      {
        name: 'translate_en_fon',
        description: 'Translate text from English to Fon.',
        parameters: z.object({
          text: z.string().describe('The text to be translated.'),
        }),
      },
      {
        name: 'translate_fon_en',
        description: 'Translate text from Fon to English.',
        parameters: z.object({
          text: z.string().describe('The text to be translated.'),
        }),
      },
      {
        name: 'places_recommendations',
        description: 'Generate an image based on a user description.',
        parameters: z.object({
          recommendations: z
            .array(
              z.object({
                title: z.string().describe('Title of the place'),
                description: z.string().describe('Description of the place'),
              }),
            )
            .max(3)
            .describe('List of the recommended places to visit.'),
        }),
      },
    ],

    temperature: 0,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<BotMessage>{spinner}</BotMessage>);
    if (isFinal) {
      reply.done();
      aiState.done([...aiState.get(), { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall('translate_en_fon', async ({ text }) => {
    reply.update(
      <BotCard>
        <ul>
          <Row>Translating from English to Fon {spinner}</Row>
        </ul>
      </BotCard>,
    );

    const response = await fetch(
      `https://translator-api.glosbe.com/translateByLang?sourceLang=en&targetLang=fon`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: text,
      },
    );

    const jsonResponse = await response.json();

    reply.update(
      <BotCard>
        <ul>
          <Row>Translating from English to Fon {checkIcon}</Row>
          <Row>Generating Fon audio {spinner}</Row>
        </ul>
      </BotCard>,
    );
    try {
      const blob = await ttsFon(jsonResponse.translation);
      const base64Audio = await blobToBase64(blob);

      reply.update(
        <BotCard>
          <ul>
            <Row>Translating from English to Fon {checkIcon}</Row>
            <Row>Generating Fon audio {checkIcon}</Row>
          </ul>
        </BotCard>,
      );

      await sleep(1000);

      // const stt = await sttFon(blob);

      reply.done(
        <BotCard>
          The translation of "{text}" from English to Fon is "
          {jsonResponse?.translation}"
          <br />
          and the pronunciation in Fon is:
          <audio
            src={base64Audio}
            controls
            className="w-full mt-2 bg-appOrange"
          />
        </BotCard>,
      );
    } catch (error) {
      reply.done(
        <BotCard>
          Huggingface API is not available or models are not loaded, please try
          again later.
        </BotCard>,
      );
    }

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'translate_en_fon',
        content: JSON.stringify({
          text,
        }),
      },
    ]);
  });
  completion.onFunctionCall('translate_fon_en', async ({ text }) => {
    reply.update(
      <BotCard>
        <ul>
          <Row>Generating Fon audio {spinner}</Row>
        </ul>
      </BotCard>,
    );
    try {
      const blob = await ttsFon(text);
      const base64Audio = await blobToBase64(blob);

      reply.update(
        <BotCard>
          <ul>
            <Row>Generating Fon audio {checkIcon}</Row>
            <Row>Translating from Fon to English {spinner}</Row>
          </ul>
        </BotCard>,
      );

      const response = await fetch(
        `https://translator-api.glosbe.com/translateByLang?sourceLang=fon&targetLang=en`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: text,
        },
      );

      const jsonResponse = await response.json();

      reply.update(
        <BotCard>
          <ul>
            <Row>Generating Fon audio {checkIcon}</Row>
            <Row>Translating from Fon to English {checkIcon}</Row>
            <Row>Generating additional information {spinner}</Row>
          </ul>
        </BotCard>,
      );

      const additionalInfoResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          {
            role: 'user',
            content: `Generate some additional information about the text/word ${jsonResponse.translation} in the Fon Culture in maximum 50 words`,
          },
        ],
        max_tokens: 200,
      });

      const additionalInfo = additionalInfoResponse.choices[0].message.content;

      reply.update(
        <BotCard>
          <ul>
            <Row>Generating Fon audio {checkIcon}</Row>
            <Row>Translating from Fon to English {checkIcon}</Row>
            <Row>Generating additional information {checkIcon}</Row>
          </ul>
        </BotCard>,
      );

      await sleep(1000);

      reply.update(
        <BotCard>
          <ul>
            <Row>Generating Fon audio {checkIcon}</Row>
            <Row>Translating from Fon to English {checkIcon}</Row>
            <Row>Generating additional information {checkIcon}</Row>
            <Row>Generating additional image {spinner}</Row>
          </ul>
          <div className="mt-2">
            The pronunciation of "{text}" in Fon is:
            <audio src={base64Audio} controls className="w-full mt-2" />
          </div>
          <div className="mt-1">
            The translation to English is "{jsonResponse?.translation}"<br />
            <div className="mt-2">{additionalInfo}</div>
          </div>
          <Skeleton className="w-full max-w-[632px] h-[632px] rounded-lg my-2" />
        </BotCard>,
      );

      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `Generate an image of Fon culture related to the text ${jsonResponse?.translation}`,
        n: 1,
        size: '1024x1024',
      });

      const imgUrl = imageResponse.data[0].url;

      reply.update(
        <BotCard>
          <ul className="border-b border-gray-300">
            <Row>Generating Fon audio {checkIcon}</Row>
            <Row>Translating from Fon to English {checkIcon}</Row>
            <Row>Generating additional information {checkIcon}</Row>
            <Row>Generating additional image {checkIcon}</Row>
          </ul>
          <div className="mt-2">
            The pronunciation of "{text}" in Fon is:
            <audio src={base64Audio} controls className="w-full mt-2" />
          </div>
          <div className="mt-1">
            The translation to English is "{jsonResponse?.translation}"<br />
            <div className="mt-2">{additionalInfo}</div>
          </div>
          <img src={imgUrl} alt="Generated image" className="mt-2 rounded-lg" />
        </BotCard>,
      );

      reply.done(
        <BotCard>
          <div>
            The pronunciation of "{text}" in Fon is:
            <audio src={base64Audio} controls className="w-full mt-2" />
          </div>
          <div className="mt-1">
            The translation to English is "{jsonResponse?.translation}"<br />
            <div className="mt-2">{additionalInfo}</div>
          </div>
          <img src={imgUrl} alt="Generated image" className="mt-2 rounded-lg" />
        </BotCard>,
      );
    } catch (error) {
      reply.done(
        <BotCard>
          Huggingface API is not available or models are not loaded, please try
          again later.
        </BotCard>,
      );
    }

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'translate_fon_en',
        content: JSON.stringify({
          text,
        }),
      },
    ]);
  });
  completion.onFunctionCall(
    'places_recommendations',
    async ({ recommendations }) => {
      const getRecommendationsUI = (recommendations: any) => {
        return (
          <ul>
            {recommendations.map((recommendation: any, index: number) => (
              <li key={index}>
                <strong>{recommendation.title}</strong>
                <p className="mt-2">{recommendation.description}</p>
                {recommendation.imgUrl ? (
                  <img
                    src={recommendation.imgUrl}
                    alt="Generated image"
                    className="w-[200px] h-[200px] rounded-lg my-2"
                  />
                ) : (
                  <Skeleton className="w-[200px] h-[200px] rounded-lg my-2" />
                )}
              </li>
            ))}
          </ul>
        );
      };

      reply.update(
        <BotCard>
          <p className="mb-2">
            Sure! I can help you with that. Here are some recommendations for
            you:
          </p>
          {getRecommendationsUI(recommendations)}
        </BotCard>,
      );

      const recommendationsWithImages = await Promise.all(
        recommendations.map(async (recommendation, index) => {
          const response = await openai.images.generate({
            model: 'dall-e-2',
            prompt: recommendation.title,
            n: 1,
            size: '256x256',
          });

          const imgUrl = response.data[0].url;

          return {
            ...recommendation,
            imgUrl,
          };
        }),
      );

      reply.update(
        <BotCard>
          <p>
            Sure! I can help you with that. Here are some recommendations for
            you:
          </p>
          {getRecommendationsUI(recommendationsWithImages)}
        </BotCard>,
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'make_recommendations',
          content: JSON.stringify({
            recommendations,
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
    submitFonMessage,
  },
  initialUIState,
  initialAIState,
});
