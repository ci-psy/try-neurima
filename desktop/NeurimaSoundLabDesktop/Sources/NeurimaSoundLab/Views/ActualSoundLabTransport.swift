import NeurimaDesignSystem
import NeurimaSoundLab
import NeurimaSoundLabUI
import SwiftUI

struct ActualSoundLabTransport: View {
    @Environment(\.soundLabUIStyle) private var style
    private static let minimumExpressionScalar: Float = 0.15

    let isRecording: Bool
    let isPlaybackActive: Bool
    let phraseCount: Int
    let currentRecordingNotes: Int
    let canPlay: Bool
    let keyName: String
    let isExpressionActive: Bool
    let expressionScalar: Float
    let isSustainActive: Bool
    let onRecordToggle: () -> Void
    let onPlayToggle: () -> Void
    let onExpressionChanged: (Float) -> Void
    let onExpressionEnded: () -> Void
    let onSustainChanged: (Bool) -> Void

    var body: some View {
        GlassEffectContainer(spacing: DS.Spacing.lg) {
            HStack(spacing: DS.Spacing.lg) {
                recordButton
                infoCenter
                playButton
            }
        }
        .padding(.horizontal, DS.Spacing.xl)
        .padding(.bottom, DS.Spacing.xs)
        .animation(DS.Motion.quick, value: isRecording)
        .animation(DS.Motion.quick, value: isPlaybackActive)
    }

    private var recordButton: some View {
        Button(action: onRecordToggle) {
            Label(
                soundLabLocalized(isRecording ? "Stop" : "Record"),
                systemImage: isRecording ? "stop.fill" : "button.programmable"
            )
            .labelStyle(.iconOnly)
            .font(.title2)
            .foregroundStyle(style.accent)
            .frame(width: 50, height: 50)
            .contentShape(.circle)
            .glassEffect(.regular.interactive(), in: .circle)
        }
        .buttonStyle(.plain)
    }

    private var infoCenter: some View {
        HStack(spacing: 0) {
            valueReadout(
                label: leftLabel,
                value: leftValue,
                isActive: isExpressionActive
            )

            Divider().frame(height: 24)

            valueReadout(
                label: rightLabel,
                value: rightValue,
                isActive: isSustainActive
            )
        }
        .padding(.horizontal, DS.Spacing.md)
        .frame(minHeight: 50)
        .frame(maxWidth: .infinity)
        .contentShape(.capsule)
        .glassEffect(.regular.interactive(), in: .capsule)
        .overlay {
            GeometryReader { geometry in
                HStack(spacing: 0) {
                    expressionMouseZone(width: max(1, geometry.size.width / 2))
                    sustainMouseZone
                }
                .frame(width: geometry.size.width, height: geometry.size.height)
                .clipShape(Capsule())
            }
        }
    }

    private func valueReadout(label: String, value: String, isActive: Bool) -> some View {
        HStack(spacing: DS.Spacing.xxs) {
            Text(label)
                .font(.footnote.weight(.medium).monospaced())
                .foregroundStyle(isActive ? style.accent : style.secondaryText)
                .contentTransition(.numericText())
            Text(value)
                .font(.footnote.weight(.medium).monospaced())
                .foregroundStyle(isActive ? style.accent : style.textPrimary)
                .contentTransition(.numericText())
        }
        .frame(maxWidth: .infinity)
    }

    private func expressionMouseZone(width: CGFloat) -> some View {
        Rectangle()
            .fill(.clear)
            .contentShape(Rectangle())
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .gesture(
                DragGesture(minimumDistance: 0, coordinateSpace: .local)
                    .onChanged { value in
                        updateExpression(at: value.location.x, width: width)
                    }
                    .onEnded { value in
                        updateExpression(at: value.location.x, width: width)
                    }
            )
            .accessibilityLabel("Volume")
            .accessibilityValue(leftValue)
    }

    private var sustainMouseZone: some View {
        Rectangle()
            .fill(.clear)
            .contentShape(Rectangle())
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .onTapGesture {
                onSustainChanged(!isSustainActive)
            }
            .accessibilityLabel("Sustain")
            .accessibilityValue(isSustainActive ? "On" : "Off")
    }

    private var playButton: some View {
        Button(action: onPlayToggle) {
            Label(
                soundLabLocalized(isPlaybackActive ? "Pause" : "Play"),
                systemImage: isPlaybackActive ? "pause.fill" : "play.fill"
            )
            .labelStyle(.iconOnly)
            .font(.title2)
            .foregroundStyle(isPlaybackActive ? style.accent : style.interactiveAccent)
            .frame(width: 50, height: 50)
            .contentShape(.circle)
            .glassEffect(.regular.interactive(), in: .circle)
        }
        .buttonStyle(.plain)
        .opacity(canPlay ? 1 : 0.35)
        .disabled(!canPlay)
    }

    private func updateExpression(at xPosition: CGFloat, width: CGFloat) {
        let progress = max(0, min(1, Float(xPosition / max(width, 1))))
        let scalar = Self.minimumExpressionScalar + progress * (1 - Self.minimumExpressionScalar)
        if scalar >= 0.995 {
            onExpressionEnded()
        } else {
            onExpressionChanged(scalar)
        }
    }

    private var leftLabel: String {
        if isExpressionActive { return "VOL" }
        if isRecording { return "REC" }
        return "SEC"
    }

    private var leftValue: String {
        if isExpressionActive {
            return String(format: "%03d%%", Int(round(expressionScalar * 100)))
        }
        let count = isRecording ? phraseCount + 1 : phraseCount
        return formatDisplay(count)
    }

    private var rightLabel: String {
        if isSustainActive { return "SUS" }
        if isRecording { return "LIVE" }
        return "KEY"
    }

    private var rightValue: String {
        if isSustainActive { return "HOLD" }
        if isRecording {
            return formatDisplay(currentRecordingNotes)
        }
        return keyName
    }

    private func formatDisplay(_ value: Int) -> String {
        if value > 9_999 { return String(value) }
        return String(format: "%04d", value)
    }
}
