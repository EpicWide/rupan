import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Lupin",
  description:
    "Why Lupin exists and why fairness, dignity, and humanity matter in the workplace.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-zinc-950">
      <header className="border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="text-xl font-black tracking-[-0.04em] text-zinc-950"
          >
            Lupin
          </Link>

          <Link
            href="/"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-zinc-100"
          >
            Back to home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
            About Lupin
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.05em] sm:text-6xl">
            Every workplace decision has a human story behind it.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
            Lupin exists to make difficult workplace experiences visible and
            to encourage greater fairness, accountability, and humanity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8 sm:pb-32">
        <article className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.08)] sm:p-12">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-500">
              A Story That Shaped Our Mission
            </p>
          </div>

          <div className="space-y-6 text-[17px] leading-8 text-zinc-700 sm:text-lg">
            <p>
              A manager at a large hotel once told me about an employee who was
              living with multiple sclerosis.
            </p>

            <p>
              As her condition progressed, her movements became slower and
              increasingly difficult to control. Her coworkers began to
              struggle with the practical demands of working alongside her.
              During a visit, the company&apos;s CEO noticed her and asked the
              manager:
            </p>

            <blockquote className="rounded-2xl border-l-4 border-amber-500 bg-amber-50 px-6 py-5 text-xl font-semibold leading-8 text-zinc-900">
              “Who is that employee? Why are you still keeping her?”
            </blockquote>

            <p>
              The manager had considered encouraging her to leave, but he knew
              about her difficult personal circumstances. He felt compassion
              for her and decided that he would continue supporting her.
            </p>

            <p>
              Over time, however, other employees began sending him messages
              saying that working with her had become increasingly difficult
              and that the situation was affecting the entire team.
            </p>

            <p>
              Then the company&apos;s restructuring season approached. The
              manager was told that the employee could potentially be dismissed
              by using another seemingly legitimate reason, possibly allowing
              the company to avoid legal responsibility.
            </p>

            <p>
              He was left with a painful conflict: compassion for one vulnerable
              employee, responsibility for the rest of the team, and pressure
              from senior leadership.
            </p>

            <p className="font-semibold text-zinc-950">
              There was no easy answer. It was not simply a management problem.
              It was a conflict between compassion, fairness, workplace safety,
              dignity, and responsibility.
            </p>
          </div>
        </article>

        <section className="mt-10 rounded-[32px] bg-zinc-950 p-8 text-white sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">
            Our Mission
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Difficult circumstances should never erase a person&apos;s dignity.
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            Disability in the workplace is rarely a simple issue. Behind every
            decision are real people, private struggles, organizational
            pressures, and consequences that can permanently change a life.
          </p>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">
            Lupin was created to help people share what happened, understand
            different perspectives, and promote workplaces built on fairness,
            transparency, accountability, and humanity.
          </p>
        </section>
      </section>
    </main>
  );
}
