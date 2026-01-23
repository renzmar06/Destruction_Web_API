import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required' 
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const attachmentType = formData.get('attachmentType') as string;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'No file provided' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'expenses');
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    
    // Update expense with attachment
    const { id } = await params;
    const expense = await Expense.findById(id);
    if (!expense) {
      return NextResponse.json({ 
        success: false, 
        message: 'Expense not found' 
      }, { status: 404 });
    }

    const attachment = {
      filename: file.name,
      url: `/uploads/expenses/${filename}`,
      attachmentType: attachmentType || 'vendor_invoice',
      uploaded_at: new Date()
    };

    expense.attachments = expense.attachments || [];
    expense.attachments.push(attachment);
    
    // Remove empty payment_method before saving
    if (expense.payment_method === '') {
      expense.payment_method = undefined;
    }
    
    await expense.save();

    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      data: attachment 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to upload file' 
    }, { status: 500 });
  }
}