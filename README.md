# GeoStamp v0.1.0 — The Optimizers
**Place beside the moment.** Stamps each sent message in Claude, ChatGPT, Gemini, or Grok with a location reading at the precision the writer chooses — including off, which is the default and the doctrine.

## Install (unpacked)
1. chrome://extensions → Developer mode ON → Load unpacked → select this folder.
2. Click the icon, pick a mode. Off by default; nothing ever fires until you choose.

## Modes & precision
- **Off** — the default. Zero behavior.
- **Manual label** — your words ("McAllen, TX"), appended as ` [GEO · McAllen, TX]`.
- **Auto** — browser geolocation, coarse (~1 km) or fine (~10 m), with the manual label as synchronous fallback while the first fix loads. Auto prompts each site once for permission.

## The send-only law (the TimeStamp lesson, 2026-06-09)
Stamps fire **once, on send intent only** — Enter-without-Shift inside the composer, or pointerdown on a send button — with a 1.2 s debounce, an empty-message guard, and a double-stamp guard. Never on input mutation, never per voice-transcription chunk. The 24-stamp message of June 9 is the failure mode this architecture exists to prevent. **timestamp-extension should adopt this same sendGuard pattern.**

## Honest limits
- Site composers change; the selector lists at the top of `content.js` are the only maintenance surface. Verified against the included harness; check live sites on install (David's first task).
- Auto mode reads a 5-minute cache so the stamp stays synchronous with the send; the first message after enabling Auto may carry the fallback label.

## Naming note
The Haus page currently says **LocationStamp**; tonight's word was **GeoStamp**. Pick one; the page swap is a one-minute edit either way.

Built 2026-06-09, McAllen/RGV · Amastatr Innovation Haus · two brothers.

## v0.2.0 (2026-06-11)
- Badge reads ON (crimson) whenever mode is not off.
- Double-stamp guard hardened: any trailing [GEO · ...] blocks a
  second stamp, even after auto coordinates drift.

## v1.0.0 (2026-06-12)
- Three modes: **Off** (default) · **Named place** · **Device location**.
- Named place keeps up to six saved presets; one tap switches the live label, the active one highlighted. Stamp: `[GEO · <label>]`.
- Device location reads `navigator.geolocation` as the browser provides it — the browser's own site-permission prompt is the only consent. Precision is **Approximate** (2 decimals) or **Precise** (4 decimals). The popup shows permission state (granted / denied / not asked); when denied it says to allow location for the site in the browser bar.
- Optional **Resolve to city** (off by default) turns coordinates into a city name, cached 10 minutes, falling back to coordinates or the active named place on failure.
- The 5-minute coordinate cache stays, so the stamp is synchronous with send.

## Honest limits
- **Resolve to city** sends the device coordinates to **BigDataCloud** (`api.bigdatacloud.net` reverse-geocode-client) — a free, no-key, client-side endpoint. It is off by default; leave it off to send coordinates nowhere. The toggle names the service in the popup.
- Reverse geocoding and the first auto fix are asynchronous; the first message after enabling either may carry the fallback (coords or named place) until the cache fills.
- Site composers change; the selector lists at the top of `content.js` are the only maintenance surface. Check live sites on install.
