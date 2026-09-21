#!/usr/bin/env bash
# Regenerates src/app/opengraph-image.jpg (the link-preview banner) from banner.html.
# Renders at 2x in headless Chrome, then downsamples to 1200x630 for crisp text. macOS only (uses Chrome and sips).
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1200,630 --virtual-time-budget=4000 --screenshot="$TMP/banner@2x.png" "file://$PWD/banner.html" >/dev/null 2>&1
sips -z 630 1200 "$TMP/banner@2x.png" --out "$TMP/banner.png" >/dev/null
sips -s format jpeg -s formatOptions 90 "$TMP/banner.png" --out ../../src/app/opengraph-image.jpg >/dev/null
rm -rf "$TMP"
echo "Wrote src/app/opengraph-image.jpg ($(du -k ../../src/app/opengraph-image.jpg | cut -f1) KB)"
