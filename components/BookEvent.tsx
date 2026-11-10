'use client';

import { createBooking } from "@/lib/actions/booking.actions";
import {useState} from "react";

const BookEvent = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const {} = await createBooking({ eventId: "eventId", email });
        e.preventDefault();

        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    }

  return (
    <div id="book-event">
        {submitted ? (
            <p className="text-sm">Thank you for booking your spot!</p>
        ): (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" id="email" required />
                </div>

                <button type="submit" className="button-submit">Submit</button>
            </form>
        )}
    </div>
  )
}

export default BookEvent