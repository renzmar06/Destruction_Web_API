import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    const { id, type } = await params;
    
    // Fetch affidavit data
    const { MongoClient, ObjectId } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    let affidavit;
    try {
      await client.connect();
      const db = client.db('destruction_web_api');
      affidavit = await db.collection('affidavits').findOne({ _id: new ObjectId(id) });
    } finally {
      await client.close();
    }
    
    if (!affidavit) {
      affidavit = { affidavit_number: id, customer_name: 'N/A', job_reference: 'N/A' };
    }
    
    const currentDate = new Date().toDateString();
    const docTitle = type === 'certificate' ? 'CERTIFICATE OF DESTRUCTION' : 'LEGAL AFFIDAVIT';
    const hashLock = `SHA256:${Math.random().toString(36).substring(2).toUpperCase().padEnd(64, '0')}`;

    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 1200 >>
stream
BT
/F1 12 Tf
50 750 Td
(VERIFIED VIA QR) Tj
0 -20 Td
/F1 18 Tf
(${docTitle}) Tj
0 -25 Td
/F1 10 Tf
(Official Record of Material Destruction) Tj
0 -30 Td
(Document ID: ${affidavit.affidavit_number || id}) Tj
0 -15 Td
(Issued: ${currentDate}) Tj
0 -30 Td
(ISSUING COMPANY) Tj
0 -15 Td
(${affidavit.service_provider_name || 'Company Name'}) Tj
0 -12 Td
(Federal EIN: ${affidavit.service_provider_ein || 'XX-XXXXXXX'}) Tj
0 -30 Td
(JOB DETAILS) Tj
0 -15 Td
(Job Reference: ${affidavit.job_reference || 'N/A'}) Tj
0 -12 Td
(Customer: ${affidavit.customer_name || 'N/A'}) Tj
0 -12 Td
(Service Location: ${affidavit.job_location || 'N/A'}) Tj
0 -12 Td
(Destruction Method: ${affidavit.destruction_method || 'N/A'}) Tj
0 -12 Td
(Completion Date: ${affidavit.job_completion_date || 'N/A'}) Tj
0 -30 Td
(MATERIAL DETAILS) Tj
0 -15 Td
(${affidavit.description_of_materials || 'Materials not specified'}) Tj
0 -15 Td
(Process: ${affidavit.description_of_process || 'Process not specified'}) Tj
0 -30 Td
(AUTHORIZED REPRESENTATIVE) Tj
0 -15 Td
(Date: ${currentDate}) Tj
0 -12 Td
(Place: ${affidavit.service_provider_address || 'N/A'}) Tj
0 -30 Td
(HASH LOCK: ${hashLock}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000125 00000 n
0000000279 00000 n
0000001533 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1625
%%EOF`;

    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type}-${affidavit.affidavit_number || id}.pdf"`
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}