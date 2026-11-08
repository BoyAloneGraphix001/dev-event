import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

const requiredString = {
  type: String,
  required: true,
  trim: true,
  minlength: 1,
} as const;

const nonEmptyStringArray = {
  type: [String],
  required: true,
  validate: {
    validator: (values: string[]) =>
      Array.isArray(values) && values.length > 0 && values.every((value) => value.trim().length > 0),
    message: 'This field must contain at least one non-empty value.',
  },
};

const EventSchema = new Schema<IEvent>(
  {
    title: requiredString,
    slug: requiredString,
    description: requiredString,
    overview: requiredString,
    image: requiredString,
    venue: requiredString,
    location: requiredString,
    date: requiredString,
    time: requiredString,
    mode: requiredString,
    audience: requiredString,
    agenda: nonEmptyStringArray,
    organizer: requiredString,
    tags: nonEmptyStringArray,
  },
  { timestamps: true, strict: 'throw' }
);

// Generate a lowercase, URL-safe slug; duplicate slugs are prevented by the unique index.
const generateSlug = (title: string): string =>
  title
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeTime = (time: string): string => {
  const value = time.trim();
  const twelveHourMatch = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i.exec(value);
  const twentyFourHourMatch = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]) % 12;
    if (twelveHourMatch[3].toUpperCase() === 'PM') hour += 12;
    return `${String(hour).padStart(2, '0')}:${twelveHourMatch[2]}`;
  }

  if (twentyFourHourMatch) {
    return `${twentyFourHourMatch[1].padStart(2, '0')}:${twentyFourHourMatch[2]}`;
  }

  throw new Error('Time must use HH:MM or HH:MM AM/PM format.');
};

EventSchema.pre('save', async function () {
  if (this.isNew || this.isModified('title')) {
    this.slug = generateSlug(this.title);
    if (!this.slug) throw new Error('Title must produce a valid slug.');
  }

  // Store event dates consistently as UTC ISO strings.
  const parsedDate = new Date(this.date);
  if (Number.isNaN(parsedDate.getTime())) throw new Error('Date must be a valid date.');
  this.date = parsedDate.toISOString();

  this.time = normalizeTime(this.time);
});

EventSchema.index({ slug: 1 }, { unique: true });

export const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent> | undefined) ?? mongoose.model<IEvent>('Event', EventSchema);
