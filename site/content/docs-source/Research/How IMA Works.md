# How IMA Works

<- [[Website/Research/_Research|Research]]

`IMA` stands for `Imperceptible Musical Augments`.

Neurima applies IMA to your audio in real time. It changes the timing relationship between the left and right channels of stereo audio at the sample level during playback. The original file is not modified.

## From Binaural Beats to IMA

Binaural beats present slightly different frequencies to each ear, producing a perceived beat at the frequency difference. The listener perceives a single tone.

IMA changes timing instead of frequency. A sample-level desynchronization is introduced between the stereo channels during playback.

## How Neurima Applies IMA

Neurima applies the timing model to locally stored stereo audio during playback.

IMA playback requires:

- stereo audio
- audio stored on the device
- over-ear headphones or both earbuds

Neurima only works when left and right stay separated. Speakers, mono output, or a single earbud will not produce the effect.

## What This Does

One way to read the listening model:

- one stereo channel is desynchronized at the sample level
- left and right are handled separately below conscious perception
- they are merged back into the single signal you consciously hear
- that merge changes the listening presentation while the source file stays the same

## Where to Begin

The default pathway set gives you three starting points:

- `Relax`: calm, release, and spaciousness
- `Balance`: centered, grounded, and even state
- `Focus`: presence, edge, and concentration

[[Website/Guides/Optimization, Pathways & Circadian|Optimization, Pathways & Circadian]] covers how pathways work and how the default set can be changed later.
