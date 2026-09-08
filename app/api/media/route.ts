import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import youtubeDl from "youtube-dl-exec";

export const runtime = "nodejs";

const extractorHosts = [
  "youtube.com",
  "youtu.be",
  "instagram.com",
  "tiktok.com",
  "vimeo.com",
];

const extractor = (
  youtubeDl as unknown as {
    create: (binaryPath: string) => typeof youtubeDl;
  }
).create(
  path.join(
    process.cwd(),
    "node_modules",
    "youtube-dl-exec",
    "bin",
    process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
  ),
);

function getSourceUrl(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("url");
  if (!value) return null;

  try {
    const source = new URL(value);
    if (source.protocol !== "http:" && source.protocol !== "https:") {
      return null;
    }
    return source;
  } catch {
    return null;
  }
}

async function inspectSource(source: URL) {
  const response = await fetch(source, {
    method: "HEAD",
    redirect: "follow",
    headers: { "User-Agent": "SnapShad/1.0" },
  });
  const contentType = response.headers.get("content-type") ?? "";
  return { response, contentType };
}

function usesExtractor(source: URL) {
  return extractorHosts.some(
    (host) => source.hostname === host || source.hostname.endsWith(`.${host}`),
  );
}

async function resolveExtractorUrl(source: URL) {
  const extracted = await extractor(source.toString(), {
    getUrl: true,
    format: "best[ext=mp4]/best",
    noPlaylist: true,
    noWarnings: true,
  });
  const mediaUrl = String(extracted).trim().split(/\r?\n/).pop();
  if (!mediaUrl?.startsWith("http")) {
    throw new Error("No playable media URL found.");
  }
  return mediaUrl;
}

export async function HEAD(request: NextRequest) {
  const source = getSourceUrl(request);
  if (!source) {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }

  try {
    if (usesExtractor(source)) {
      await resolveExtractorUrl(source);
      return new NextResponse(null, {
        status: 200,
        headers: { "Content-Type": "video/mp4" },
      });
    }
    const { response, contentType } = await inspectSource(source);
    if (response && (!response.ok || !contentType.startsWith("video/"))) {
      return NextResponse.json(
        { error: "This link is not a direct video file. Paste an MP4, WebM, or MOV file URL." },
        { status: 415 },
      );
    }

    return new NextResponse(null, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Media HEAD validation failed", error);
    return NextResponse.json(
      { error: "The video link could not be reached." },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  const source = getSourceUrl(request);
  if (!source) {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }

  try {
    if (usesExtractor(source)) {
      const extractorUrl = await resolveExtractorUrl(source);
      const mediaUrl = new URL(extractorUrl);
      const mediaResponse = await fetch(mediaUrl, {
        redirect: "follow",
        headers: { "User-Agent": "SnapShad/1.0" },
      });
      if (!mediaResponse.ok || !mediaResponse.body) {
        return NextResponse.json({ error: "The video could not be loaded." }, { status: 502 });
      }
      const headers = new Headers({
        "Content-Type": "video/mp4",
        "Cache-Control": "no-store",
      });
      if (request.nextUrl.searchParams.get("download") === "1") {
        headers.set("Content-Disposition", 'attachment; filename="snapshad-video.mp4"');
      }
      const length = mediaResponse.headers.get("content-length");
      if (length) headers.set("Content-Length", length);
      return new NextResponse(mediaResponse.body, { status: 200, headers });
    }

    const extractorUrl = usesExtractor(source)
      ? await resolveExtractorUrl(source)
      : source.toString();
    const mediaUrl = new URL(extractorUrl);
    const { response, contentType } = usesExtractor(source)
      ? { response: null, contentType: "video/mp4" }
      : await inspectSource(mediaUrl);
    if (response && (!response.ok || !contentType.startsWith("video/"))) {
      return NextResponse.json(
        { error: "This link is not a direct video file." },
        { status: 415 },
      );
    }

    const mediaResponse = await fetch(mediaUrl, {
      redirect: "follow",
      headers: { "User-Agent": "SnapShad/1.0" },
    });
    if (!mediaResponse.ok || !mediaResponse.body) {
      return NextResponse.json({ error: "The video download failed." }, { status: 502 });
    }

    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    if (request.nextUrl.searchParams.get("download") === "1") {
      headers.set("Content-Disposition", 'attachment; filename="snapshad-video.mp4"');
    }
    const length = mediaResponse.headers.get("content-length");
    if (length) headers.set("Content-Length", length);

    return new NextResponse(mediaResponse.body, { status: 200, headers });
  } catch (error) {
    console.error("Media download failed", error);
    return NextResponse.json({ error: "The video download failed." }, { status: 502 });
  }
}
