'use client';

import Image from 'next/image';
import posthog from 'posthog-js';
import { posthogLogger } from '@/lib/posthog-logger';

const ExploreBtn = () => {
  const handleExploreEvents = () => {
    posthog.capture('events_explored');
    posthogLogger.info('event_exploration_requested', { surface: 'homepage' });
  };

  return (
    <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={handleExploreEvents}>
        <a href="#events">
            Explore Events
            <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
        </a>
    </button>
  )
}

export default ExploreBtn