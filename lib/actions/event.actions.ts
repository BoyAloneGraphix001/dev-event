'use server';

import { Event } from "@/database/event.model";
import { connectToDatabase } from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
    try{
        await connectToDatabase();

        const event = await Event.findOne({ slug });
        const similarEvents = await Event.find({
            _id: { $ne: event?._id },
            tags: { $in: event?.tags },
        })
            .select('title image slug location date time')
            .lean();

        return similarEvents.map((similarEvent) => ({
            title: String(similarEvent.title),
            image: String(similarEvent.image),
            slug: String(similarEvent.slug),
            location: String(similarEvent.location),
            date: String(similarEvent.date),
            time: String(similarEvent.time),
        }));
    } catch{
        return [];
    }
};