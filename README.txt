TTCS Study Hub
==============

Open index.html (double-click). Everything runs locally, no internet needed.
Progress (slides viewed, quiz scores, known flashcards) is kept in this browser only.

Folders
  pdfs/     the original course PDFs from SharePoint (Class folder); kept on this laptop only,
            not in the GitHub copy. The Original PDF button only shows when opened from disk.
  slides/   every page rendered as an image, thumbs/ the small previews
  data/     slides.js (titles + searchable text, generated)
            notes-1.js … notes-4.js (the explanation shown next to each slide, written by hand)
            glossary.js (acronyms and Unix names; found in each slide's text automatically)
            quiz-1.js, quiz-2.js (questions; the first option is the correct one)
            commands.js (cheat sheet = flashcard deck)
  assets/   app.js, app.css
  tools/    build.py, regenerates slides/, thumbs/ and data/slides.js

Adding a new lecture
  1. Put the PDF in pdfs/ (e.g. course12.pdf).
  2. Add an entry for it to the DOCS list at the top of tools/build.py.
  3. Run:  python3 -m venv .venv && .venv/bin/pip install pymupdf
           .venv/bin/python tools/build.py .
  4. Optional: add a "c12" block of questions to data/quiz-2.js and rows to data/commands.js.
  5. Explanations: add a "c12" block to a data/notes-*.js file, one entry per slide number
     (format at the top of notes-1.js). New acronyms go in data/glossary.js; they then show up
     next to every slide that uses them, in the Glossary page and in search.

In the slide viewer: E shows or hides the explanation, T the thumbnails, F is full screen.
