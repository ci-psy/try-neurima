# Optimization, Pathways & Circadian

<- [[Website/Guides/_Guides|Guides]]

## Pathways

A pathway is a named region inside the timing range with its own drift behavior.

![Pathways list](_screenshots/pathways-list.png)

Each pathway has:

- A label (the name you see in the list and on the player)
- A center position (where in the range this pathway sits)
- A drift amount (how much the value is allowed to wander within the pathway region)

### Pathway List

- Add a new pathway
- Tap a pathway to edit its values
- Swipe right to make a pathway active
- Swipe left to delete a pathway
- Switch the badge style between number and letter icons
- Restore the default pathway set
- Clear all pathways

The active pathway sets the emphasized region during playback when `Circadian` is off. The optimization button on the player switches between pathways.

![Optimization with Pathways active](_screenshots/optimization-pathways.png)

## Circadian

`Circadian` maps the full timing range to a daily schedule based on wake time, sleep time, and chronotype.

![Circadian settings](_screenshots/circadian-settings.png)

When `Circadian` is enabled:

- Pathway ranges no longer define the active region. The full range is used instead.
- Wake time and sleep time become part of the model.
- The chronotype selector appears on the player in place of the pathway selector.

## Circadian Settings

- `Wake Time`: When your day typically begins.
- `Sleep Time`: When your day typically ends.
- `24-Hour Time`: Toggle between 12-hour and 24-hour display.
- `Energy Chronotype`: Your daily energy profile.

### Available Chronotypes

| Chronotype | Description |
|------------|-------------|
| `Standard` | Default daily rhythm. |
| `Early Riser` | Steeper morning rise. Energy peaks early. |
| `Biphasic` | Includes an afternoon energy bump for mid-day dip and recovery patterns. |
| `Night Owl` | A slow morning with peak energy shifting toward late afternoon and evening. |
| `Light Sleeper` | Lower energy curve with an early spike. |
