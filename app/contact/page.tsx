export default function ContactPage() {
  return (
    <main className="py-12 sm:py-16">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Contact Signature Swings</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          A request form will be connected here in a later phase.
        </p>
      </section>

      <section className="mt-10 max-w-xl rounded-lg border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <h2 className="text-lg font-medium">Contact request placeholder</h2>
        <form className="mt-6 space-y-5" aria-label="Contact request placeholder">
          <label className="block text-sm text-slate-300">
            Name
            <input
              type="text"
              disabled
              className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              disabled
              className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Request details
            <textarea
              disabled
              rows={4}
              className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"
            />
          </label>
          <button type="button" disabled className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-400">
            Submission coming later
          </button>
        </form>
      </section>
    </main>
  );
}
