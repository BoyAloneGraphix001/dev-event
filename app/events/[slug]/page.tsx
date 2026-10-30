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

  return (
    <section id="event">
        <h1>Event Details: <br /> {slug}</h1>
    </section>
  )
}

export default EventDetailsPage