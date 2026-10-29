import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose';
import { Event } from './event.model';

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedBooking = HydratedDocument<IBooking>;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required.'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email must be a valid email address.'],
    },
  },
  { timestamps: true, strict: 'throw' }
);

// Ensure bookings only reference events that exist before persisting the document.
BookingSchema.pre('save', async function () {
  if (!this.eventId) throw new Error('Event ID is required.');

  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) throw new Error('The referenced event does not exist.');
});

BookingSchema.index({ eventId: 1 });

export const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking> | undefined) ?? mongoose.model<IBooking>('Booking', BookingSchema);
