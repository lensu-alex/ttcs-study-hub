# Handoff

**State:** TTCS study hub, live on GitHub Pages (https://lensu-alex.github.io/ttcs-study-hub/). Lectures 1–11 covered.

**Last change (2026-11-26):** Flashcards keep your place: each selection (deck + lectures + hide-known) stores its
shuffled order and position in `cards.sessions` (last 12 kept), so leaving or reloading resumes on the same card;
"Shuffle, start over" restarts. New "Your progress" box at the bottom of Flashcards saves all `ttcs.*` localStorage
to a .json file and loads it on another device (known cards from both devices are merged). Assets at `?v=9`.
Earlier the same day: lecture chips (All, 1–11) in `cards.lecs`. Podcast tab unchanged.

**Next:** when a new lecture arrives, follow README.txt (PDF → build.py → notes, glossary, quiz, commands,
theory cards and a podcast episode), bump `?v=N`, commit and push.

**Machine-specific:** `pdfs/` (original course PDFs) exists only on the Mac, at `~/Desktop/TTCS-Course/pdfs`, and is
gitignored; never commit it. Rebuilding slide images needs those PDFs and a `.venv` with PyMuPDF.

Rendering audio needs the Mac (Apple Silicon, mlx-audio): venv `.venv-tts` per README.txt, plus ffmpeg (installed via brew).
