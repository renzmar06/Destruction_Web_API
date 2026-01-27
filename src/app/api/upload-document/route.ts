import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentId = formData.get('document_id') as string;

    if (!file || !documentId) {
      return NextResponse.json({ success: false, message: 'File and document ID are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${documentId}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/documents/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        document_id: documentId,
        file_name: file.name,
        file_path: publicPath,
        file_type: file.type,
        upload_date: new Date()
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to upload file' 
    }, { status: 500 });
  }
}