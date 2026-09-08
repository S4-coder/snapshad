<div align="center">

# SnapShad ⚡
### *Keep the moments that move you.*

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn-UI-000000?style=flat-square&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A lightning-fast, sleek, and minimalist HD video downloader built with Next.js App Router and Shadcn UI. Grab content from across the web with zero friction.

</div>

---

## 🌟 1. Overview
**SnapShad** is a high-performance web application engineered to extract, preview, and download HD media content from multiple web platforms. Built using the Next.js App Router paradigm, it leverages server-side route handlers to interact with robust stream extraction engines while providing a minimalist, high-end user interface designed with Tailwind CSS and Shadcn UI primitives.

---

## 🚀 2. Tech Stack
* **Frontend Framework:** Next.js 14+ (App Router, Server Actions, React Server Components)
* **Styling Engine:** Tailwind CSS (Utility-first styling, custom keyframe animations)
* **Component Architecture:** Shadcn UI (Radix UI primitives wrapped with Tailwind)
* **Icons & Visuals:** Lucide React
* **Backend Media Pipeline:** Node.js child-process architecture interfacing with media wrappers for high-speed resolution decoding.

---

## 🏗️ 3. Project Architecture
SnapShad follows a modern full-stack monolithic architecture utilizing Next.js, separating concerns between client-side rendering and server-side execution boundaries.

```text
+-----------------------------------------------------------------+
|                       Client Layer (Browser)                    |
|   Next.js React Pages / Shadcn UI / Tailwind CSS / Lucide Icons |
+-----------------------------------------------------------------+
                                 |
                 HTTP POST (JSON) / Stream Request
                                 v
+-----------------------------------------------------------------+
|                   Next.js API Layer (Server)                    |
|   /api/info (Metadata Extraction) | /api/download (Stream Pipe) |
+-----------------------------------------------------------------+
                                 |
                        Subprocess / Wrapper
                                 v
+-----------------------------------------------------------------+
|                    Media Core & Processing                      |
|                     yt-dlp / Node.js Runtime                    |
+-----------------------------------------------------------------+
```
---

## API Endpoints
Metadata Extraction (POST /api/info)
Request Payload:

#JSON
```{
  "url": "[https://www.youtube.com/watch?v=example](https://www.youtube.com/watch?v=example)"
}
Response Success (200 OK):
```
#JSON
```{
  "success": true,
  "data": {
    "title": "A cinematic walk through the Norwegian fjords",
    "duration": "03:45",
    "thumbnail": "[https://img.youtube.com/vi/example/maxresdefault.jpg](https://img.youtube.com/vi/example/maxresdefault.jpg)",
    "formats": [
      { "resolution": "1080p", "itag": "137", "container": "mp4" },
      { "resolution": "720p", "itag": "22", "container": "mp4" },
      { "resolution": "Audio Only", "itag": "140", "container": "m4a" }
    ]
  }
}
```

----
## Stream Download (POST /api/download)
Request Payload:

JSON
```{
  "url": "[https://www.youtube.com/watch?v=example](https://www.youtube.com/watch?v=example)",
  "itag": "137"
}
```

Response Behavior: Pipes raw video chunks directly to the client with Content-Disposition: attachment headers to trigger instant browser downloads.
---

## Security & Validation
URL Sanitization: Input URLs are strictly parsed via validation schemas to guard against injection vectors.
Transient Storage: Heavy files are never permanently written to server storage; streams are piped dynamically to clear memory footprints.
Error Boundaries: Unified toast alerts notify users cleanly of network drops or restricted resource payloads.

---

## Getting Started Locally
Clone the repository:

```Bash
git clone [https://github.com/S4-coder/snapshad.git](https://github.com/S4-coder/snapshad.git)
cd snapshad
```
Install dependencies:

```Bash
npm install
Run the development server:

Bash
npm run dev
Open http://localhost:3000 in your browser.
```

## Production Build
```Bash
npm run build
npm start
```
<p align="center">
  <sub> This Document Made By <a href="https://read-me-flow.vercel.app">read-me-flow.vercel.app</a></sub>
</p>
