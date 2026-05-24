export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 py-6">
          <p className="text-lg font-semibold tracking-wide">Signature Swings</p>
          <nav aria-label="Placeholder navigation" className="flex gap-5 text-sm text-slate-300">
            <a href="#">Home</a>
            <a href="#starting-point">Shop</a>
            <a href="#starting-point">Contact</a>
          </nav>
        </header>

        <div className="flex-1 py-12 sm:py-16">
          <section className="max-w-2xl py-8 sm:py-12">
            <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
              Custom golf accessories
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Signature Swings</h1>
            <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
              A simple homepage shell for building a premium custom golf accessories experience.
            </p>
          </section>

          <section
            id="starting-point"
            className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-6 sm:p-8"
          >
            <p className="text-sm font-medium text-slate-300">Placeholder section</p>
            <h2 className="mt-2 text-xl font-semibold">Homepage build starting point</h2>
          </section>
        </div>

        <footer className="flex flex-wrap justify-between gap-3 border-t border-slate-800 py-6 text-sm text-slate-400">
          <p>Signature Swings</p>
          <p>Static frontend starter</p>
        </footer>
      </div>
    </main>
  );
}
