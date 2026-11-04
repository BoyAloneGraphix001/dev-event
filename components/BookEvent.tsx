'use client';

import {useState} from "react";

const BookEvent = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);


  return (
    <div id="book-event">
        {submitted ? (
            <p className="text-sm">Thank you for booking your spot!</p>
        ): (
            <form>
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