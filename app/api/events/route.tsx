import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database";

export async function POST(req: NextRequest) {
try {
await connectToDatabase();

    const contentType = req.headers.get('content-type') ?? '';
    let event: Record<string, unknown>;
    let file: Blob | null = null;

    if (contentType.includes('application/json')) {
      event = await req.json();
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      event = Object.fromEntries(
        [...formData.entries()].filter(([key]) => key !== 'image')
      );
      const image = formData.get('image');
      if (typeof image === 'object' && image !== null && typeof image !== 'string') {
        file = image;
      }

    } else {
      throw new Error('Content-Type must be application/json or multipart/form-data.');

    }

    const tags = typeof event.tags === 'string' ? JSON.parse(event.tags) : event.tags;
    const agenda = typeof event.agenda === 'string' ? JSON.parse(event.agenda) : event.agenda;

    if(!file) return NextResponse.json({ message: 'Image file is required' }, { status: 400 })

    const arrayBuffer =
      typeof file.arrayBuffer === 'function'
        ? await file.arrayBuffer()
        : await new Response(file).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'dev-event' }, (error, results) => {
            if(error) return reject(error);
            resolve(results);
        }).end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create({...event, tags:tags, agenda: [agenda]});

    return NextResponse.json(
        {
            message: "Event created successfully",
            event: createdEvent
        },
        { status: 201 }
    );

} catch (error) {
    console.error(error);

    return NextResponse.json(
        {
            message: "Event creation failed",
            error: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 400 }
    );
}

};

export async function GET() {
    try{
        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 })
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
};
