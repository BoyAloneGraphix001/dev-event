import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database";

export async function POST(req: NextRequest) {
try {
await connectToDatabase();

    const contentType = req.headers.get('content-type') ?? '';
    let event: Record<string, unknown>;

    if (contentType.includes('application/json')) {
      event = await req.json();
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      event = Object.fromEntries(formData.entries());
    } else {
      throw new Error('Content-Type must be application/json or multipart/form-data.');
    }

    const createdEvent = await Event.create(event);

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

}
