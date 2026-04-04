# Sound Lab

<- [[Website/Guides/_Guides|Guides]]

## Canvas

The workspace is a canvas. Touches generate notes and phrases from the instrument settings.

![Sound Lab canvas](_screenshots/soundlab-active.png)

### Instrument

- `Key`: Chromatic key, A through G#.
- `Mode`: Musical scale available on the canvas.
- `Voice`: `Ethereal Piano` or `Felt Piano`.
- `Effect`: Changes how touches appear on the canvas.
- `Repeat`: How notes echo after playback.

### Interaction Effects

- `Bloom`: Touches spread outward from the contact point.
- `Raindrop`: Touches land as individual drops.

### Repeat Modes

- `Off`: Notes play once.
- `On`: Notes loop at the original rhythm.
- `Drift`: Notes echo with cumulative timing shifts, producing textures that diverge from the original pattern.

## Transport

- `Record` (left): Start or stop recording. Touches on the canvas become a new phrase.
- `Play` / `Pause` (right): Play back all recorded phrases.
- `Info Center` (middle): Shows phrase count, key, expression level, and sustain state.

### Expression

Drag left on the info center to reduce velocity, softening playback in real time. The display shows the level as a percentage. Tap to reset to 100%.

### Sustain

Tap the right side of the info center to toggle sustain. When sustain is on, the display reads `SUS HOLD` and notes ring out longer instead of cutting at their recorded duration.

## Timeline

The timeline stores canvas activity as phrases.

![Sound Lab options menu](_screenshots/soundlab-options-menu.png)

- `Add to Playlist`: Add the current piece to the playlist.
- `Evolve` / `Stop Evolving`: Toggle phrase evolution, which changes recorded phrases over time.
- `Show Timeline` / `Hide Timeline`: Toggle the timeline strip below the canvas.
- `Sound Design`: Open the sound-shaping editor.
- `Save Session`: Save the session for later.
- `Sessions`: Browse saved sessions.
- `Clear Timeline`: Remove all recorded phrases from the session.

### Phrase Options

Long-press a phrase in the timeline to open its context menu:

- `Key`: Override the key for this phrase independently of the session key.
- `Mode`: Override the scale mode for this phrase.
- `Overdub`: Record new notes on top of the phrase. The phrase plays while you add to it, and both versions are saved together.
- `Delete`: Remove the phrase.

## Sound Design

Each section has presets and a reset button.

![Sound Design editor](_screenshots/soundlab-sound-design.png)

### Tone

- `Reverb`: Wet/dry mix.
- `Delay`: Feedback amount for the delay line.
- `Gain`: Output level.

### Space

- `Pre-Delay`: Time before the reverb onset.
- `Decay`: Reverb tail length, from short to long.
- `Brightness`: High-frequency content of the reverb.
- `Body`: Low-frequency content of the reverb.

### Performance

- `Echo Tempo`: Time between echo repeats (3-20 seconds).
- `Repeat Count`: How many times an echo repeats.
- `Stereo Width`: Spread across the stereo field.
- `Pad Delay`: Delay mix for the pad layer.

### Evolution

- `Echo Interval`: Time between evolution steps.
- `Mutation`: How aggressively phrases change during evolution (0.1-0.5).
- `Scale Lock`: Keeps mutated notes within the current scale.

## Sessions

Sessions save canvas activity, instrument settings, sound design settings, and timeline state.

![Sessions list](_screenshots/soundlab-sessions.png)

- load, duplicate, rename, and delete
- search and sort
- multi-select for batch actions
- export audio
- export and import sessions

### Audio Export

1. **Mode**: `Render Track` exports one pass with a full decay tail. `Export Loop` creates a loop by crossfading the end into the beginning.
2. **Quality**: `Low` (24 kHz WAV), `Medium` (44.1 kHz WAV), or `High` (96 kHz WAV).
3. **Duration or Repeats**: `Render Track` uses a duration (2, 4, or 6 minutes). `Export Loop` uses a progression count (1x, 2x, or 4x).
