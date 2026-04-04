# Visualization

<- [[Website/Guides/_Guides|Guides]]

## Playback Display Priority

This setting controls which visual mode appears first in the double-tap cycle.

![Visualization settings](_screenshots/visualization-settings.png)

- `Album Art First`: Starts with the album artwork.
- `Sphere First`: Starts with the 3D Sphere visualization.
- `Circadian First`: Starts with the circadian energy chart (only available when `Circadian` is enabled).

## Sphere

The Sphere is a 3D visualization that responds to playback.

![Sphere visualization](_screenshots/player-sphere.png)

### Scale

Overall size of the Sphere in the display.

### Motion

Speed of the orbital animation.

### Effects

Visual treatment applied to the Sphere:

- `Warp`: Intensity of the spatial distortion effect.
- `Depth Fade`: How much distant elements fade relative to near elements.
- `Fill`: Opacity of the fill applied to the Sphere surface.

### Trail

Controls the visual trail left by orbital elements:

- `Trail Length`: How far the trail extends behind moving elements.
- `Trail Scale`: The size of the trail relative to the orbital elements.

## Orbital

Orbital options:


- **Playhead style**: Choose from `Default`, `Arrow`, or `Atom`.
- `BPM Sync`: Syncs the visualization rhythm to the audio BPM.
- `Follow Cam`: Keeps the camera on the active orbital element.

## Circadian Chart

With `Circadian` on, the chart appears during playback.

<!-- TODO: Capture circadian chart during playback -->

- `Trail`: Trail behavior for the chart line.
- `Depth Mask`: Controls depth layering in the chart visualization.
- `Proximity Glow`: Glow intensity near the current time position.
- `Track Now`: Emphasizes the current time.
- `Fill`: Fill opacity for the chart area.
- `Depth Fade`: Fade intensity for chart depth layers.

## Rendering

Performance and diagnostic settings:

- `Anti-Aliasing`: Toggle MSAA (multisample anti-aliasing) for smoother edges. Disabling improves performance on older devices.
- `FPS Counter`: Show or hide the frames-per-second overlay for debugging.
- `Override Thermal Throttling`: Override the system's thermal management for the visualization. Increases device temperature during extended sessions.
