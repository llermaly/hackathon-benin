import { NextResponse } from 'next/server';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
const pump = promisify(pipeline);

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: any, res: any) {
  try {
    const formData = await req.formData();
    const file = formData.getAll('files')[0];
    console.log(file);
    const filePath = `./public/file/${file.name}`;
    await pump(file.stream(), fs.createWriteStream(filePath));
    return NextResponse.json({ status: 'success', data: file.size });
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ status: 'fail', data: e });
  }
}
