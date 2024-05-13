const inferenceApiKey = process.env.HUGGINGFACE_API_KEY || '';
import OpenAI from 'openai';
export async function GET(request: Request) {
  const openai = new OpenAI();

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: 'Hello',
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  const file = new File([buffer], 'hello.mp3', {
    type: 'audio/mpeg',
  });

  const response = await fetch(
    'https://api-inference.huggingface.co/models/chrisjay/fonxlsr',
    {
      headers: {
        Authorization: `Bearer ${inferenceApiKey}`,
      },
      method: 'POST',
      body: file,
    },
  );

  if (response.status !== 200) {
    return Response.json({ ok: false });
  }

  return Response.json({ ok: true });
}
