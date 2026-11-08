import ExploreBtn from '../components/ExploreBtn';
import EventCard from '@/components/EventCard';
import { cacheLife } from 'next/cache';
import { Event } from '@/database';
import { connectToDatabase } from '@/lib/mongodb';

const page = async () => {
  'use cache';
  cacheLife('hours')

  await connectToDatabase();
  const eventDocuments = await Event.find().sort({ createdAt: -1 }).lean();
  const events = eventDocuments.map((event) => ({
    title: String(event.title),
    image: String(event.image),
    slug: String(event.slug),
    location: String(event.location),
    date: String(event.date),
    time: String(event.time),
  }));

  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br /> Event you Can&apos;t Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and conference, All in one place.</p>
      <ExploreBtn />

      <div className='mt-20 space-y-7'>
        <h3>Featured Events</h3>

        <ul className='events'>
          {events.length > 0 && events.map((event) => (
            <li key={event.title}>
              <EventCard {...event}/>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default page