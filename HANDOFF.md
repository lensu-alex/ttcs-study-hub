# Handoff

**State:** TTCS study hub, live on GitHub Pages (https://lensu-alex.github.io/ttcs-study-hub/). Lectures 1–11 covered.

**Last change (2026-11-25):** added a Podcast tab: 11 episodes (one per lecture, intro folded into ep 1), ~13 min each,
two Kokoro voices (Alex explains, Sam asks). Scripts in `podcast/scripts/`, mp3s in `podcast/audio/` (65 MB, committed
so Pages serves them), `tools/podcast.py` renders them and writes `data/podcast.js`. Assets at `?v=7`.

**Next:** when a new lecture arrives, follow README.txt (PDF → build.py → notes, glossary, quiz, commands,
theory cards and a podcast episode), bump `?v=N`, commit and push.

**Machine-specific:** `pdfs/` (original course PDFs) exists only on the Mac, at `~/Desktop/TTCS-Course/pdfs`, and is
gitignored; never commit it. Rebuilding slide images needs those PDFs and a `.venv` with PyMuPDF.

Rendering audio needs the Mac (Apple Silicon, mlx-audio): venv `.venv-tts` per README.txt, plus ffmpeg (installed via brew).
