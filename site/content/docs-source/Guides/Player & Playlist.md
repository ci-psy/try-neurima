# Player & Playlist

<- [[Website/Guides/_Guides|Guides]]

## Player

![Player view](_screenshots/player-main.png)

- `Settings` (top): Opens configuration and app information.
- **Center info capsule** (middle): Shows track info and quick gesture shortcuts.
- `Playlist` (top): Opens the queue.

## Playback Display

A double-tap on the main display cycles through the available visual modes.

![Sphere display](_screenshots/player-sphere.png)

With `Circadian` off, the display cycles between:

- **Album Art**
- **Sphere** (the 3D visualizer)

With `Circadian` on, the display cycles between:

- **Sphere**
- **Circadian Chart**
- **Album Art**

`Playback Display Priority` in Visualization sets the starting display.

## Center Info Capsule

![Center info capsule](_screenshots/player-main.png)

| Gesture | Action |
|---------|--------|
| Tap | Cycle between information views |
| Swipe left | Set channel affinity to `Left` |
| Swipe right | Set channel affinity to `Right` |
| Long press | Return channel affinity to `Automatic` |

See [[Website/Guides/Behavior Mode & Channel Affinity|Behavior Mode & Channel Affinity]].

## Playback Controls

![Transport controls](_screenshots/player-main.png)

- **Shuffle**: Toggle shuffle on or off.
- **Previous track**: Skip to the previous track.
- **Play / Pause**: Start or stop playback.
- **Next track**: Skip to the next track.
- **Repeat**: Cycle through Off, On (loop the full playlist), and One (loop the current track).

- When `Circadian` is **off**: The optimization button switches pathways.
- When `Circadian` is **on**: The same button opens the chronotype selector.
- The behavior button opens `Behavior Mode`.

## Playlist

![Playlist view](_screenshots/playlist-empty.png)

- add tracks from `Music` (requires Media Library access)
- add audio from `Files`
- generate a sample ambient track
- reorder tracks by dragging
- swipe to remove tracks
- clear the entire queue

See [[Website/Guides/Data, Permissions & Media Library|Data, Permissions & Media Library]].

## If a Track Will Not Play

Tracks from `Music` must be truly local to the device. Neurima can open iTunes Store purchases that have been downloaded to the device and audio synced from the Apple Music app on Mac. Apple Music subscription downloads currently do not work because they remain DRM-protected subscription copies, even when they appear downloaded in the Music app.

- Sync the audio from the Apple Music app on Mac or use a downloaded iTunes Store purchase, then return to Neurima.
- Or add the audio file directly from `Files`.
