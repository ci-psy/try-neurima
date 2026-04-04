# Calibration Profile

<- [[Website/Guides/_Guides|Guides]]

## Signal Trace

`Signal Trace` shows the timing model in 3D. Each rail represents a channel, and the links between them show where the channels differ.

![Signal Trace visualization](_screenshots/calibration-profile.png)

- drag or pinch: rotate the model
- swipe: adjust the camera angle
- `Speed`: animation rate
- `Stage Blend`: stage layering

## Reference Tone

`Binaural Beats (Reference)` plays a comparison tone alongside IMA-processed playback. It is a reference tool, not the Neurima method.


Binaural beats and IMA both work with left-right channel differences, but binaural beats use frequency and IMA uses timing.

- `Base Tone`: Tone frequency in Hz.
- `Frequency Difference`: The difference between left and right frequencies, which determines the perceived beat rate.

## IMA Processing Defaults

![IMA processing defaults](_screenshots/calibration-ima-controls.png)

### IMA Sample Desync

Sets the playback desynchronization range. The slider uses adaptive step sizes (1, 10, 100, or 1,000 samples).

### Dynamics

Controls how the desync value moves or stays fixed during playback.

### Desync Pattern

Selects the motion shape:

- `Perlin`: Noise-based movement with irregular variation.
- `Sine`: Smooth, periodic oscillation.
- `Triangle`: Linear ramps that reverse direction at each peak.

## Preview

![Calibration preview controls](_screenshots/calibration-preview.png)

- `Preview Quality`: Resolution of the preview tone.
- `Tone Timbre`: `Pure` produces a simple tone. `Rich` adds overtones.
- **Modified channel**: Select which channel is desynchronized in the preview.

`Save Profile` applies these values to playback. `Reset to Defaults` restores the factory calibration profile and saves it immediately.
