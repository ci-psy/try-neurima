# Data, Permissions & Media Library

<- [[Website/Guides/_Guides|Guides]]

## Permissions

![Permissions screen](_screenshots/permissions.png)

### Media Library

Media Library access is optional. It adds the Music library browser. `Files`, generated tracks, and tracks made in Sound Lab still work without it.

### Notifications

Notifications only cover export alerts. If denied, export status still appears in-app, but no system notification appears when an export finishes.

Depending on the current permission state, each row may show:

- `Enable`: Permission has not been requested yet.
- `Open Settings`: Permission was denied and must be changed in system Settings.
- `Allowed`: Permission is active.

## Local Audio and Music

Neurima applies IMA during local playback. It does not stream, and it cannot use protected subscription playback paths.

`Music` works when iOS exposes the track to Neurima as ordinary local media. In practice, that usually means:

- Audio synced from the Apple Music app on Mac
- Tracks purchased from the iTunes Store and downloaded to the device
- Files imported directly through `Files`

Not included:

- Apple Music subscription downloads that remain DRM-protected, even when they appear downloaded in the Music app

If a track appears in `Music` but will not open in Neurima, add the underlying file through `Files` instead.

## Media Sources

`Media Library` sets which add-audio options appear:

![Settings home showing Media Library](_screenshots/settings-home.png)

- `Music`: Only the Music library browser is available.
- `Files`: Only the system file picker is available.
- `Both`: Both options appear when adding audio.

## Export Data

Create `.neurima` files for sharing or transfer to another device.

![Data export screen](_screenshots/data-export.png)

Available export categories:

- `Configuration`: All IMA processing, behavior, and optimization settings.
- `Visualization`: Sphere and chart display preferences.
- `Sound Lab`: Saved sessions and their settings.

## Import Data

When you open a `.neurima` file, Neurima shows what it will import before you apply it.

<!-- TODO: Capture import confirmation dialog -->

Import steps:

1. Choose a `.neurima` file.
2. Review the confirmation summary showing what will be imported.
3. Back up your current configuration.
4. Apply the imported settings.
