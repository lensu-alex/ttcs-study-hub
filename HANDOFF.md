# Handoff

**State:** TTCS study hub, live on GitHub Pages (https://lensu-alex.github.io/ttcs-study-hub/). Lectures 1–11 covered.

**Last change (2026-11-25):** added a theory flashcard deck, `data/theory.js` (253 question → short answer cards,
18–32 per lecture, each linked to its slide). The Flashcards page has a deck picker: Theory questions (default),
Commands/files/numbers, or Both. Assets are at `?v=6` in `index.html`.

**Next:** when a new lecture arrives, follow README.txt (PDF → build.py → notes, glossary, quiz, commands
and theory cards), bump `?v=N`, commit and push.

**Machine-specific:** `pdfs/` (original course PDFs) exists only on the Mac, at `~/Desktop/TTCS-Course/pdfs`, and is
gitignored; never commit it. Rebuilding slide images needs those PDFs and a `.venv` with PyMuPDF.
