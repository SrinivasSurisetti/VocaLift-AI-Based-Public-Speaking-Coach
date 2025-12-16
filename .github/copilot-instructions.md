<!-- Copilot instructions for working on the VocaLift / AI Speech Evaluator repo -->
# Project Overview

This repository implements a static frontend (multiple HTML pages) and a small backend that runs video/audio analysis to produce speaking-feedback. There are two backend entrypoints present:

- `ai speech evaluator backend/server.js` — Node/Express server that accepts multipart uploads via `multer` and invokes `analyze_video.py` using `exec('python3 analyze_video.py "<path>"')`, expecting JSON on stdout.
- `ai speech evaluator backend/app.py` — a Flask endpoint (`/upload`) which imports `analyze_video.analyze_video()` directly and returns JSON. It saves uploads to `uploads/` and removes file after processing.

Key analysis code lives in `ai speech evaluator backend/analyze_video.py`. It performs CV (OpenCV + MediaPipe) and audio transcription using `whisper` and uses `ffmpeg` (CLI) to extract audio.

# Important Patterns & Conventions

- File uploads are placed into an `uploads/` directory inside the backend folder. Both servers expect that folder to exist (the Node server creates it if missing).
- The Node path expects a CLI-style `analyze_video.py` that writes JSON to stdout. The Flask path imports the `analyze_video` function and uses its return value. These two usages are not identical — check `analyze_video.py` for the current behavior before changing either server.
- Transcription uses `whisper.load_model("medium.en")` inside `analyze_video.py`, so model-download runtime cost and GPU/CPU requirements matter.
- Audio extraction uses `ffmpeg` via subprocess — `ffmpeg` must be installed and available on PATH on the host.

# How to run (discovered from files)

- Node backend (HTTP + calls Python script):

  - cd to `ai speech evaluator backend`
  - `npm install` (if dependencies not installed)
  - `npm start` (runs `node server.js`, listens on port 5000)

- Python/Flask backend (direct import of analysis):

  - Create a Python environment and install required packages (OpenCV, mediapipe, whisper, etc.). `analyze_video.py` imports `cv2`, `mediapipe`, `whisper` and uses `subprocess` for `ffmpeg`.
  - From `ai speech evaluator backend`: `python app.py` runs Flask in debug mode (exposes `/upload`).

Note: There are no test scripts present in `package.json` or Python scripts; run servers directly while developing.

# Common changes you'll make and where to do them

- Changing analysis algorithms: edit `ai speech evaluator backend/analyze_video.py`. If you change the return type or CLI output, update `server.js` or `app.py` accordingly.
- Adding new upload fields or metadata: update `server.js` (multer config) and frontend code that posts form-data (see `index.html` → includes `script.js`).
- To debug runtime errors from the Node path, inspect stdout/stderr logged by `exec()` (see `server.js`), and check whether `analyze_video.py` prints valid JSON.

# Integration & external dependencies (explicitly discovered)

- System: `ffmpeg` CLI is required for audio extraction.
- Python packages: `opencv-python` (`cv2`), `mediapipe`, `whisper` (OpenAI whisper package), plus the usual stdlib packages.
- Node packages in `package.json`: `express`, `multer`, `cors`, `axios`, `form-data`.

# Quick examples (copyable)

- Upload form field name: use `video` (both `server.js` and `app.py` expect `video`).
- Running Node backend:

  cd "ai speech evaluator backend"
  npm start

- Running Flask backend (simple):

  cd "ai speech evaluator backend"
  python app.py

# Gotchas / discovered inconsistencies

- `server.js` assumes `analyze_video.py` is a CLI that prints JSON — but `analyze_video.py` is written primarily as an importable module that returns a Python dict. If you rely on the Node path, ensure `analyze_video.py` also supports printing JSON to stdout when invoked as a script.
- Model loading in `analyze_video.py` may fetch large models at runtime — prefer to document or pre-download models in dev environments.

# Where to look for examples

- Frontend UI: `index.html` (loads `script.js`) — good place to see how users trigger uploads.
- Node server: `ai speech evaluator backend/server.js` — shows the `multer`-based upload + `exec` pattern.
- Python server: `ai speech evaluator backend/app.py` — shows an import-based workflow and cleanup behavior (removes uploaded files).

# When you need clarification

- Ask the maintainer whether the canonical backend is the Node server or the Flask app before doing cross-cutting changes to how `analyze_video.py` communicates results.

---
Please review and tell me if you want me to (a) update `analyze_video.py` to add a CLI JSON output mode, (b) align `server.js` to call the Flask app instead, or (c) add a `README.md` with run and setup steps.
