"use client";

import { FormEvent, useEffect, useState } from "react";

type Quality = { label: string; detail: string; type: "video" | "audio" };
type HistoryItem = { title: string; quality: string; date: string };

const qualities: Quality[] = [
  { label: "1080p", detail: "Full HD · MP4", type: "video" },
  { label: "720p", detail: "HD · MP4", type: "video" },
  { label: "480p", detail: "SD · MP4", type: "video" },
  { label: "MP3", detail: "Audio only · 320kbps", type: "audio" },
];

const floatingPlatforms = [
  { label: "Instagram", href: "https://www.instagram.com/sabeelcodes/", tone: "pink" },
  { label: "TikTok", href: "https://www.tiktok.com/", tone: "cyan" },
];

type Video = {
  title: string;
  duration: string;
  channel: string;
  views: string;
  source: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [video, setVideo] = useState<Video | null>(null);
  const [selected, setSelected] = useState("1080p");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("snapshad-history");
    if (saved) window.setTimeout(() => setHistory(JSON.parse(saved)), 0);
  }, []);

  function submitUrl(event: FormEvent) {
    event.preventDefault();
    if (!url.trim() || !/^https?:\/\//i.test(url)) {
      setNotice("Paste a complete video URL to continue.");
      return;
    }
    const source = url.trim();
    setNotice("");
    setLoading(false);
    setVideo({
      title: new URL(source).hostname,
      duration: "Ready to play",
      channel: "Direct video URL",
      views: source,
      source: `/api/media?url=${encodeURIComponent(source)}`,
    });
  }

  async function download() {
    if (!video) return;
    setDownloading(true);
    setProgress(10);
    try {
      const response = await fetch(`${video.source}&download=1`);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `snapshad-${selected.toLowerCase()}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
      setProgress(100);
      const next = [
        { title: video.title, quality: selected, date: "Just now" },
        ...history.filter((item) => item.title !== video.title),
      ].slice(0, 3);
      setHistory(next);
      window.localStorage.setItem("snapshad-history", JSON.stringify(next));
      setNotice("Download started. Check your browser downloads.");
    } catch {
      setNotice("Download could not start. Check your connection and try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="shell">
      <div className="grain" />
      <nav className="nav wrap">
        <a className="brand" href="#top" aria-label="SabeelCodes home">
          <span className="brand-mark">S</span>
          <span>Snapshad</span>
        </a>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#recent">Recent</a>
        </div>
      </nav>
      <section className="hero wrap" id="top">
        <div className="eyebrow">
          <span className="pulse" /> Fast, free & private
        </div>
        <h1>
          Keep the moments
          <br />
          <em>that move you.</em>
        </h1>
        <p className="hero-copy">
          Save videos from across the web in HD quality.
          <br className="desktop" /> No sign-up. No noise. Just the good stuff.
        </p>
        <div className="hero-badges" aria-label="Supported platforms">
          {floatingPlatforms.map((platform) => (
            <a
              key={platform.label}
              href={platform.href}
              target="_blank"
              rel="noreferrer"
              className={`floating-badge ${platform.tone}`}
            >
              <span>{platform.label.slice(0, 2).toUpperCase()}</span>
              {platform.label}
            </a>
          ))}
        </div>
        <form className="url-form" onSubmit={submitUrl}>
          <span className="link-icon">↗</span>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a video link here..."
            aria-label="Video URL"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Fetching..." : "Get video  →"}
          </button>
        </form>
        <div className="supported">
          <span>Direct video links</span>
          <b>Instagram</b>
          <b>TikTok</b>
          <b>Vimeo</b>
        </div>
        {notice && <div className="notice">{notice}</div>}
      </section>
      <section className="content wrap">
        {loading && (
          <div className="preview-card loading-card">
            <div className="skeleton image-skeleton" />
            <div className="skeleton line-skeleton" />
            <div className="skeleton small-skeleton" />
          </div>
        )}
        {video && !loading && (
          <div className="preview-card">
            <div className="preview-media">
              <video
                controls
                preload="metadata"
                src={video.source}
                aria-label={video.title}
                onError={() =>
                  setNotice("This link could not be played. Try another public video link.")
                }
              />
              <span className="duration">{video.duration}</span>
            </div>
            <div className="preview-info">
              <div className="video-meta">
                <span>VIDEO FOUND</span>
                <span className="dot">•</span>
                <span>
                  {video.channel} · {video.views}
                </span>
              </div>
              <h2>{video.title}</h2>
              <p className="quality-label">Choose your quality</p>
              <div className="quality-grid">
                {qualities.map((quality) => (
                  <button
                    key={quality.label}
                    className={
                      selected === quality.label ? "quality active" : "quality"
                    }
                    type="button"
                    onClick={() => setSelected(quality.label)}
                  >
                    <strong>
                      {quality.type === "audio" ? "♫" : "▧"} {quality.label}
                    </strong>
                    <small>{quality.detail}</small>
                    {selected === quality.label && <i>✓</i>}
                  </button>
                ))}
              </div>
              <button
                className="download"
                type="button"
                onClick={download}
                disabled={downloading}
              >
                {downloading
                  ? `Preparing ${progress}%`
                  : `Download ${selected}  ↓`}
              </button>
              {downloading && (
                <div className="progress">
                  <span style={{ width: `${progress}%` }} />
                </div>
              )}
              <p className="safe-note">
                ⌁ Secure processing · Files are never stored
              </p>
            </div>
          </div>
        )}
        <div className="below-grid" id="how-it-works">
          <div className="steps">
            <p className="section-kicker">THREE STEPS, ZERO FUSS</p>
            <h2>
              From link to <em>keepsake.</em>
            </h2>
            <div className="step-list">
              <div>
                <span>01</span>
                <b>Paste your link</b>
                <p>Drop in a direct link to a video file.</p>
              </div>
              <div>
                <span>02</span>
                <b>Pick your quality</b>
                <p>Choose the format that fits your moment.</p>
              </div>
              <div>
                <span>03</span>
                <b>Download & enjoy</b>
                <p>One click and it&apos;s yours. Simple as that.</p>
              </div>
            </div>
          </div>
          <aside className="recent" id="recent">
            <div className="recent-heading">
              <p className="section-kicker">YOUR ARCHIVE</p>
              <span>⌘ local only</span>
            </div>
            <h2>
              Recent <em>downloads.</em>
            </h2>
            {history.length === 0 ? (
              <div className="empty-history">
                <span>◌</span>
                <p>
                  Your downloaded videos
                  <br />
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div className="history-item" key={item.title}>
                    <span>▶</span>
                    <div>
                      <b>{item.title}</b>
                      <small>
                        {item.quality} · {item.date}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
      <footer className="footer wrap">
        <div className="footer-brand">
          <span>© 2025 Sabeel Ahmed</span>
        </div>
        <div className="footer-socials" aria-label="Social links">
          <a href="https://www.instagram.com/sabeelcodes/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://www.youtube.com/@sabeelcodes" target="_blank" rel="noreferrer">
            YouTube
          </a>
          <a href="https://github.com/S4-coder" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <span>
          Privacy first <b>●</b>
        </span>
      </footer>
    </main>
  );
}
