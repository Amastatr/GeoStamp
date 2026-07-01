# Privacy

GeoStamp runs entirely in your browser.

- In **Auto** mode it requests geolocation only through the browser's own
  permission prompt. There is no second prompt and no separate account.
- Coordinates are cached locally for about five minutes so a stamp can be
  appended synchronously with your send. They are never transmitted.
- The only data stored is your own settings and label, kept in
  `chrome.storage.local` on your machine.
- There are no analytics and no telemetry.

## Optional: Resolve to city

Auto mode includes one **off-by-default** toggle, "Resolve to city." When you
turn it on, and only then, GeoStamp sends the current coordinates to
BigDataCloud's reverse-geocoding endpoint to turn them into a place name. This
is the extension's single outbound network request, it happens solely because
you enabled it, and it is disabled in every default and Off configuration. Leave
it off and nothing ever leaves your browser.
