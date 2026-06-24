#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
APP_NAME="NeurimaSoundLab"
DISPLAY_NAME="Neurima Sound Lab"
BUNDLE_ID="com.tryneurima.soundlab"
MIN_SYSTEM_VERSION="14.0"
BUILD_CONFIGURATION="${BUILD_CONFIGURATION:-release}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_DIR="$ROOT_DIR/desktop/NeurimaSoundLabDesktop"
DIST_DIR="$ROOT_DIR/dist"
APP_BUNDLE="$DIST_DIR/$DISPLAY_NAME.app"
APP_CONTENTS="$APP_BUNDLE/Contents"
APP_MACOS="$APP_CONTENTS/MacOS"
APP_RESOURCES="$APP_CONTENTS/Resources"
APP_BINARY="$APP_MACOS/$APP_NAME"
INFO_PLIST="$APP_CONTENTS/Info.plist"
METAL_SOURCE="$ROOT_DIR/../Neurima_DSP/Neurima/Views/Components/SoundLab/SoundLabPadShaders.metal"
PACKAGE_ZIP="$DIST_DIR/Neurima-Sound-Lab-macOS.zip"

pkill -x "$APP_NAME" >/dev/null 2>&1 || true

swift build -c "$BUILD_CONFIGURATION" --package-path "$PACKAGE_DIR"
BUILD_BINARY="$(swift build -c "$BUILD_CONFIGURATION" --package-path "$PACKAGE_DIR" --show-bin-path)/$APP_NAME"
BUILD_BIN_DIR="$(swift build -c "$BUILD_CONFIGURATION" --package-path "$PACKAGE_DIR" --show-bin-path)"

rm -rf "$APP_BUNDLE"
mkdir -p "$APP_MACOS" "$APP_RESOURCES"
cp "$BUILD_BINARY" "$APP_BINARY"
chmod +x "$APP_BINARY"

for resource_bundle in "$BUILD_BIN_DIR"/*.bundle; do
  [ -e "$resource_bundle" ] || continue
  cp -R "$resource_bundle" "$APP_RESOURCES/"
done

if [ -f "$METAL_SOURCE" ]; then
  METAL_AIR="$DIST_DIR/SoundLabPadShaders.air"
  xcrun -sdk macosx metal -c "$METAL_SOURCE" -o "$METAL_AIR"
  xcrun -sdk macosx metallib "$METAL_AIR" -o "$APP_RESOURCES/default.metallib"
  rm -f "$METAL_AIR"
fi

cat >"$INFO_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>$APP_NAME</string>
  <key>CFBundleIdentifier</key>
  <string>$BUNDLE_ID</string>
  <key>CFBundleName</key>
  <string>$DISPLAY_NAME</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>LSApplicationCategoryType</key>
  <string>public.app-category.music</string>
  <key>LSMinimumSystemVersion</key>
  <string>$MIN_SYSTEM_VERSION</string>
  <key>NSPrincipalClass</key>
  <string>NSApplication</string>
</dict>
</plist>
PLIST

if command -v codesign >/dev/null 2>&1; then
  codesign --force --deep --sign - "$APP_BUNDLE" >/dev/null
fi

open_app() {
  /usr/bin/open -n "$APP_BUNDLE"
  sleep 0.5
  /usr/bin/osascript -e "tell application \"$DISPLAY_NAME\" to activate" >/dev/null 2>&1 || true
  /usr/bin/osascript \
    -e "tell application \"System Events\" to tell process \"$APP_NAME\" to set frontmost to true" \
    -e "tell application \"System Events\" to tell process \"$APP_NAME\" to set position of window 1 to {180, 90}" \
    -e "tell application \"System Events\" to tell process \"$APP_NAME\" to set size of window 1 to {1240, 780}" >/dev/null 2>&1 || true
}

package_app() {
  rm -f "$PACKAGE_ZIP"
  ditto -c -k --norsrc --keepParent "$APP_BUNDLE" "$PACKAGE_ZIP"
  echo "$PACKAGE_ZIP"
}

case "$MODE" in
  run)
    open_app
    ;;
  --build|build)
    echo "$APP_BUNDLE"
    ;;
  --package|package)
    package_app
    ;;
  --debug|debug)
    lldb -- "$APP_BINARY"
    ;;
  --logs|logs)
    open_app
    /usr/bin/log stream --info --style compact --predicate "process == \"$APP_NAME\""
    ;;
  --telemetry|telemetry)
    open_app
    /usr/bin/log stream --info --style compact --predicate "subsystem == \"$BUNDLE_ID\""
    ;;
  --verify|verify)
    open_app
    sleep 1
    pgrep -x "$APP_NAME" >/dev/null
    ;;
  *)
    echo "usage: $0 [run|--build|--package|--debug|--logs|--telemetry|--verify]" >&2
    exit 2
    ;;
esac
