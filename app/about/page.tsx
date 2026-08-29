export const metadata = { title: "About | Shahnameh Tales" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[var(--color-ivory)]">
        About this project
      </h1>

      <div className="mt-8 flex flex-col gap-5 font-[family-name:var(--font-body)] text-lg leading-relaxed text-[var(--color-ivory)]/85">
        <p>
          The Shahnameh — the &ldquo;Book of Kings&rdquo; — is one of the
          world&rsquo;s longest epic poems, written by the Persian poet
          Ferdowsi over a thousand years ago. It tells the mythical and
          historical story of Persia from the creation of the world to the
          Arab conquest, through the lives of its kings, heroes, and
          monsters.
        </p>
        <p>
          This project retells those stories in English, episode by episode,
          for readers who want to experience the Shahnameh the way it was
          meant to be heard: one tale at a time, building toward something
          much larger.
        </p>
        <p>
          Each saga is broken into episodes so you can follow along at your
          own pace. Create an account to like your favorite moments, discuss
          them in the comments, and track which sagas you&rsquo;ve read.
        </p>
      </div>

      <div className="manuscript-divider my-14">
        <span className="lozenge" aria-hidden="true" />
      </div>

      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ivory)]">
        Why episodic?
      </h2>
      <p className="mt-4 font-[family-name:var(--font-body)] text-lg leading-relaxed text-[var(--color-ivory)]/85">
        The original Shahnameh was composed and performed in parts. Breaking
        the retelling into episodes keeps that spirit alive — each one a
        complete moment in a much longer story, meant to be read, discussed,
        and returned to.
      </p>
    </div>
  );
}
