import NeurimaDesignSystem
import NeurimaSoundLab
import SwiftUI

struct SoundLabArrangementLane: View, Equatable {
    nonisolated static func == (lhs: SoundLabArrangementLane, rhs: SoundLabArrangementLane) -> Bool {
        lhs.appTheme == rhs.appTheme &&
            lhs.hasTimelineContent == rhs.hasTimelineContent &&
            lhs.phrases == rhs.phrases &&
            lhs.selectedPhraseIndex == rhs.selectedPhraseIndex &&
            lhs.activePlaybackIndex == rhs.activePlaybackIndex &&
            lhs.playbackHighlightState == rhs.playbackHighlightState &&
            lhs.isReplaying == rhs.isReplaying &&
            lhs.playheadProgress == rhs.playheadProgress &&
            lhs.isRecording == rhs.isRecording &&
            lhs.currentRecordingNotes == rhs.currentRecordingNotes &&
            lhs.selectedKeyOffset == rhs.selectedKeyOffset &&
            lhs.selectedMode == rhs.selectedMode &&
            lhs.keyLabels == rhs.keyLabels &&
            lhs.recommendedModeOptions == rhs.recommendedModeOptions &&
            lhs.exploratoryModeOptions == rhs.exploratoryModeOptions
    }

    let appTheme: AppTheme
    let hasTimelineContent: Bool
    let phrases: [RecordedPhrase]
    let selectedPhraseIndex: Int?
    let activePlaybackIndex: Int?
    let playbackHighlightState: SoundLabPlaybackHighlightState
    let isReplaying: Bool
    let playheadProgress: Double
    let isRecording: Bool
    let currentRecordingNotes: Int
    let selectedKeyOffset: Int
    let selectedMode: Int
    let keyLabels: [String]
    let recommendedModeOptions: [IdentityModeOption]
    let exploratoryModeOptions: [IdentityModeOption]
    let onPhraseTap: (Int) -> Void
    let onUpdateKey: (Int, Int) -> Void
    let onUpdateMode: (Int, Int) -> Void
    let onOverdub: (Int) -> Void
    let onDelete: (Int) -> Void
    let phrasePlaybackDuration: (RecordedPhrase) -> Double

    var body: some View {
        let laneShape = RoundedRectangle(cornerRadius: DS.Radius.md, style: .continuous)
        let accent = ThemeColors.accent(for: appTheme)

        Group {
            if hasTimelineContent {
                ScrollView(.horizontal) {
                    LazyHStack(spacing: DS.Spacing.xxs) {
                        ForEach(Array(phrases.enumerated()), id: \.element.id) { index, phrase in
                            PhraseBlockView(
                                index: index,
                                label: phrase.label,
                                accent: accent,
                                appTheme: appTheme,
                                isSelected: selectedPhraseIndex == index,
                                isActive: activePlaybackIndex == index,
                                playbackHighlightStrength: playbackHighlightStrength(for: index),
                                isReplaying: isReplaying,
                                playheadProgress: playheadProgress,
                                duration: phrasePlaybackDuration(phrase),
                                notes: phrase.notes,
                                phraseKeyOffset: phrase.keyOffset,
                                phraseMode: phrase.mode,
                                phraseCount: phrases.count,
                                selectedKeyOffset: selectedKeyOffset,
                                selectedMode: selectedMode,
                                keyLabels: keyLabels,
                                recommendedModeOptions: recommendedModeOptions,
                                exploratoryModeOptions: exploratoryModeOptions,
                                onTap: { onPhraseTap(index) },
                                onUpdateKey: { onUpdateKey(index, $0) },
                                onUpdateMode: { onUpdateMode(index, $0) },
                                onOverdub: { onOverdub(index) },
                                onDelete: { onDelete(index) }
                            )
                            .equatable()
                        }

                        if isRecording {
                            RecordingBlockView(
                                accent: accent,
                                appTheme: appTheme,
                                currentRecordingNotes: currentRecordingNotes
                            )
                        }
                    }
                    .padding(.horizontal, DS.Spacing.xxs)
                    .padding(.vertical, DS.Spacing.xxxs)
                }
                .scrollIndicators(.hidden)
            } else {
                timelineEmptyState
                    .padding(.horizontal, DS.Spacing.lg)
            }
        }
        .frame(height: 106)
        .containerShape(laneShape)
        .background {
            ConcentricRectangle(corners: .concentric)
                .fill(ThemeColors.panelOverlay(for: appTheme).opacity(0.5))
        }
        .clipShape(laneShape)
        .overlay {
            laneShape
                .strokeBorder(ThemeColors.textPrimary(for: appTheme).opacity(0.06), lineWidth: 1)
        }
    }

    private func playbackHighlightStrength(for index: Int) -> Double {
        if playbackHighlightState.activeIndex == index {
            let baseline = playbackHighlightState.trailingIndex == nil ? 0.42 : 0.62
            return baseline + ((1 - baseline) * playbackHighlightState.transitionProgress)
        }

        if playbackHighlightState.trailingIndex == index {
            return 0.72 * (1 - playbackHighlightState.transitionProgress)
        }

        return 0
    }

    private var timelineEmptyState: some View {
        VStack(spacing: DS.Spacing.xxxs) {
            Text(soundLabLocalized("Nothing Recorded Yet"))
                .font(.caption.weight(.semibold))
                .foregroundStyle(ThemeColors.textPrimary(for: appTheme))

            Text(soundLabLocalized("Press Record to save what you play."))
                .font(.caption2)
                .foregroundStyle(ThemeColors.secondary(for: appTheme))
                .lineLimit(3)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    }
}

private struct PhraseContourView: View {
    let notes: [PhraseNote]
    let phraseDuration: Double
    let accent: Color

    var body: some View {
        Canvas { context, size in
            let width = size.width
            let height = size.height
            let lineWidth: CGFloat = 1.2
            let dotRadius: CGFloat = 1.25
            let horizontalInset = dotRadius + 0.35
            let verticalInset = dotRadius + 1.15
            let drawableWidth = max(width - (horizontalInset * 2), 1)
            let drawableHeight = max(height - (verticalInset * 2), 1)
            guard !notes.isEmpty else { return }

            if notes.count >= 2 {
                let pitchMin = CGFloat(notes.map(\.pitch).min() ?? 48)
                let pitchMax = max(CGFloat(notes.map(\.pitch).max() ?? 84), pitchMin + 1)
                let timeMax = max(phraseDuration, 0.01)

                func xPosition(_ note: PhraseNote) -> CGFloat {
                    let progress = min(max(CGFloat(note.relativeTime / timeMax), 0), 1)
                    return horizontalInset + (progress * drawableWidth)
                }

                func yPosition(_ note: PhraseNote) -> CGFloat {
                    let progress = (CGFloat(note.pitch) - pitchMin) / (pitchMax - pitchMin)
                    return height - verticalInset - (progress * drawableHeight)
                }

                var path = Path()
                for (index, note) in notes.enumerated() {
                    let point = CGPoint(x: xPosition(note), y: yPosition(note))
                    if index == 0 {
                        path.move(to: point)
                    } else {
                        path.addLine(to: point)
                    }
                }
                context.stroke(path, with: .color(accent.opacity(0.5)), lineWidth: lineWidth)

                for note in notes {
                    let dot = Path(ellipseIn: CGRect(
                        x: xPosition(note) - dotRadius,
                        y: yPosition(note) - dotRadius,
                        width: dotRadius * 2,
                        height: dotRadius * 2
                    ))
                    context.fill(dot, with: .color(accent.opacity(0.7)))
                }
            } else {
                let progress = min(max(CGFloat(notes[0].relativeTime / max(phraseDuration, 0.01)), 0), 1)
                let cx = horizontalInset + (progress * drawableWidth)
                let dotRadius: CGFloat = 1.5
                let dot = Path(ellipseIn: CGRect(
                    x: cx - dotRadius,
                    y: (height / 2) - dotRadius,
                    width: dotRadius * 2,
                    height: dotRadius * 2
                ))
                context.fill(dot, with: .color(accent.opacity(0.5)))
            }
        }
    }
}

private struct RecordingBlockView: View {
    let accent: Color
    let appTheme: AppTheme
    let currentRecordingNotes: Int

    var body: some View {
        let blockShape = RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)

        VStack(alignment: .leading, spacing: DS.Spacing.xxs) {
            ConcentricRectangle(corners: .concentric)
                .fill(accent.opacity(0.08))
                .frame(height: 56)
                .overlay(
                    Circle()
                        .fill(accent.opacity(0.5))
                        .frame(width: 5, height: 5)
                )

            HStack(spacing: DS.Spacing.xxs) {
                Image(systemName: "music.quarternote.3")
                    .font(.system(size: 7))
                    .foregroundStyle(ThemeColors.textPrimary(for: appTheme).opacity(0.4))
                Text("\(currentRecordingNotes)")
                    .font(.system(size: 9, weight: .medium).monospacedDigit())
                    .foregroundStyle(ThemeColors.textPrimary(for: appTheme).opacity(0.7))
            }
        }
        .padding(.horizontal, DS.Spacing.xs)
        .padding(.vertical, DS.Spacing.xxs)
        .frame(width: 52)
        .containerShape(blockShape)
        .background {
            ConcentricRectangle(corners: .concentric)
                .fill(accent.opacity(0.06))
        }
        .clipShape(blockShape)
        .overlay {
            blockShape
                .strokeBorder(accent.opacity(0.2), lineWidth: 1)
        }
    }
}

private struct PhraseBlockView: View, Equatable {
    nonisolated static func == (lhs: PhraseBlockView, rhs: PhraseBlockView) -> Bool {
        lhs.index == rhs.index &&
            lhs.label == rhs.label &&
            lhs.accent == rhs.accent &&
            lhs.appTheme == rhs.appTheme &&
            lhs.isSelected == rhs.isSelected &&
            lhs.isActive == rhs.isActive &&
            lhs.playbackHighlightStrength == rhs.playbackHighlightStrength &&
            lhs.isReplaying == rhs.isReplaying &&
            lhs.playheadProgress == rhs.playheadProgress &&
            lhs.duration == rhs.duration &&
            lhs.notes == rhs.notes &&
            lhs.phraseKeyOffset == rhs.phraseKeyOffset &&
            lhs.phraseMode == rhs.phraseMode &&
            lhs.phraseCount == rhs.phraseCount &&
            lhs.selectedKeyOffset == rhs.selectedKeyOffset &&
            lhs.selectedMode == rhs.selectedMode &&
            lhs.keyLabels == rhs.keyLabels &&
            lhs.recommendedModeOptions == rhs.recommendedModeOptions &&
            lhs.exploratoryModeOptions == rhs.exploratoryModeOptions
    }

    @ScaledMetric(relativeTo: .caption) private var phraseLabelSize = 9
    @ScaledMetric(relativeTo: .caption) private var phraseNoteIconSize = 7

    let index: Int
    let label: String
    let accent: Color
    let appTheme: AppTheme
    let isSelected: Bool
    let isActive: Bool
    let playbackHighlightStrength: Double
    let isReplaying: Bool
    let playheadProgress: Double
    let duration: Double
    let notes: [PhraseNote]
    let phraseKeyOffset: Int
    let phraseMode: Int
    let phraseCount: Int
    let selectedKeyOffset: Int
    let selectedMode: Int
    let keyLabels: [String]
    let recommendedModeOptions: [IdentityModeOption]
    let exploratoryModeOptions: [IdentityModeOption]
    let onTap: () -> Void
    let onUpdateKey: (Int) -> Void
    let onUpdateMode: (Int) -> Void
    let onOverdub: () -> Void
    let onDelete: () -> Void

    var body: some View {
        let blockWidth = max(CGFloat(duration) * 16, 64)
        let blockShape = RoundedRectangle(cornerRadius: DS.Radius.sm, style: .continuous)
        let selectionStrength = isSelected ? 1.0 : 0.0
        let playbackStrength = isReplaying ? playbackHighlightStrength : 0.0
        let previewDisplayWidth = min(blockWidth, 320)
        let previewShowsTrailingFade = blockWidth > previewDisplayWidth

        Button(action: onTap) {
            phraseBlockSurface(
                contentWidth: blockWidth,
                displayWidth: blockWidth,
                blockShape: blockShape,
                selectionStrength: selectionStrength,
                playbackStrength: playbackStrength,
                showsTrailingFade: false
            )
        }
        .buttonStyle(.plain)
        .contentShape(blockShape)
        .accessibilityLabel(Text(label))
        .accessibilityValue(Text(accessibilityValue))
        .accessibilityHint(Text(String(localized: "Double tap to select this phrase. Long press for phrase actions.")))
        .contextMenu {
            phraseContextMenu
        } preview: {
            phraseBlockSurface(
                contentWidth: blockWidth,
                displayWidth: previewDisplayWidth,
                blockShape: blockShape,
                selectionStrength: selectionStrength,
                playbackStrength: playbackStrength,
                showsTrailingFade: previewShowsTrailingFade
            )
        }
    }

    private var phraseContextMenu: some View {
        Group {
            Menu {
                ForEach(0..<keyLabels.count, id: \.self) { offset in
                    let isCurrentKey = index < phraseCount && phraseKeyOffset == offset
                    Button {
                        onUpdateKey(offset)
                    } label: {
                        if isCurrentKey {
                            Label(keyLabels[offset], systemImage: "checkmark")
                        } else {
                            Text(keyLabels[offset])
                        }
                    }
                }
            } label: {
                let currentKey = index < phraseCount ? keyLabels[phraseKeyOffset] : keyLabels[selectedKeyOffset]
                Label(soundLabLocalizedFormat("Key: %@", currentKey), systemImage: "music.note")
            }

            Menu {
                ForEach(recommendedModeOptions + exploratoryModeOptions) { option in
                    let currentRawValue = SoundLabTheory.normalizedCreationModeRawValue(phraseMode)
                    Button {
                        onUpdateMode(option.mode.rawValue)
                    } label: {
                        if currentRawValue == option.mode.rawValue {
                            Label(option.shortLabel, systemImage: "checkmark")
                        } else {
                            Text(option.shortLabel)
                        }
                    }
                }
            } label: {
                let currentMode = SoundLabTheory.creationModeOption(for: phraseMode)?.shortLabel ?? "Dorian"
                Label(soundLabLocalizedFormat("Mode: %@", currentMode), systemImage: "tuningfork")
            }

            Divider()

            Button {
                onOverdub()
            } label: {
                Label(soundLabLocalized("Overdub"), systemImage: "record.circle")
            }

            Divider()

            Button(role: .destructive) {
                onDelete()
            } label: {
                Label(soundLabLocalized("Delete"), systemImage: "trash")
                    .foregroundStyle(.red)
            }
            .neurimaDestructiveActionTint()
        }
    }

    private func phraseBlockSurface(
        contentWidth: CGFloat,
        displayWidth: CGFloat,
        blockShape: RoundedRectangle,
        selectionStrength: Double,
        playbackStrength: Double,
        showsTrailingFade: Bool
    ) -> some View {
        let blockHeight: CGFloat = 98
        let horizontalInset: CGFloat = 4
        let topInset: CGFloat = 4
        let bottomInset: CGFloat = 4
        let contentSpacing: CGFloat = 2
        let contourHeight: CGFloat = 68
        let playheadWidth: CGFloat = 2
        let playheadTrackWidth = max(displayWidth - playheadWidth, 1)
        let labelOpacity = 0.7 + (selectionStrength * 0.2) + (playbackStrength * 0.14)
        let metadataOpacity = 0.4 + (selectionStrength * 0.12) + (playbackStrength * 0.1)
        let fillOpacity = 0.06 + (selectionStrength * 0.08) + (playbackStrength * 0.08)
        let glowOpacity = 0.12 * playbackStrength
        let borderOpacity = 0.15 + (selectionStrength * 0.28) + (playbackStrength * 0.24)
        let borderWidth: CGFloat = isSelected ? 1.5 : 1

        return VStack(alignment: .leading, spacing: 0) {
            PhraseContourView(notes: notes, phraseDuration: duration, accent: accent)
                .frame(height: contourHeight)
                .frame(maxHeight: .infinity, alignment: .center)

            HStack(spacing: DS.Spacing.xxxs) {
                Text(label)
                    .font(.system(size: phraseLabelSize, weight: .medium))
                    .foregroundStyle(ThemeColors.textPrimary(for: appTheme).opacity(labelOpacity))
                    .lineLimit(1)
                    .minimumScaleFactor(0.9)

                Spacer(minLength: 0)

                Image(systemName: "music.quarternote.3")
                    .font(.system(size: phraseNoteIconSize))
                    .foregroundStyle(ThemeColors.textPrimary(for: appTheme).opacity(metadataOpacity))
                Text("\(notes.count)")
                    .font(.system(size: phraseLabelSize, weight: .medium).monospacedDigit())
                    .foregroundStyle(ThemeColors.textPrimary(for: appTheme).opacity(metadataOpacity + 0.08))
            }
            .padding(.top, contentSpacing)
        }
        .padding(.horizontal, horizontalInset)
        .padding(.top, topInset)
        .padding(.bottom, bottomInset)
        .frame(width: contentWidth, height: blockHeight, alignment: .topLeading)
        .frame(width: displayWidth, height: blockHeight, alignment: .leading)
        .mask(alignment: .leading) {
            phraseBlockContentMask(
                displayWidth: displayWidth,
                showsTrailingFade: showsTrailingFade
            )
        }
        .frame(width: displayWidth, height: blockHeight, alignment: .leading)
        .containerShape(blockShape)
        .background { phraseBlockBackground(fillOpacity: fillOpacity, glowOpacity: glowOpacity) }
        .overlay(alignment: .leading) {
            phrasePlayhead(playheadWidth: playheadWidth, playheadTrackWidth: playheadTrackWidth)
        }
        .clipShape(blockShape)
        .overlay {
            blockShape
                .strokeBorder(accent.opacity(borderOpacity), lineWidth: borderWidth)
        }
        .compositingGroup()
        .animation(DS.Motion.standard, value: isSelected)
        .animation(DS.Motion.gentle, value: playbackStrength)
    }

    @ViewBuilder
    private func phraseBlockBackground(fillOpacity: Double, glowOpacity: Double) -> some View {
        ZStack {
            ConcentricRectangle(corners: .concentric)
                .fill(accent.opacity(fillOpacity))

            if glowOpacity > 0 {
                LinearGradient(
                    colors: [
                        accent.opacity(glowOpacity),
                        accent.opacity(glowOpacity * 0.6),
                        accent.opacity(glowOpacity * 0.15),
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
        }
    }

    @ViewBuilder
    private func phrasePlayhead(playheadWidth: CGFloat, playheadTrackWidth: CGFloat) -> some View {
        if isActive && isReplaying {
            Rectangle()
                .fill(accent.opacity(0.8))
                .frame(width: playheadWidth)
                .padding(.vertical, 1)
                .offset(x: playheadProgress * playheadTrackWidth)
                .transaction { transaction in
                    transaction.animation = nil
                }
        }
    }

    @ViewBuilder
    private func phraseBlockContentMask(
        displayWidth: CGFloat,
        showsTrailingFade: Bool
    ) -> some View {
        if showsTrailingFade {
            let fadeWidth = min(max(displayWidth * 0.22, 28), 56)

            HStack(spacing: 0) {
                Rectangle()
                    .fill(.white)
                LinearGradient(
                    colors: [.white, .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: fadeWidth)
            }
            .frame(width: displayWidth)
        } else {
            Rectangle()
                .fill(.white)
        }
    }

    private var accessibilityValue: String {
        var values = ["\(notes.count) notes"]
        if isSelected { values.append("Selected") }
        if isActive { values.append("Playing") }
        return values.joined(separator: ", ")
    }
}
