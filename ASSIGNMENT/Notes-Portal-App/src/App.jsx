import React, { useState } from "react";
import "./App.css";

const notes = [
  {
    name: "FSD",
    description: "Full Stack Development",
    filename: "FSD-Notes.pdf",
  },
  {
    name: "React",
    description: "React Development",
    filename: "React-Notes.pdf",
  },
  {
    name: "JavaScript",
    description: "JavaScript Fundamentals",
    filename: "JavaScript-Notes.pdf",
  },
];

function App() {
  const [search, setSearch] = useState("");
  const visibleNotes = notes.filter((note) =>
    `${note.name} ${note.description}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <main className="portal">
      <header className="hero">
        <p className="eyebrow">STUDENT RESOURCE LIBRARY</p>
        <h1>Notes Portal</h1>
        <p className="hero-subtitle">
          Your study material, organized in one place.
        </p>
      </header>

      <div className="content">
        <label className="search-box">
          <svg
            aria-hidden="true"
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 5 5" />
          </svg>
          <input
            type="search"
            aria-label="Search notes"
            placeholder="Search notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <section className="notes-section" aria-labelledby="notes-heading">
          <div className="section-heading">
            <div>
              <h2 id="notes-heading">Available Notes</h2>
              <p>Download your subject notes as PDF files.</p>
            </div>
          </div>

          {visibleNotes.length > 0 ? (
            <div className="notes-list">
              {visibleNotes.map((note) => (
                <article className="note" key={note.name}>
                  <div className="note-topline">
                    <span className="document-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M6.5 3.75h7l4 4v12.5H6.5z" />
                        <path d="M13.5 3.75v4h4M9 12h6M9 15.5h6" />
                      </svg>
                    </span>
                    <span className="pdf-label">PDF NOTES</span>
                  </div>

                  <div className="note-copy">
                    <h3>{note.name}</h3>
                    <p>{note.description}</p>
                  </div>

                  <div className="note-footer">
                    <span className="file-type">PDF document</span>
                    <div className="note-actions">
                      <a
                        className="action-link secondary-action"
                        href={`/notes/${note.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open PDF
                      </a>
                      <a
                        className="action-link primary-action"
                        href={`/notes/${note.filename}`}
                        download={note.filename}
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No notes match your search.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
