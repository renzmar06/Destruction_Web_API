import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }
    let imageUrl = '';


    if (file && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

      const uploadDir = path.join(process.cwd(), 'public', 'upload');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      imageUrl = `/upload/${filename}`;
    }

    return NextResponse.json({ 
      success: true, 
      url: imageUrl,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to upload file' 
    }, { status: 500 });
  }
}