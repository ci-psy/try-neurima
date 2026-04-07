# How IMA Works

<- [[Website/Research/_Research|Research]]

`IMA` stands for `Imperceptible Musical Augments`.

The method behind Neurima was developed by [Kyrtin Atreides](https://kyrtinatreides.com/).

IMA has a playback model and a perceptual integration model.

## Binaural Beats and IMA

Binaural beats send slightly different frequencies to each ear. You hear one tone with a beat at the frequency difference.

IMA changes timing instead of frequency. A very small sample-level desynchronization is introduced between the stereo channels during playback.

## The Playback Model

Neurima applies IMA through sample-level DSP during playback.

- One stereo channel is shifted by a very small sample-level amount
- The left-right timing relationship changes during playback rather than in the source file
- Stereo separation is preserved until the signal reaches each ear
- The source file itself is never rewritten

## Perceptual Integration Model

The timing difference between channels starts a series of subconscious responses:

- `Neurological desynchronization`: Your subconscious detects the stereo channels as desynchronized.
- `Individual Processing`: Left and right signals are processed separately below conscious perception.
- `Merge`: The signals merge into the single stream you consciously hear.
- `Reconciliation`: Reconciling the merge takes extra processing effort.
- `Reallocation`: That effort is thought to free processing capacity that you can then steer.

For live playback requirements, see [[Website/Getting Started/Start Here|Start Here]]. For the origin and interpretation of IMA, see [Story](/story/).
