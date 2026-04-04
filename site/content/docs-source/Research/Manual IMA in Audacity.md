# Manual IMA in Audacity

<- [[Website/Research/_Research|Research]]

[Kyrtin Atreides](https://kyrtinatreides.com/) developed the method Neurima is based on. His original manual process used Adobe Premiere Pro. Audacity is enough to demonstrate the same core idea with a free offline setup.

> **Note:** This is not Neurima's live playback model. It is a simple manual version for understanding the underlying idea.

The screenshots here use the same Stellardrone example from the homepage demo, taken from [A Moment Of Stillness](https://stellardrone.bandcamp.com/album/a-moment-of-stillness), and show a `10-sample desynchronization` on the left stereo channel.

## What You Need

- [Audacity](https://www.audacityteam.org/)
- a short stereo file you know well
- over-ear headphones or both earbuds
- a place to export a copy

## Overview

1. Import a stereo file.
2. Open the track menu and split the stereo pair.
3. Change the `Selection Toolbar` format to `samples`.
4. Zoom in until individual stems are easy to see.
5. Move one channel by a very small amount.
6. Listen on headphones.
7. Export a new stereo file.

## Import a Stereo File

- Use `File > Import > Audio`.
- Confirm the file opens as one stereo track with separate upper and lower waveforms.

![Imported stereo file in Audacity](_screenshots/neurima-audacity-step1-import-wide.png)

## Open the Track Menu

- Open the `Audio Track Dropdown Menu`.
- Choose `Split Stereo Track`.

![Audio Track Dropdown Menu showing Split Stereo Track](_screenshots/neurima-audacity-step2-dropdown.png)

## Confirm the Split

- After the split, the stereo pair becomes two separate tracks.
- The upper track stays panned left and the lower track stays panned right.

![Two separate tracks after Split Stereo Track](_screenshots/neurima-audacity-step3-split-result.png)

## Work in Samples

- In the `Selection Toolbar`, change the selection format to `samples`.
- That makes small timing moves easier to judge directly.

![Selection format set to samples](_screenshots/neurima-audacity-step4-selection-toolbar-samples.png)

## Zoom In

- Zoom in until individual stems are easy to see.
- Audacity does not show a literal zoom percentage, so use the waveform itself as the guide.

![Waveform zoomed in until individual sample stems are visible](_screenshots/neurima-audacity-step5-zoomed-stems.png)

## Shift One Channel

- Move one track by a very small fixed amount.
- In these screenshots, the upper track is the left channel.
- This walkthrough shifts that left channel 10 samples to the right.
- Keep the other channel fixed.

![Upper track shifted right by 10 samples](_screenshots/neurima-audacity-step6-shifted-channel.png)

## Listen

- Play the shifted version through headphones.
- Compare a few small values rather than jumping to one large shift.

## Export a Copy

- Use `File > Export Audio`.
- Export a new stereo file so the original stays untouched.
- `FLAC` or `WAV` are the cleanest choices for a lossless export.

![File menu with Export Audio highlighted](_screenshots/neurima-audacity-step7-export-menu.png)

![Export Audio dialog](_screenshots/neurima-audacity-step8-export-dialog-balanced.png)

- Exporting the whole project preserves the shifted stereo pair as one file.

## Limits of the Manual Version

- one fixed shift for the whole file
- manual file management and export, with easy overwrite mistakes
- no live playback
- no pathway switching, `Circadian`, or behavior modes
- no calibration controls
- no automatic handling for codec, sample rate, or export quality

[[Website/Research/How IMA Works|How IMA Works]] explains the idea in Neurima's live playback model.
