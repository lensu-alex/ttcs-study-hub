# Handoff

**State:** TTCS study hub, live on GitHub Pages (https://lensu-alex.github.io/ttcs-study-hub/). Lectures 1–11 covered.

**Last change (2026-11-26):** Flashcards can now mix lectures: the lecture dropdown became a row of toggle chips
(All, 1–11); pick any combination, stored as `cards.lecs` in localStorage (old single `cards.lec` is migrated).
Assets at `?v=8`. Podcast tab (2026-11-25) unchanged: scripts in `podcast/scripts/`, mp3s in `podcast/audio/`,
`tools/podcast.py` renders them.

**Next:** when a new lecture arrives, follow README.txt (PDF → build.py → notes, glossary, quiz, commands,
theory cards and a podcast episode), bump `?v=N`, commit and push.

**Machine-specific:** `pdfs/` (original course PDFs) exists only on the Mac, at `~/Desktop/TTCS-Course/pdfs`, and is
gitignored; never commit it. Rebuilding slide images needs those PDFs and a `.venv` with PyMuPDF.

Rendering audio needs the Mac (Apple Silicon, mlx-audio): venv `.venv-tts` per README.txt, plus ffmpeg (installed via brew).
