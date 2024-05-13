const inferenceApiKey = process.env.HUGGINGFACE_API_KEY || '';

export async function GET(request: Request) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/facebook/mms-tts-fon',
    {
      headers: {
        Authorization: `Bearer ${inferenceApiKey}`,
      },
      method: 'POST',
      body: 'Hello my friend',
    },
  );

  if (response.status !== 200) {
    return Response.json({ ok: false });
  }

  return Response.json({ ok: true });
}
