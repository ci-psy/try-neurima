# Manual IMA in Audacity

<- [[Website/Research/_Research|Research]]

The original manual process used Adobe Premiere Pro. Audacity is enough to show the same basic channel-shift process in a free offline workflow.

> **Note:** This is not Neurima's live playback model. It shows a manual Audacity workflow for applying a fixed channel desynchronization to an exported file.

The screenshots here use the same Stellardrone example as the homepage demo, taken from [A Moment Of Stillness](https://stellardrone.bandcamp.com/album/a-moment-of-stillness), and show a `10-sample desynchronization` on the left channel.

## What You Need

- [Audacity](https://www.audacityteam.org/)
- A short stereo file you know well
- Stereo headphones
- A place to export a copy

## Overview

1. Import a stereo file.
2. Open the track menu and split the stereo pair.
3. Change the `Selection Toolbar` format to `samples`.
4. Zoom in until the individual sample stems are clearly visible.
5. Shift one channel by a small fixed number of samples.
6. Listen on headphones.
7. Export a new stereo file.

## Import a Stereo File

- Use `File > Import > Audio`.
- Confirm the file opens as one stereo track with separate upper and lower waveforms.

![Imported stereo file in Audacity](_screenshots/neurima-audacity-step1-import-wide.png)

## Open the Track Menu

- Right-click the track header to open the `Audio Track Dropdown Menu`.
- Choose `Split Stereo Track`.

![Audio Track Dropdown Menu showing Split Stereo Track](_screenshots/neurima-audacity-step2-dropdown.png)

## Confirm the Split

- After the split, the stereo pair becomes two separate tracks.
- The upper track stays panned left and the lower track stays panned right.

![Two separate tracks after Split Stereo Track](_screenshots/neurima-audacity-step3-split-result.png)

## Work in Samples

- In the `Selection Toolbar`, change the selection format to `samples`.
- Small timing moves are easier to measure in samples.

![Selection format set to samples](_screenshots/neurima-audacity-step4-selection-toolbar-samples.png)

## Zoom In

- Zoom in until individual stems are easy to see.
- Stop once the individual sample stems are clearly visible.

![Waveform zoomed in until individual sample stems are visible](_screenshots/neurima-audacity-step5-zoomed-stems.png)

## Shift One Channel

- Move one track by a small fixed number of samples.
- At this zoom level, keep the move on whole-sample boundaries.
- In these screenshots, the upper track is the left channel.
- This walkthrough shifts that left channel 10 samples to the right.
- Keep the other channel fixed.

![Upper track shifted right by 10 samples](_screenshots/neurima-audacity-step6-shifted-channel.png)

## Listen

- Play the shifted version through headphones.
- Compare a few small offsets rather than jumping straight to a large shift.

## Export a Copy

- Use `File > Export Audio`.
- Export a new stereo file so the original stays untouched.
- `FLAC` or `WAV` are the cleanest choices for a lossless export.

![File menu with Export Audio highlighted](_screenshots/neurima-audacity-step7-export-menu.png)

![Export Audio dialog](_screenshots/neurima-audacity-step8-export-dialog-balanced.png)

- The export saves the shifted pair as one stereo file.

## Limits of the Manual Version

- One fixed shift for the whole file
- Manual file management and export, with easy overwrite mistakes
- No live playback
- No pathway switching, `Circadian`, or behavior modes
- No calibration controls
- No automatic handling for codec, sample rate, or export quality

For Neurima's live playback model, see [[Website/Research/How IMA Works|How IMA Works]].
