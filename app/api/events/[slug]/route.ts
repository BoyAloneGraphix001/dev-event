import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { Event } from '@/database';
import { connectToDatabase } from '@/lib/mongodb';

interface RouteContext {
  params: Promise<{ slug?: string }>;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const normalizedSlug = slug?.trim().toLowerCase();

    // Reject missing, malformed, or excessively long slugs before querying MongoDB.
    if (!normalizedSlug || normalizedSlug.length > 200) {
      return NextResponse.json(
        { message: 'A valid event slug is required.' },
        { status: 400 }
      );
    }

    if (!SLUG_PATTERN.test(normalizedSlug)) {
      return NextResponse.json(
        { message: 'Invalid event slug.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.findOne({ slug: normalizedSlug }).lean();
    if (!event) {
      return NextResponse.json(
        { message: 'Event not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Event fetched successfully', event },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { message: 'Invalid event data.', error: error.message },
        { status: 400 }
      );
    }

    console.error('Failed to fetch event:', error);
    return NextResponse.json(
      { message: 'Event fetching failed.' },
      { status: 500 }
    );
  }
}
