export default function ContactPage() {
  return (
    <main className="page">
      <section className="page-header">
        <h1>Contact Signature Swings</h1>
        <p className="page-intro">
          A request form will be connected here in a later phase.
        </p>
      </section>

      <section className="form-card">
        <h2>Contact request placeholder</h2>
        <form className="form-grid" aria-label="Contact request placeholder">
          <label className="field">
            Name
            <input
              type="text"
              disabled
              className="field-input"
            />
          </label>
          <label className="field">
            Email
            <input
              type="email"
              disabled
              className="field-input"
            />
          </label>
          <label className="field">
            Request details
            <textarea disabled rows={4} className="field-input" />
          </label>
          <button type="button" disabled className="button button-muted">
            Submission coming later
          </button>
        </form>
      </section>
    </main>
  );
}
