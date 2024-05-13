'use server';
const inferenceApiKey = process.env.HUGGINGFACE_API_KEY || '';

async function sttFon(data: any) {
  try {
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
    const result = await response.json();
    return result;
  } catch (error) {
    return null;
  }
}

export default async function TTSStatus() {
  return <main>asd</main>;
}
