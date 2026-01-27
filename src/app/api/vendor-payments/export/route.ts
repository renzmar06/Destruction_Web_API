import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: payments } = body;

    if (!payments || !Array.isArray(payments)) {
      return NextResponse.json({ error: 'Invalid payments data' }, { status: 400 });
    }

    const csvHeaders = [
      'Payment ID',
      'Vendor Name',
      'Amount',
      'Payment Date',
      'Payment Method',
      'Reference Number',
      'Status',
      'Description'
    ];

    const csvRows = payments.map(payment => [
      payment.id || '',
      payment.vendor_name || '',
      payment.amount || '0',
      payment.payment_date || '',
      payment.payment_method || '',
      payment.reference_number || '',
      payment.status || '',
      payment.description || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="vendor-payments-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}