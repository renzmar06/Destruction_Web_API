import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Affidavit from '@/models/Affidavit';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: documentId } = await params;

    // Find affidavit with this document (no auth required for public document viewing)
    const affidavit = await Affidavit.findOne({
      'attached_documents.document_id': documentId
    });

    if (!affidavit) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const document = affidavit.attached_documents.find(
      (doc: any) => doc.document_id === documentId
    );

    if (!document) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'public', document.file_path);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = document.file_type || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${document.file_name}"`,
      },
    });

  } catch (error: any) {
    console.error('View document error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to view document' 
    }, { status: 500 });
  }
}