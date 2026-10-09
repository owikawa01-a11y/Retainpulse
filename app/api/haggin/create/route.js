import { NextResponse } from 'next/server';
import { createAndPublishHaggin } from '@/lib/haggin';

export async function POST(req) {
  try {
    const body = await req.json();
    const { customerName, customerEmail } = body;

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'customerName and customerEmail are required' },
        { status: 400 }
      );
    }

    // Basic validation — customerEmail must look like an email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid customerEmail' },
        { status: 400 }
      );
    }

    const haggin = await createAndPublishHaggin({
      customerName: String(customerName).slice(0, 100),
      customerEmail,
    });

    return NextResponse.json({
      success: true,
      hagginId: haggin.id,
      publicUrl: haggin.public_url,
    });
  } catch (error) {
    console.error('[Haggin Create Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Haggin' },
      { status: 500 }
    );
  }
}