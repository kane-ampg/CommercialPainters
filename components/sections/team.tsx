import Image from 'next/image';
import { mediaZoom } from '@/components/ui';
import { initials, teamPhoto, type TeamMember } from '@/content/team';
import { cn } from '@/lib/utils';

/**
 * The team grid.
 *
 * Wrapped and centred rather than a CSS grid, so a short last row sits in the
 * middle instead of hanging off the left edge — with a headcount that is
 * rarely a multiple of the column count, the orphan row is the normal case,
 * not the edge case. The widths reproduce a 2/3/4-column grid with the same
 * gaps, so every card is the same size whichever row it lands on.
 */
export function TeamGrid({ members }: { members: readonly TeamMember[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-4 sm:gap-5">
      {members.map((member) => (
        <li
          key={member.slug}
          className="w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.625rem)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
        >
          <TeamCard member={member} />
        </li>
      ))}
    </ul>
  );
}

/**
 * One person: portrait over a brand-red caption.
 *
 * The caption sits under the photograph, not over it. The portraits are
 * cropped at the collar (see scripts/build-team-images.mjs), so there is no
 * chest left for a gradient to fade across — laid over the frame, the red
 * would tint the face. A hard edge between photo and slab is also the site's
 * own language: square corners, flat colour, no softening.
 */
function TeamCard({ member }: { member: TeamMember }) {
  const photo = teamPhoto(member.slug);

  return (
    <article className="group flex h-full flex-col overflow-hidden bg-brand-600 text-white">
      <div className="relative aspect-[10/9] overflow-hidden bg-ink">
        {photo ? (
          <Image
            src={photo.src}
            alt={`Portrait of ${member.name}`}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 18rem, (min-width: 768px) 30vw, 50vw"
            className={cn('object-cover', mediaZoom)}
          />
        ) : (
          // No portrait yet. The monogram is decoration; the name is in the
          // caption directly below it.
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-display text-5xl text-white/25 sm:text-6xl"
          >
            {initials(member.name)}
          </span>
        )}

        {/* On the photograph's corner rather than in the caption, so a card
            with a profile is the same height as one without and the rows of
            the grid line up. */}
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center bg-ink/60 text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          >
            <LinkedInIcon className="h-4 w-4" />
            <span className="sr-only">{member.name} on LinkedIn</span>
          </a>
        )}
      </div>

      {/* Tall enough for a two-line title, so a short title does not make a
          short card. */}
      <div className="flex min-h-[6.5rem] flex-1 flex-col items-center gap-1 px-3 pb-5 pt-4 text-center">
        <h3 className="font-display text-lg leading-tight sm:text-xl">{member.name}</h3>
        <p className="text-sm font-semibold leading-snug">{member.role}</p>
      </div>
    </article>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}
