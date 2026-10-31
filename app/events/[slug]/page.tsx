import { notFound } from "next/navigation";
import type { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface EventApiResponse {
    event?: IEvent;
}

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    if (!BASE_URL) {
        throw new Error('NEXT_PUBLIC_BASE_URL is not configured');
    }

    const request = await fetch(`${BASE_URL}/api/events/${encodeURIComponent(slug)}`);

    if (request.status === 404) return notFound();
    if (!request.ok) {
        throw new Error(`Failed to fetch event: ${request.status} ${request.statusText}`);
    }

    const { event } = await request.json() as EventApiResponse;
    if (!event) return notFound();

    const { description, image, overview, date, time, location, mode, agenda, audience, tags } = event;
    if (!description) return notFound();

  return (
    <section id="event">
        <div className="header">
            <h1>Event Description</h1>
            <p className="mt-2">{description}</p>
        </div>

        <div className="details">
            {/* Left Side -Event Content  */}
            
            {/* Right Side -Booking Form  */}
            <aside className="booking">
                <p className="text-lg font-semibold">Book Event</p>
            </aside>
        </div>
    </section>
  )
}

export default EventDetailsPage