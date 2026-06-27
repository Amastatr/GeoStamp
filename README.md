Part of AI Performance Enhancers by Amastatr Innovation Haus: small Chrome extensions that add the context AI chat interfaces leave out. TimeStamp adds when, GeoStamp adds where, UserStamp adds who. Not a platform, not a fix for your workflow, just standing context supplied on every message. Overview: github.com/Amastatr

# GeoStamp · AI Performance Enhancers

Stamps each sent AI-chat message with your location, at the
precision you choose, including off, which is the default.

`where should we eat` arrives as
`where should we eat [GEO · Pharr, TX]`

Runs locally. The extension records nothing and sends nothing
anywhere.

## Supported sites
ChatGPT (chatgpt.com, chat.openai.com) · Claude (claude.ai) ·
Gemini (gemini.google.com) · Grok (grok.com)

## Install (unpacked)
1. Open chrome://extensions
2. Turn on Developer mode (top right)
3. Click Load unpacked and select the GeoStamp folder

## Modes
Off, the default: nothing ever fires. Manual label: your words,
appended as [GEO · your label]. Auto: browser geolocation at
coarse (~1 km) or fine (~10 m) precision, with your label as the
fallback while the first fix loads. The browser's own permission
prompt is the consent screen; there is no second one.

## Behavior
One stamp per send, never on input mutation, never on an empty
message, never twice on the same message, with a short debounce so
held keys cannot multiply it.

## Honest limits
Composer selectors live at the top of content.js and may need a
one-line update when a site redraws. In Auto mode the first
message after enabling may carry the fallback label; coordinates
are cached for five minutes so the stamp stays synchronous with
the send.

## The Optimizers
One of three sibling extensions, TimeStamp, GeoStamp, and
FileStamp, by Amastatr Innovation Haus, sharing one discipline:
stamps fire once, on send only, and everything stays local.
