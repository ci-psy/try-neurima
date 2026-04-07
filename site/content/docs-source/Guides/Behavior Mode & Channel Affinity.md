# Behavior Mode & Channel Affinity

<- [[Website/Guides/_Guides|Guides]]

## Behavior Mode

![Configuration screen showing Behavior Mode and Channel Affinity](_screenshots/configuration.png)

- `Continuous`: The timing model stays in motion throughout playback.
- `Per Track`: A single desynchronization value is chosen when a track begins and held for that track. This matches the older prepared-track workflow, where each track carried one fixed value.
- `Locked`: Holds one fixed desync value indefinitely for repeatable comparison.

`Locked` shows the `Fixed Desync` control.

> **Note:** `Locked` is unavailable while `Circadian` is enabled, since circadian scheduling requires the timing model to move freely.

## Channel Affinity

- `Automatic`: Neurima chooses the desynchronized channel from the active optimization model.
- `Left`: The left channel is always desynchronized.
- `Right`: The right channel is always desynchronized.

`Automatic` is the default.

See [[Website/Guides/Player & Playlist|Player & Playlist]] for the player gestures.
