import { notFound } from "next/navigation";
import type { IEvent } from "@/database";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import { cacheLife } from "next/cache";
import { Event } from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string; }) => {
    return (
        <div className="flex-row-gap-2 items-center">
            <Image src={icon} alt={alt} width={17} height={17} />
            <p>{label}</p>
        </div>
    );
};

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
            {tags.map((tag) => (
                <div className="pill" key={tag}>{tag}</div>
            ))}
    </div>
);

const normalizeStringArray = (values: string[]): string[] =>
    values.flatMap((value) => {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed)
                ? parsed.filter((item): item is string => typeof item === 'string')
                : [value];
        } catch {
            return [value];
        }
    });

export async function generateStaticParams() {
    await connectToDatabase();
    const events = await Event.find().select('slug').lean();
    return events.map((event) => ({ slug: String(event.slug) }));
}

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    'use cache';
    cacheLife('hours');

    const { slug } = await params;
    await connectToDatabase();
    const eventDocument = await Event.findOne({ slug }).lean();
    if (!eventDocument) return notFound();

    const event = {
        ...eventDocument,
        title: String(eventDocument.title),
        slug: String(eventDocument.slug),
        description: String(eventDocument.description),
        overview: String(eventDocument.overview),
        image: String(eventDocument.image),
        venue: String(eventDocument.venue),
        location: String(eventDocument.location),
        date: String(eventDocument.date),
        time: String(eventDocument.time),
        mode: String(eventDocument.mode),
        audience: String(eventDocument.audience),
        organizer: String(eventDocument.organizer),
        agenda: eventDocument.agenda.map(String),
        tags: eventDocument.tags.map(String),
    } as IEvent;

    if (!event) return notFound();

    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;
    if (!description) return notFound();

    const bookings = 10;

    const similarEvents = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
        <div className="header">
            <h1>Event Description</h1>
            <p>{description}</p>
        </div>

        <div className="details">
            {/* Left Side -Event Content  */}
            <div className="content">
                <Image src={image} alt="Event Banner" width={800} height={800} className="banner"/>

                <section className="flex-col-gap-2">
                    <h2>Overview</h2>
                    <p>{overview}</p>
                </section>
                <section className="flex-col-gap-2">
                    <h2>Event Details</h2>
                    <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                    <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                    <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                    <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                    <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                </section>

                <EventAgenda agendaItems={normalizeStringArray(agenda)} />

                <section className="flex-col-gap-2">
                    <h2>About the Organizer</h2>
                    <p>{organizer}</p>
                </section>

                <EventTags tags={normalizeStringArray(tags)} />

            </div>
            {/* Right Side -Booking Form  */}
            <aside className="booking">
                <div className="signup-card">
                    <h2>Book your spot</h2>
                    {bookings > 0 ? (
                        <p className="text-sm">
                            Join {bookings} people who have already book their spot for this event!
                        </p>
                    ): (
                        <p className="text-sm">
                            Be their first to book your spot!
                        </p>
                    )}
                    <BookEvent />
                </div>
            </aside>
        </div>

        <div className="flex w-full flex-col gap-4 pt-20">
            <h2>Similar Events</h2>
            <div className="events">
                {similarEvents.length > 0 && similarEvents.map((similarEvent) => (
                    <EventCard {...similarEvent} key={similarEvent.slug} />
                ))}
            </div>
        </div>

    </section>
  )
}

export default EventDetailsPage