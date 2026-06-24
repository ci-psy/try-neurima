import AppKit
import AVFoundation
import NeurimaDesignSystem
import NeurimaSoundLab
import NeurimaSoundLabUI
import os
import SwiftUI
import UniformTypeIdentifiers

enum ActualSoundLabSection: String, CaseIterable, Identifiable {
    case canvas = "Sound Lab"
    case soundDesign = "Sound Design"
    case sessions = "Sessions"

    var id: String { rawValue }

    var systemImage: String {
        switch self {
        case .canvas: return "pianokeys"
        case .soundDesign: return "slider.horizontal.3"
        case .sessions: return "folder"
        }
    }
}

private struct PendingPhraseVoiceEnd {
    let releaseTime: Double
    let voiceID: Int
    let endStyle: CreationPlaybackBehavior.NoteEndStyle
}

private struct PendingEchoEvent {
    let fireTime: CFTimeInterval
    let note: Int
    let velocity: Float
    let position: CGPoint
    let interactionMode: CreationInteractionMode
    let playCount: Int
    let birthNoteCount: Int
}

private final class PlaybackCancellationFlag: Sendable {
    private let lock = OSAllocatedUnfairLock(initialState: false)

    var isCancelled: Bool {
        get { lock.withLock { $0 } }
        set { lock.withLock { $0 = newValue } }
    }
}

private func soundLabFrequency(for midi: Int) -> Float {
    440.0 * powf(2.0, Float(midi - 69) / 12.0)
}

private extension SoundLabUIStyle {
    static func neurima(theme: AppTheme) -> Self {
        SoundLabUIStyle(
            accent: ThemeColors.accent(for: theme),
            textPrimary: ThemeColors.textPrimary(for: theme),
            secondaryText: ThemeColors.secondary(for: theme),
            quaternaryText: ThemeColors.textQuaternary(for: theme),
            interactiveAccent: ThemeColors.interactiveAccent(for: theme),
            sheetBackground: ThemeColors.sheetBackground(for: theme),
            panelOverlay: ThemeColors.panelOverlay(for: theme),
            panelBorder: ThemeColors.panelBorder(for: theme),
            visualizerBackground: ThemeColors.visualizerBackground(for: theme)
        )
    }
}

@MainActor
final class ActualSoundLabStore: ObservableObject {
    @Published var selectedSection: ActualSoundLabSection = .canvas
    @Published var selectedMode: ScaleMode = .majorPentatonic
    @Published var keyOffset: Int = 5
    @Published var voiceType: CreationVoiceType = .etherealPiano
    @Published var interactionMode: CreationInteractionMode = .bloom
    @Published var repeatMode: CreationRepeatMode = .off {
        didSet { handleRepeatModeChanged() }
    }
    @Published var isRecording = false
    @Published var isPlaying = false
    @Published var isEvolving = false
    @Published var showTimeline = true
    @Published var isExpressionActive = false
    @Published var expressionScalar: Float = 1
    @Published var isSustainActive = false
    @Published var pendingCanvasSpawns: [ExternalNoteSpawn] = []
    @Published var phrases: [RecordedPhrase] = []
    @Published var sessions: [CreationSession] = [] {
        didSet {
            guard shouldPersistSessions else { return }
            ActualSoundLabPersistence.save(sessions)
        }
    }
    @Published var status = "Ready"
    @Published var isExporting = false
    @Published var lastExportURL: URL?
    @Published var lastDataExportURL: URL?
    @Published var selectedPhraseIndex: Int?
    @Published var activePlaybackIndex: Int?
    @Published var playheadProgress: Double = 0
    @Published var playbackHighlightState = SoundLabPlaybackHighlightState.inactive

    @Published var toneReverbMix: Float = 0.22 { didSet { syncEngineParameters() } }
    @Published var toneDelayFeedback: Float = 0.25 { didSet { syncEngineParameters() } }
    @Published var toneMainGain: Float = 1.80 { didSet { syncEngineParameters() } }
    @Published var liveOutputGain: Float = SoundLabLiveOutput.loadGain() {
        didSet {
            let clampedGain = SoundLabLiveOutput.clamped(liveOutputGain)
            guard abs(liveOutputGain - clampedGain) < 0.001 else {
                liveOutputGain = clampedGain
                return
            }
            SoundLabLiveOutput.saveGain(clampedGain)
            syncEngineParameters()
            status = "Output \(SoundLabLiveOutput.percentText(for: clampedGain))"
        }
    }
    @Published var spacePreDelay: Float = 0.035 { didSet { syncEngineParameters() } }
    @Published var spaceDecay: Float = 0.72 { didSet { syncEngineParameters() } }
    @Published var spaceDamping: Float = 0.62 { didSet { syncEngineParameters() } }
    @Published var spaceBody: Float = 0.55 { didSet { syncEngineParameters() } }
    @Published var echoTempo: Double = 4 {
        didSet { resetSessionEchoDelay() }
    }
    @Published var echoRepeatCount: Int = 15
    @Published var stereoWidth: Float = 1.0
    @Published var padDelayMix: Float = 0.25 { didSet { syncEngineParameters() } }
    @Published var mutationRate: Float = 0.30 {
        didSet { evolutionEngine.config.mutationRate = mutationRate }
    }
    @Published var echoInterval: Double = 8 {
        didSet { evolutionEngine.config.echoInterval = echoInterval }
    }
    @Published var scaleLock = true {
        didSet { evolutionEngine.config.scaleLock = scaleLock }
    }

    private let audio = ActualSoundLabAudioHost()
    private let evolutionEngine = NoteEvolutionEngine()
    private var playbackTask: Task<Void, Never>?
    private var playbackHighlightTask: Task<Void, Never>?
    private var echoTimer: DispatchSourceTimer?
    private var pendingEchoEvents: [PendingEchoEvent] = []
    private var sessionEchoDelay: Double = 4
    private var globalNoteCounter = 0
    private var noteReleaseTasks: [Task<Void, Never>] = []
    private var activePointerVoiceID: Int?
    private var activePointerMIDI: Int?
    private var pointerLastTransitionTime: CFTimeInterval = 0
    private var shouldPersistSessions = false
    private var visualizerWindowController: NSWindowController?
    private var lastCanvasSize = CGSize(width: 900, height: 520)
    private var liveVoiceStartTimes: [Int: CFTimeInterval] = [:]
    private var deferredSustainVoiceIDs: [Int: CreationPlaybackBehavior.NoteEndStyle] = [:]

    let keyLabels = ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab"]

    init() {
        sessions = ActualSoundLabPersistence.load() ?? CreationSession.starterSeedLibrary
        evolutionEngine.setScale(mode: selectedMode.rawValue, keyOffset: keyOffset)
        audio.setVoiceType(voiceType)
        syncEngineParameters()
        resetSessionEchoDelay()

        shouldPersistSessions = true
    }

    var scaleIntervals: [Int] {
        ScaleMode.scaleIntervals(for: selectedMode)
    }

    var keyName: String {
        keyLabels[((keyOffset % keyLabels.count) + keyLabels.count) % keyLabels.count]
    }

    var currentRecordingNotes: Int {
        evolutionEngine.currentRecordingNoteCount
    }

    func setMode(_ mode: ScaleMode) {
        selectedMode = mode
        evolutionEngine.setScale(mode: mode.rawValue, keyOffset: keyOffset)
        status = "\(keyName) \(modeName(mode))"
    }

    func setKeyOffset(_ offset: Int) {
        keyOffset = offset
        evolutionEngine.setScale(mode: selectedMode.rawValue, keyOffset: offset)
        status = "\(keyName) \(modeName(selectedMode))"
    }

    func setVoiceType(_ type: CreationVoiceType) {
        cancelInteractionTasks()
        stopPlayback()
        isEvolving = false
        voiceType = type
        audio.setVoiceType(type)
        status = type.label
    }

    func beginNote(midi: Int, velocity: Float, position: CGPoint, timestamp: TimeInterval) -> Int {
        globalNoteCounter += 1
        let shapedVelocity = max(0.04, min(0.92, velocity * expressionScalar))
        let pan = pan(for: position)
        status = noteName(midi)

        switch repeatMode {
        case .off:
            let voiceID = audio.trigger(midi: midi, velocity: shapedVelocity, pan: pan, held: true)
            if voiceID >= 0 {
                liveVoiceStartTimes[voiceID] = CACurrentMediaTime()
                if isRecording {
                    evolutionEngine.recordNote(
                        pitch: midi,
                        velocity: shapedVelocity,
                        position: position,
                        voiceID: voiceID,
                        timestamp: timestamp
                    )
                }
            }
            return voiceID
        case .on, .drift:
            _ = audio.trigger(midi: midi, velocity: shapedVelocity, pan: pan, held: false, allowSelfEcho: false)
            if isRecording {
                evolutionEngine.recordNote(
                    pitch: midi,
                    velocity: shapedVelocity,
                    position: position,
                    voiceID: -1,
                    timestamp: timestamp
                )
            }
            scheduleInteractionEcho(
                for: midi,
                velocity: shapedVelocity,
                position: position,
                interactionMode: interactionMode
            )
            return -1
        }
    }

    func glideNote(voiceID: Int, midi: Int, position: CGPoint) {
        guard voiceID >= 0 else { return }
        audio.retrigger(voiceID: voiceID, midi: midi, velocity: 0.5)
        guard evolutionEngine.isRecording, evolutionEngine.recordingStartTime != 0 else { return }
        let relativeTime = max(0, CACurrentMediaTime() - evolutionEngine.recordingStartTime)
        evolutionEngine.appendRecordingNote(PhraseNote(
            pitch: midi,
            velocity: 0.5,
            relativeTime: relativeTime,
            duration: 0.03,
            position: position
        ))
    }

    func retriggerNote(voiceID: Int, midi: Int, velocity: Float, position: CGPoint) {
        guard voiceID >= 0 else { return }
        audio.retrigger(voiceID: voiceID, midi: midi, velocity: velocity)
        guard isRecording else { return }
        evolutionEngine.recordNote(
            pitch: midi,
            velocity: velocity,
            position: position,
            voiceID: voiceID
        )
    }

    func endNote(voiceID: Int) {
        guard voiceID >= 0 else { return }
        let startedAt = liveVoiceStartTimes[voiceID] ?? CACurrentMediaTime()
        let elapsed = CACurrentMediaTime() - startedAt
        let endStyle = CreationPlaybackBehavior.noteEndStyle(
            noteDuration: elapsed,
            prefersNaturalDecayPlayback: voiceType == .feltPiano && repeatMode == .off
        )

        if isSustainActive {
            deferredSustainVoiceIDs[voiceID] = endStyle
            liveVoiceStartTimes.removeValue(forKey: voiceID)
            return
        }

        audio.endVoice(voiceID: voiceID, style: endStyle)
        liveVoiceStartTimes.removeValue(forKey: voiceID)
        evolutionEngine.finishRecordedNote(voiceID: voiceID)
    }

    func setSustainActive(_ isActive: Bool) {
        guard isSustainActive != isActive else { return }
        isSustainActive = isActive
        guard !isActive else { return }

        let deferred = deferredSustainVoiceIDs
        deferredSustainVoiceIDs.removeAll()
        for (voiceID, endStyle) in deferred {
            audio.endVoice(voiceID: voiceID, style: endStyle)
            evolutionEngine.finishRecordedNote(voiceID: voiceID)
        }
        audio.silence()
    }

    func resetExpression() {
        isExpressionActive = false
        expressionScalar = 1
    }

    func setExpressionScalar(_ value: Float) {
        let clampedValue = max(0.15, min(1.0, value))
        expressionScalar = clampedValue
        isExpressionActive = clampedValue < 0.995
    }

    func releaseAllNotes() {
        audio.releaseAll()
    }

    func prepareAudio() {
        audio.start()
    }

    func updatePointerNote(at location: CGPoint, in size: CGSize) {
        lastCanvasSize = size
        let clampedLocation = CGPoint(
            x: max(0, min(size.width, location.x)),
            y: max(0, min(size.height, location.y))
        )
        let midi = pitchForPoint(clampedLocation, size: size)
        let now = CACurrentMediaTime()

        guard let activeVoiceID = activePointerVoiceID, let activeMIDI = activePointerMIDI else {
            beginPointerNote(midi: midi, location: clampedLocation, size: size, now: now)
            return
        }

        guard midi != activeMIDI, now - pointerLastTransitionTime >= 0.06 else { return }
        if activeVoiceID >= 0, repeatMode == .off {
            glideNote(voiceID: activeVoiceID, midi: midi, position: clampedLocation)
            activePointerMIDI = midi
            pointerLastTransitionTime = now
            spawnPointerVisual(at: clampedLocation, velocity: pointerVelocity(at: clampedLocation, in: size))
        } else {
            beginPointerNote(midi: midi, location: clampedLocation, size: size, now: now)
        }
    }

    func endPointerNote() {
        if let voiceID = activePointerVoiceID {
            endNote(voiceID: voiceID)
        }
        activePointerVoiceID = nil
        activePointerMIDI = nil
        releaseAllNotes()
    }

    private func beginPointerNote(midi: Int, location: CGPoint, size: CGSize, now: CFTimeInterval) {
        let velocity = pointerVelocity(at: location, in: size)
        let voiceID = beginNote(midi: midi, velocity: velocity, position: location, timestamp: now)
        activePointerVoiceID = voiceID
        activePointerMIDI = midi
        pointerLastTransitionTime = now
        spawnPointerVisual(at: location, velocity: velocity)
    }

    private func pointerVelocity(at location: CGPoint, in size: CGSize) -> Float {
        let normalizedY = 1 - location.y / max(size.height, 1)
        return Float(max(0.32, min(0.92, 0.42 + normalizedY * 0.42)))
    }

    private func spawnPointerVisual(at location: CGPoint, velocity: Float) {
        pendingCanvasSpawns.append(ExternalNoteSpawn(
            position: location,
            velocity: velocity,
            interactionMode: interactionMode
        ))
    }

    func toggleRecording() {
        if isRecording {
            cancelInteractionTasks()
            if evolutionEngine.isOverdubbing {
                _ = evolutionEngine.stopOverdubRecording()
            } else {
                _ = evolutionEngine.stopRecording()
            }
            phrases = evolutionEngine.phrases
            isRecording = false
            showTimeline = true
            status = "Captured \(phrases.count)"
            return
        }

        cancelInteractionTasks()
        stopPlayback()
        audio.start()
        evolutionEngine.startRecording()
        isRecording = true
        showTimeline = false
        status = "Recording"
    }

    func togglePlayback() {
        isPlaying ? stopPlayback() : startPlayback()
    }

    func startPlayback() {
        let initialPhraseIndexes = CreationTimelinePlaybackPlan.phraseIndexes(
            phraseCount: phrases.count,
            startingAt: selectedPhraseIndex
        )
        let loopPhraseIndexes = CreationTimelinePlaybackPlan.loopPhraseIndexes(phraseCount: phrases.count)
        let hasPlayablePhrase = (initialPhraseIndexes + loopPhraseIndexes).contains { index in
            index < phrases.count && !phrases[index].notes.isEmpty
        }
        guard hasPlayablePhrase else {
            status = "Record first"
            return
        }

        cancelInteractionTasks()
        cancelPlaybackTimers()
        audio.start()
        isPlaying = true
        status = isEvolving ? evolutionTargetDescription : "Playing"
        playbackTask = Task { @MainActor [weak self] in
            await self?.runTimelinePlayback(initialPhraseIndexes: initialPhraseIndexes, loopPhraseIndexes: loopPhraseIndexes)
        }
    }

    func stopPlayback() {
        cancelPlaybackTimers()
        audio.silence()
        isPlaying = false
        resetPlaybackIndicators()
        status = "Stopped"
    }

    private func cancelPlaybackTimers() {
        playbackTask?.cancel()
        playbackTask = nil
        cancelInteractionEchoes()
        noteReleaseTasks.forEach { $0.cancel() }
        noteReleaseTasks.removeAll()
    }

    private func cancelInteractionTasks() {
        cancelInteractionEchoes()
        noteReleaseTasks.forEach { $0.cancel() }
        noteReleaseTasks.removeAll()
        deferredSustainVoiceIDs.removeAll()
        liveVoiceStartTimes.removeAll()
        isSustainActive = false
        resetExpression()
        audio.silence()
    }

    private func resetPlaybackIndicators() {
        playbackHighlightTask?.cancel()
        playbackHighlightTask = nil
        activePlaybackIndex = nil
        playheadProgress = 0
        playbackHighlightState = .inactive
    }

    func toggleEvolution() {
        if isEvolving {
            isEvolving = false
            status = "Evolution off"
            return
        }

        guard !phrases.isEmpty else {
            status = "Record first"
            return
        }

        isEvolving = true
        status = evolutionTargetDescription
        if !isPlaying {
            startPlayback()
        }
    }

    func clear() {
        cancelInteractionTasks()
        stopPlayback()
        evolutionEngine.clearAll()
        phrases = []
        isRecording = false
        isEvolving = false
        showTimeline = true
        selectedPhraseIndex = nil
        status = "Cleared"
    }

    func togglePhraseSelection(_ index: Int) {
        selectedPhraseIndex = selectedPhraseIndex == index ? nil : index
    }

    func updatePhraseKey(index: Int, keyOffset: Int) {
        evolutionEngine.setPhraseKey(at: index, keyOffset: keyOffset)
        phrases = evolutionEngine.phrases
        selectedPhraseIndex = index
    }

    func updatePhraseMode(index: Int, mode: Int) {
        evolutionEngine.setPhraseMode(at: index, mode: mode)
        phrases = evolutionEngine.phrases
        selectedPhraseIndex = index
    }

    func deletePhrase(at index: Int) {
        guard phrases.indices.contains(index) else { return }
        evolutionEngine.deletePhrase(id: phrases[index].id)
        phrases = evolutionEngine.phrases
        if selectedPhraseIndex == index {
            selectedPhraseIndex = nil
        } else if let selectedPhraseIndex, selectedPhraseIndex > index {
            self.selectedPhraseIndex = selectedPhraseIndex - 1
        }
        status = "Deleted phrase"
    }

    func startOverdub(phraseIndex: Int) {
        guard phrases.indices.contains(phraseIndex) else { return }

        cancelInteractionTasks()
        stopPlayback()
        audio.start()

        let phrase = phrases[phraseIndex]
        keyOffset = phrase.keyOffset
        selectedMode = SoundLabTheory.normalizedCreationMode(rawValue: phrase.mode)
        evolutionEngine.setScale(mode: selectedMode.rawValue, keyOffset: keyOffset)

        let playbackStart = CACurrentMediaTime()
        evolutionEngine.startOverdubRecording(phraseIndex: phraseIndex, startTime: playbackStart)
        isRecording = true
        showTimeline = false
        selectedPhraseIndex = phraseIndex
        status = "Overdubbing \(phrase.label)"

        playbackTask = Task { @MainActor [weak self] in
            guard let self else { return }
            var carryOver: [(releaseTime: Double, voiceID: Int)] = []
            defer {
                self.releaseCarryOverVoices(carryOver)
                self.resetPlaybackIndicators()
                self.playbackTask = nil
            }
            try? await self.playPhraseWithPlayhead(phrase, index: phraseIndex, carryOver: &carryOver)
        }
    }

    func saveSession() {
        let existingNames = Set(sessions.map(\.name))
        let session = currentSessionSnapshot(name: CreationSession.nextDraftName(existingNames: existingNames))
        sessions.insert(session, at: 0)
        status = "Saved \(session.name)"
    }

    func loadSession(_ session: CreationSession) {
        stopPlayback()
        applySession(session, statusMessage: "Loaded \(session.name)")
    }

    func clearSessions() {
        sessions.removeAll()
        status = "Sessions cleared"
    }

    func exportCurrentSession(loop: Bool = false) {
        guard !phrases.isEmpty else {
            status = "Record first"
            return
        }
        guard !isExporting else { return }

        let session = currentSessionSnapshot(name: "Desktop Export")
        let duration = max(24, min(180, phrases.reduce(0.0) { $0 + $1.playbackDuration } * 4))
        isExporting = true
        status = loop ? "Exporting loop" : "Exporting WAV"

        Task { @MainActor [weak self] in
            do {
                let url = try await Task.detached(priority: .userInitiated) {
                    if loop {
                        return try SoundLabAudioExporter.exportSeamlessLoop(
                            session: session,
                            quality: .medium
                        )
                    }

                    return try SoundLabAudioExporter.exportCreationSession(
                        session: session,
                        durationSeconds: duration,
                        quality: .medium
                    )
                }.value

                self?.lastExportURL = url
                self?.isExporting = false
                self?.status = "Exported \(url.lastPathComponent)"
            } catch {
                self?.isExporting = false
                self?.status = "Export failed"
            }
        }
    }

    func exportCurrentSessionData() {
        guard !phrases.isEmpty else {
            status = "Record first"
            return
        }

        let session = currentSessionSnapshot(name: "Desktop Session")
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.json]
        panel.canCreateDirectories = true
        panel.nameFieldStringValue = "\(safeFileName(for: session.name)).json"
        panel.begin { [weak self] response in
            guard response == .OK, let url = panel.url else { return }
            Task { @MainActor [weak self] in
                self?.writeSessionData(session, to: url)
            }
        }
    }

    func importSessionData() {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [.json]
        panel.allowsMultipleSelection = true
        panel.canChooseDirectories = false
        panel.begin { [weak self] response in
            guard response == .OK else { return }
            let urls = panel.urls
            Task { @MainActor [weak self] in
                self?.importSessions(from: urls)
            }
        }
    }

    func revealLastExport() {
        guard let lastExportURL else { return }
        NSWorkspace.shared.activateFileViewerSelecting([lastExportURL])
    }

    func revealLastDataExport() {
        guard let lastDataExportURL else { return }
        NSWorkspace.shared.activateFileViewerSelecting([lastDataExportURL])
    }

    func openVisualizerWindow(startPlayback shouldStartPlayback: Bool = false) {
        if let window = visualizerWindowController?.window {
            presentVisualizerWindow(window)
            if shouldStartPlayback && !isPlaying {
                startPlayback()
            }
            return
        }

        let hostingController = NSHostingController(
            rootView: ActualSoundLabVisualizerWindow(store: self)
        )
        let window = NSWindow(contentViewController: hostingController)
        window.title = "Visualizer"
        window.styleMask = [.borderless, .resizable, .fullSizeContentView]
        window.backgroundColor = .clear
        window.isOpaque = false
        window.isReleasedWhenClosed = false
        window.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        window.level = .screenSaver

        let controller = NSWindowController(window: window)
        visualizerWindowController = controller
        controller.showWindow(nil)
        presentVisualizerWindow(window)
        if shouldStartPlayback && !isPlaying {
            startPlayback()
        }
    }

    func closeVisualizerWindow() {
        visualizerWindowController?.close()
        visualizerWindowController = nil
    }

    private func presentVisualizerWindow(_ window: NSWindow) {
        let frame = NSScreen.main?.frame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        window.setFrame(frame, display: true)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func binding<T>(_ keyPath: ReferenceWritableKeyPath<ActualSoundLabStore, T>) -> Binding<T> {
        Binding(
            get: { self[keyPath: keyPath] },
            set: { self[keyPath: keyPath] = $0 }
        )
    }

    private func applySession(_ session: CreationSession, statusMessage: String) {
        selectedMode = ScaleMode(rawValue: session.mode) ?? .lydian
        keyOffset = session.keyOffset
        voiceType = CreationVoiceType(rawValue: session.voiceType ?? CreationVoiceType.etherealPiano.rawValue) ?? .etherealPiano
        interactionMode = session.interactionMode
        repeatMode = session.repeatMode
        toneReverbMix = session.reverbMix
        toneDelayFeedback = session.delayFeedback
        padDelayMix = session.delayMix
        toneMainGain = session.mainGain
        mutationRate = session.mutationRate
        echoInterval = session.echoInterval
        scaleLock = session.scaleLock
        spacePreDelay = session.preDelayTime ?? spacePreDelay
        spaceDecay = session.rvbDecay ?? spaceDecay
        spaceDamping = session.rvbDamping ?? spaceDamping
        spaceBody = session.voiceBody ?? spaceBody
        echoTempo = session.echoTempo ?? echoTempo
        echoRepeatCount = session.echoRepeatCount ?? echoRepeatCount
        isEvolving = session.evolveOnPlayback ?? false
        phrases = session.phrases.map { RecordedPhrase(from: $0) }
        evolutionEngine.setScale(mode: selectedMode.rawValue, keyOffset: keyOffset)
        evolutionEngine.setPhrases(phrases)
        audio.setVoiceType(voiceType)
        syncEngineParameters()
        selectedSection = .canvas
        status = statusMessage
    }

    private func writeSessionData(_ session: CreationSession, to url: URL) {
        do {
            let data = try ActualSoundLabSessionJSON.encoder().encode(session)
            try data.write(to: url, options: .atomic)
            lastDataExportURL = url
            status = "Exported \(url.lastPathComponent)"
        } catch {
            status = "Data export failed"
        }
    }

    private func importSessions(from urls: [URL]) {
        guard !urls.isEmpty else { return }

        var imported: [CreationSession] = []
        for url in urls {
            let scoped = url.startAccessingSecurityScopedResource()
            defer {
                if scoped {
                    url.stopAccessingSecurityScopedResource()
                }
            }

            do {
                let data = try Data(contentsOf: url)
                imported.append(contentsOf: try Self.decodeSessionData(data))
            } catch {
                status = "Import failed"
                NSLog("NeurimaSoundLab session import failed for \(url.lastPathComponent): \(error)")
                return
            }
        }

        guard !imported.isEmpty else {
            status = "No sessions found"
            return
        }

        var existingNames = Set(sessions.map(\.name))
        var existingIDs = Set(sessions.map(\.id))
        let resolved = imported.map { session in
            resolvedImportedSession(
                session,
                existingNames: &existingNames,
                existingIDs: &existingIDs
            )
        }

        sessions.insert(contentsOf: resolved, at: 0)
        applySession(resolved[0], statusMessage: "Imported \(resolved.count)")
    }

    private static func decodeSessionData(_ data: Data) throws -> [CreationSession] {
        try ActualSoundLabSessionJSON.decodeSessions(from: data)
    }

    private func resolvedImportedSession(
        _ session: CreationSession,
        existingNames: inout Set<String>,
        existingIDs: inout Set<UUID>
    ) -> CreationSession {
        var resolved = session
        if existingIDs.contains(resolved.id) {
            resolved.id = UUID()
        }
        resolved.name = uniqueSessionName(
            preferred: resolved.name.isEmpty ? "Imported Session" : resolved.name,
            existingNames: existingNames
        )
        existingIDs.insert(resolved.id)
        existingNames.insert(resolved.name)
        return resolved
    }

    private func uniqueSessionName(preferred: String, existingNames: Set<String>) -> String {
        let trimmed = preferred.trimmingCharacters(in: .whitespacesAndNewlines)
        let base = trimmed.isEmpty ? "Imported Session" : trimmed
        guard existingNames.contains(base) else { return base }

        var counter = 2
        while existingNames.contains("\(base) \(counter)") {
            counter += 1
        }
        return "\(base) \(counter)"
    }

    private func safeFileName(for rawName: String) -> String {
        let trimmed = rawName.trimmingCharacters(in: .whitespacesAndNewlines)
        let base = trimmed.isEmpty ? "SoundLab-Session" : trimmed
        let illegal = CharacterSet(charactersIn: "/\\?%*|\"<>:")
        return base
            .components(separatedBy: illegal)
            .joined(separator: "-")
    }

    private func currentSessionSnapshot(name: String) -> CreationSession {
        CreationSession(
            name: name,
            mode: selectedMode.rawValue,
            keyOffset: keyOffset,
            phrases: phrases.map { $0.serialized() },
            reverbMix: toneReverbMix,
            delayFeedback: toneDelayFeedback,
            delayMix: padDelayMix,
            mainGain: toneMainGain,
            mutationRate: mutationRate,
            echoInterval: echoInterval,
            scaleLock: scaleLock,
            voiceType: voiceType.rawValue,
            interactionMode: interactionMode,
            repeatMode: repeatMode,
            preDelayTime: spacePreDelay,
            rvbDecay: spaceDecay,
            rvbDamping: spaceDamping,
            voiceBody: spaceBody,
            echoTempo: echoTempo,
            echoRepeatCount: echoRepeatCount,
            evolveOnPlayback: isEvolving,
            useNaturalDecayPlayback: voiceType == .feltPiano
        )
    }

    private func runTimelinePlayback(initialPhraseIndexes: [Int], loopPhraseIndexes: [Int]) async {
        var carryOver: [(releaseTime: Double, voiceID: Int)] = []
        var currentPhraseIndexes = initialPhraseIndexes
        defer {
            releaseCarryOverVoices(carryOver)
            isPlaying = false
            resetPlaybackIndicators()
            status = "Playback complete"
        }

        do {
            while !Task.isCancelled {
                for index in currentPhraseIndexes {
                    try Task.checkCancellation()
                    guard index < phrases.count else { continue }
                    guard let phrase = phraseForTimelinePlayback(at: index) else { continue }
                    guard !phrase.notes.isEmpty else { continue }
                    try await playPhraseWithPlayhead(phrase, index: index, carryOver: &carryOver)
                }
                currentPhraseIndexes = loopPhraseIndexes
            }
        } catch {
            resetPlaybackIndicators()
        }
    }

    private func phraseForTimelinePlayback(at index: Int) -> RecordedPhrase? {
        guard phrases.indices.contains(index) else { return nil }
        guard isEvolving else { return phrases[index] }
        guard shouldEvolvePhrase(at: index) else { return phrases[index] }

        let evolvedIndexes = evolutionEngine.evolvePhrasesInPlace(at: [index])
        if !evolvedIndexes.isEmpty {
            phrases = evolutionEngine.phrases
        }

        guard phrases.indices.contains(index) else { return nil }
        return phrases[index]
    }

    private var evolutionTargetDescription: String {
        if let selectedPhraseIndex, phrases.indices.contains(selectedPhraseIndex) {
            return "Evolving Phrase \(selectedPhraseIndex + 1)"
        }
        return "Evolving arrangement"
    }

    private func shouldEvolvePhrase(at index: Int) -> Bool {
        guard let selectedPhraseIndex, phrases.indices.contains(selectedPhraseIndex) else {
            return true
        }
        return index == selectedPhraseIndex
    }

    private func playPhraseWithPlayhead(
        _ phrase: RecordedPhrase,
        index: Int,
        carryOver: inout [(releaseTime: Double, voiceID: Int)]
    ) async throws {
        let notes = phrase.notes.sorted { $0.relativeTime < $1.relativeTime }
        let phraseDuration = phrase.playbackDuration

        beginPhrasePlayback(at: index)
        releaseCarryOverVoices(carryOver)
        carryOver.removeAll()

        carryOver = try await playPhraseNotes(
            notes: notes,
            phraseDuration: phraseDuration,
            playbackIndex: index,
            canvasWidth: max(lastCanvasSize.width, 1),
            width: stereoWidth,
            interactionMode: interactionMode,
            prefersNaturalDecayPlayback: voiceType == .feltPiano
        )
        setPlayheadProgress(1, for: index)
        await Task.yield()
    }

    private func releaseCarryOverVoices(_ carryOver: [(releaseTime: Double, voiceID: Int)]) {
        for release in carryOver {
            audio.release(voiceID: release.voiceID)
        }
    }

    func updateCanvasSize(_ size: CGSize) {
        lastCanvasSize = size
    }

    private func beginPhrasePlayback(at index: Int) {
        startPlaybackHighlightTransition(from: activePlaybackIndex, to: index)
        activePlaybackIndex = index
        playheadProgress = 0
    }

    private func setPlayheadProgress(_ progress: Double, for index: Int) {
        guard activePlaybackIndex == index else { return }
        playheadProgress = progress
    }

    private func startPlaybackHighlightTransition(from previousHighlightIndex: Int?, to index: Int) {
        playbackHighlightTask?.cancel()
        playbackHighlightTask = nil

        let trailingIndex = previousHighlightIndex == index ? nil : previousHighlightIndex
        playbackHighlightState = SoundLabPlaybackHighlightState(
            activeIndex: index,
            trailingIndex: trailingIndex,
            transitionProgress: 0
        )

        withAnimation(.easeInOut(duration: 0.28)) {
            playbackHighlightState = SoundLabPlaybackHighlightState(
                activeIndex: index,
                trailingIndex: trailingIndex,
                transitionProgress: 1
            )
        }

        guard let trailingIndex else { return }
        playbackHighlightTask = Task { @MainActor [weak self] in
            try? await Task.sleep(for: .milliseconds(280))
            guard !Task.isCancelled else { return }
            if self?.playbackHighlightState.activeIndex == index,
               self?.playbackHighlightState.trailingIndex == trailingIndex {
                self?.playbackHighlightState = SoundLabPlaybackHighlightState(
                    activeIndex: index,
                    trailingIndex: nil,
                    transitionProgress: self?.playbackHighlightState.transitionProgress ?? 1
                )
            }
            self?.playbackHighlightTask = nil
        }
    }

    private func playPhraseNotes(
        notes: [PhraseNote],
        phraseDuration: Double,
        playbackIndex: Int,
        canvasWidth: CGFloat,
        width: Float,
        interactionMode: CreationInteractionMode,
        prefersNaturalDecayPlayback: Bool
    ) async throws -> [(releaseTime: Double, voiceID: Int)] {
        try Task.checkCancellation()

        let flag = PlaybackCancellationFlag()
        let audioHost = audio
        return try await withTaskCancellationHandler {
            try await Task.detached(priority: .userInitiated) { [weak self] in
                guard let self else { return [] }

                let startTime = CACurrentMediaTime()
                var nextNoteIndex = 0
                var pendingVoiceEnds: [PendingPhraseVoiceEnd] = []
                var lastProgressUpdate = -Double.greatestFiniteMagnitude

                func elapsedSeconds() -> Double {
                    CACurrentMediaTime() - startTime
                }

                while true {
                    if flag.isCancelled { throw CancellationError() }
                    let elapsedSecs = elapsedSeconds()
                    var batchedSpawns: [ExternalNoteSpawn] = []

                    while nextNoteIndex < notes.count && notes[nextNoteIndex].relativeTime <= elapsedSecs {
                        let note = notes[nextNoteIndex]
                        nextNoteIndex += 1

                        let isGlideWaypoint = note.duration <= 0.05
                        if isGlideWaypoint, let lastEnd = pendingVoiceEnds.last {
                            audioHost.retriggerFrequency(
                                voiceID: lastEnd.voiceID,
                                frequency: soundLabFrequency(for: note.pitch),
                                velocity: note.velocity
                            )
                            continue
                        }

                        let endStyle = CreationPlaybackBehavior.noteEndStyle(
                            noteDuration: note.playbackDuration,
                            prefersNaturalDecayPlayback: prefersNaturalDecayPlayback
                        )
                        let normalizedPan = Float(note.position.x / max(canvasWidth, 1)) * 1.2 - 0.6
                        let pan = max(Float(-0.8), min(0.8, normalizedPan)) * width
                        let voiceID = audioHost.triggerFrequency(
                            frequency: soundLabFrequency(for: note.pitch),
                            velocity: note.velocity,
                            pan: pan,
                            held: true
                        )

                        if voiceID >= 0 {
                            pendingVoiceEnds.append(PendingPhraseVoiceEnd(
                                releaseTime: note.relativeTime + note.playbackDuration,
                                voiceID: voiceID,
                                endStyle: endStyle
                            ))
                        }

                        batchedSpawns.append(ExternalNoteSpawn(
                            position: note.position,
                            velocity: note.velocity,
                            interactionMode: interactionMode
                        ))
                    }

                    if !batchedSpawns.isEmpty {
                        let spawns = batchedSpawns
                        Task { @MainActor [weak self] in
                            self?.pendingCanvasSpawns.append(contentsOf: spawns)
                        }
                    }

                    var releaseIndex = 0
                    while releaseIndex < pendingVoiceEnds.count {
                        if pendingVoiceEnds[releaseIndex].releaseTime <= elapsedSecs {
                            audioHost.endVoice(
                                voiceID: pendingVoiceEnds[releaseIndex].voiceID,
                                style: pendingVoiceEnds[releaseIndex].endStyle
                            )
                            pendingVoiceEnds.remove(at: releaseIndex)
                        } else {
                            releaseIndex += 1
                        }
                    }

                    let shouldUpdate = elapsedSecs - lastProgressUpdate >= 1.0 / 30.0
                        || elapsedSecs >= phraseDuration
                    if shouldUpdate {
                        lastProgressUpdate = elapsedSecs
                        let progress = min(elapsedSecs / phraseDuration, 1.0)
                        await MainActor.run {
                            self.setPlayheadProgress(progress, for: playbackIndex)
                        }
                    }

                    if elapsedSecs >= phraseDuration && nextNoteIndex >= notes.count {
                        break
                    }

                    usleep(1_000)
                }

                return pendingVoiceEnds.map {
                    (releaseTime: $0.releaseTime, voiceID: $0.voiceID)
                }
            }.value
        } onCancel: {
            flag.isCancelled = true
        }
    }

    private func handleRepeatModeChanged() {
        cancelInteractionTasks()
        resetSessionEchoDelay()
    }

    private func resetSessionEchoDelay() {
        sessionEchoDelay = repeatMode == .drift
            ? echoTempo + Double.random(in: -1.5...3.0)
            : echoTempo
        globalNoteCounter = 0
    }

    private func cancelInteractionEchoes() {
        pendingEchoEvents.removeAll()
        echoTimer?.cancel()
        echoTimer = nil
    }

    private func scheduleInteractionEcho(
        for midiNote: Int,
        velocity: Float,
        position: CGPoint,
        interactionMode: CreationInteractionMode,
        playCount: Int = 0,
        birthNoteCount: Int? = nil
    ) {
        guard !isPlaying else { return }
        guard repeatMode == .on || repeatMode == .drift else { return }
        guard playCount < echoRepeatCount else { return }

        let maxActiveNotes = 15
        let birth = birthNoteCount ?? globalNoteCounter
        if globalNoteCounter > maxActiveNotes && birth <= globalNoteCounter - maxActiveNotes {
            return
        }

        let delay: Double
        switch repeatMode {
        case .on:
            delay = sessionEchoDelay
        case .drift:
            delay = sessionEchoDelay + Double.random(in: 0...0.25) * Double(playCount)
        case .off:
            return
        }

        pendingEchoEvents.append(PendingEchoEvent(
            fireTime: CACurrentMediaTime() + max(delay, 0.05),
            note: midiNote,
            velocity: velocity,
            position: position,
            interactionMode: interactionMode,
            playCount: playCount,
            birthNoteCount: birth
        ))
        ensureEchoTimerRunning()
    }

    private func ensureEchoTimerRunning() {
        guard echoTimer == nil else { return }
        echoTimer = Self.makeEchoTimer { [weak self] in
            guard let self else { return }
            self.processEchoEvents()
            if self.pendingEchoEvents.isEmpty {
                self.echoTimer?.cancel()
                self.echoTimer = nil
            }
        }
    }

    nonisolated private static func makeEchoTimer(
        mainCallback: @escaping @MainActor () -> Void
    ) -> DispatchSourceTimer {
        let timer = DispatchSource.makeTimerSource(queue: .global(qos: .userInteractive))
        timer.schedule(deadline: .now(), repeating: 1.0 / 120.0)
        timer.setEventHandler {
            DispatchQueue.main.async {
                mainCallback()
            }
        }
        timer.resume()
        return timer
    }

    private func processEchoEvents() {
        let now = CACurrentMediaTime()
        let maxPlays = max(echoRepeatCount, 1)
        let maxActiveNotes = 15

        var index = 0
        while index < pendingEchoEvents.count {
            let event = pendingEchoEvents[index]
            guard event.fireTime <= now else {
                index += 1
                continue
            }

            pendingEchoEvents.remove(at: index)
            guard repeatMode == .on || repeatMode == .drift else { continue }
            if globalNoteCounter > maxActiveNotes && event.birthNoteCount <= globalNoteCounter - maxActiveNotes {
                continue
            }

            let noteAge = Float(globalNoteCounter - event.birthNoteCount)
            let activityFactor = max(0, Float(maxActiveNotes) - noteAge) / Float(maxActiveNotes)
            let playFactor = max(0, Float(maxPlays - event.playCount)) / Float(maxPlays)
            let echoVelocity = event.velocity * (activityFactor + playFactor) * 0.5
            guard echoVelocity > 0.05 else { continue }

            _ = audio.trigger(
                midi: event.note,
                velocity: echoVelocity,
                pan: pan(for: event.position),
                held: false,
                allowSelfEcho: false
            )
            evolutionEngine.recordNoteDeduped(
                pitch: event.note,
                velocity: echoVelocity,
                position: event.position
            )
            pendingCanvasSpawns.append(ExternalNoteSpawn(
                position: event.position,
                velocity: echoVelocity,
                interactionMode: event.interactionMode
            ))

            scheduleInteractionEcho(
                for: event.note,
                velocity: event.velocity,
                position: event.position,
                interactionMode: event.interactionMode,
                playCount: event.playCount + 1,
                birthNoteCount: event.birthNoteCount
            )
        }
    }

    private func syncEngineParameters() {
        audio.configure(
            reverbMix: toneReverbMix,
            delayFeedback: toneDelayFeedback,
            delayMix: padDelayMix,
            mainGain: toneMainGain * liveOutputGain,
            preDelay: spacePreDelay,
            decay: spaceDecay,
            damping: spaceDamping,
            body: spaceBody
        )
    }

    private func pitchForPoint(_ point: CGPoint, size: CGSize) -> Int {
        let normalizedY = 1.0 - max(0, min(1, point.y / max(size.height, 1)))
        let rawMidi = Int(48 + normalizedY * 42)
        let rootPitchClass = (9 + keyOffset) % 12
        let noteClass = ((rawMidi - rootPitchClass) % 12 + 12) % 12
        let octaveBase = rawMidi - noteClass
        var bestInterval = scaleIntervals[0]
        var bestDistance = 12

        for interval in scaleIntervals {
            let distance = min(abs(noteClass - interval), 12 - abs(noteClass - interval))
            if distance < bestDistance {
                bestDistance = distance
                bestInterval = interval
            }
        }

        return octaveBase + bestInterval
    }

    private func pan(for position: CGPoint) -> Float {
        let normalizedPan = Float(position.x / max(lastCanvasSize.width, 1)) * 1.2 - 0.6
        return max(Float(-0.8), min(0.8, normalizedPan)) * stereoWidth
    }

    private func noteName(_ midiNote: Int) -> String {
        let names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        let normalized = ((midiNote % 12) + 12) % 12
        return names[normalized]
    }

    private func modeName(_ mode: ScaleMode) -> String {
        switch mode {
        case .minor: return "Minor"
        case .dorian: return "Dorian"
        case .phrygian: return "Phrygian"
        case .lydian: return "Lydian"
        case .mixolydian: return "Mixolydian"
        case .wholeTone: return "Whole Tone"
        case .octatonic: return "Octatonic"
        case .major: return "Major"
        case .locrian: return "Locrian"
        case .harmonicMinor: return "Harmonic Minor"
        case .melodicMinor: return "Melodic Minor"
        case .minorPentatonic: return "Minor Pentatonic"
        case .hungarian: return "Hungarian"
        case .chromatic: return "Chromatic"
        case .majorPentatonic: return "Major Pentatonic"
        case .harmonicMajor: return "Harmonic Major"
        }
    }
}

private final class ActualSoundLabAudioHost: @unchecked Sendable {
    private let engine = AVAudioEngine()
    private var synth: CreationSynthEngine?
    private var sourceNode: AVAudioSourceNode?
    private let renderBufferSize = 4_096
    private var renderBufferL: UnsafeMutablePointer<Float>?
    private var renderBufferR: UnsafeMutablePointer<Float>?
    private var voiceType: CreationVoiceType = .etherealPiano
    private var reverbMix: Float = 0.22
    private var delayFeedback: Float = 0.25
    private var delayMix: Float = 0.25
    private var mainGain: Float = 1.8
    private var preDelay: Float = 0.035
    private var decay: Float = 0.72
    private var damping: Float = 0.62
    private var body: Float = 0.55

    deinit {
        engine.stop()
        if let sourceNode {
            engine.detach(sourceNode)
        }
        renderBufferL?.deallocate()
        renderBufferR?.deallocate()
    }

    func start() {
        guard !engine.isRunning else { return }

        if sourceNode == nil {
            guard configureGraph() else {
                return
            }
        }

        do {
            engine.prepare()
            try engine.start()
        } catch {
            NSSound.beep()
        }
    }

    private func configureGraph() -> Bool {
        let outputFormat = engine.outputNode.outputFormat(forBus: 0)
        let nativeSampleRate = outputFormat.sampleRate > 0 ? outputFormat.sampleRate : 44_100
        let synthEngine = CreationSynthEngine(sampleRate: Float(nativeSampleRate), voiceType: voiceType)
        self.synth = synthEngine
        applyConfiguration(to: synthEngine)

        guard let format = AVAudioFormat(
            commonFormat: .pcmFormatFloat32,
            sampleRate: nativeSampleRate,
            channels: 2,
            interleaved: false
        ) else {
            NSSound.beep()
            return false
        }

        let buffers = allocateRenderBuffers()
        let node = AVAudioSourceNode(
            format: format,
            renderBlock: Self.makeRenderBlock(
                synthEngine: synthEngine,
                tempL: buffers.left,
                tempR: buffers.right,
                bufferSize: renderBufferSize
            )
        )
        sourceNode = node
        engine.attach(node)
        engine.connect(node, to: engine.mainMixerNode, format: format)
        return true
    }

    private func allocateRenderBuffers() -> (
        left: UnsafeMutablePointer<Float>,
        right: UnsafeMutablePointer<Float>
    ) {
        renderBufferL?.deallocate()
        renderBufferR?.deallocate()

        let left = UnsafeMutablePointer<Float>.allocate(capacity: renderBufferSize)
        let right = UnsafeMutablePointer<Float>.allocate(capacity: renderBufferSize)
        left.initialize(repeating: 0, count: renderBufferSize)
        right.initialize(repeating: 0, count: renderBufferSize)
        renderBufferL = left
        renderBufferR = right
        return (left, right)
    }

    private static func makeRenderBlock(
        synthEngine: CreationSynthEngine,
        tempL: UnsafeMutablePointer<Float>,
        tempR: UnsafeMutablePointer<Float>,
        bufferSize: Int
    ) -> AVAudioSourceNodeRenderBlock {
        { [weak synthEngine] _, _, frameCount, audioBufferList in
            renderAudioBuffer(
                synthEngine: synthEngine,
                tempL: tempL,
                tempR: tempR,
                frameCount: Int(frameCount),
                bufferSize: bufferSize,
                audioBufferList: audioBufferList
            )
            return noErr
        }
    }

    private static func renderAudioBuffer(
        synthEngine: CreationSynthEngine?,
        tempL: UnsafeMutablePointer<Float>,
        tempR: UnsafeMutablePointer<Float>,
        frameCount: Int,
        bufferSize: Int,
        audioBufferList: UnsafeMutablePointer<AudioBufferList>
    ) {
        guard frameCount > 0 else { return }

        var offset = 0
        while offset < frameCount {
            let count = min(bufferSize, frameCount - offset)
            if let synthEngine {
                synthEngine.render(left: tempL, right: tempR, count: count)
            } else {
                zeroRenderSamples(tempL: tempL, tempR: tempR, count: count)
            }
            copyRenderedSamples(
                tempL: tempL,
                tempR: tempR,
                offset: offset,
                count: count,
                audioBufferList: audioBufferList
            )
            offset += count
        }
    }

    private static func zeroRenderSamples(
        tempL: UnsafeMutablePointer<Float>,
        tempR: UnsafeMutablePointer<Float>,
        count: Int
    ) {
        for sampleIndex in 0..<count {
            tempL[sampleIndex] = 0
            tempR[sampleIndex] = 0
        }
    }

    private static func copyRenderedSamples(
        tempL: UnsafeMutablePointer<Float>,
        tempR: UnsafeMutablePointer<Float>,
        offset: Int,
        count: Int,
        audioBufferList: UnsafeMutablePointer<AudioBufferList>
    ) {
        let buffers = UnsafeMutableAudioBufferListPointer(audioBufferList)
        if buffers.count >= 2 {
            copyNonInterleavedSamples(
                tempL: tempL,
                tempR: tempR,
                offset: offset,
                count: count,
                buffers: buffers
            )
            return
        }

        guard buffers.count == 1,
              let destination = buffers[0].mData?.assumingMemoryBound(to: Float.self) else {
            return
        }
        copySingleBufferSamples(
            tempL: tempL,
            tempR: tempR,
            offset: offset,
            count: count,
            destination: destination,
            channelCount: Int(buffers[0].mNumberChannels)
        )
    }

    private static func copyNonInterleavedSamples(
        tempL: UnsafeMutablePointer<Float>,
        tempR: UnsafeMutablePointer<Float>,
        offset: Int,
        count: Int,
        buffers: UnsafeMutableAudioBufferListPointer
    ) {
        guard let leftDestination = buffers[0].mData?.assumingMemoryBound(to: Float.self),
              let rightDestination = buffers[1].mData?.assumingMemoryBound(to: Float.self) else {
            return
        }

        for sampleIndex in 0..<count {
            leftDestination[offset + sampleIndex] = tempL[sampleIndex]
            rightDestination[offset + sampleIndex] = tempR[sampleIndex]
        }
    }

    private static func copySingleBufferSamples(
        tempL: UnsafeMutablePointer<Float>,
        tempR: UnsafeMutablePointer<Float>,
        offset: Int,
        count: Int,
        destination: UnsafeMutablePointer<Float>,
        channelCount: Int
    ) {
        let channels = max(channelCount, 1)
        if channels >= 2 {
            for sampleIndex in 0..<count {
                let destinationIndex = (offset + sampleIndex) * channels
                destination[destinationIndex] = tempL[sampleIndex]
                destination[destinationIndex + 1] = tempR[sampleIndex]
            }
            return
        }

        for sampleIndex in 0..<count {
            destination[offset + sampleIndex] = (tempL[sampleIndex] + tempR[sampleIndex]) * 0.5
        }
    }

    func trigger(midi: Int, velocity: Float, pan: Float, held: Bool, allowSelfEcho: Bool = true) -> Int {
        start()
        guard let synth else { return -1 }
        return synth.triggerNote(
            frequency: frequency(for: midi),
            velocity: max(0.05, min(1, velocity)),
            pan: pan,
            held: held,
            allowSelfEcho: allowSelfEcho
        )
    }

    func triggerFrequency(frequency: Float, velocity: Float, pan: Float, held: Bool, allowSelfEcho: Bool = true) -> Int {
        start()
        guard let synth else { return -1 }
        return synth.triggerNote(
            frequency: frequency,
            velocity: max(0.05, min(1, velocity)),
            pan: pan,
            held: held,
            allowSelfEcho: allowSelfEcho
        )
    }

    func glide(voiceID: Int, midi: Int) {
        synth?.glideNote(voiceID: voiceID, frequency: frequency(for: midi))
    }

    func glideFrequency(voiceID: Int, frequency: Float) {
        synth?.glideNote(voiceID: voiceID, frequency: frequency)
    }

    func retrigger(voiceID: Int, midi: Int, velocity: Float) {
        synth?.retriggerNote(voiceID: voiceID, frequency: frequency(for: midi), velocity: velocity)
    }

    func retriggerFrequency(voiceID: Int, frequency: Float, velocity: Float) {
        synth?.retriggerNote(voiceID: voiceID, frequency: frequency, velocity: velocity)
    }

    func release(voiceID: Int) {
        synth?.releaseNote(voiceID: voiceID)
    }

    func endVoice(voiceID: Int, style: CreationPlaybackBehavior.NoteEndStyle) {
        CreationPlaybackBehavior.endVoice(voiceID, style: style, using: synth)
    }

    func allowNaturalDecay(voiceID: Int) {
        synth?.allowNaturalDecay(voiceID: voiceID)
    }

    func silence() {
        synth?.scheduleSilenceAll()
    }

    func releaseAll() {
        synth?.scheduleReleaseAllVoices()
    }

    func setVoiceType(_ type: CreationVoiceType) {
        voiceType = type
        synth?.setVoiceType(type)
    }

    func configure(
        reverbMix: Float,
        delayFeedback: Float,
        delayMix: Float,
        mainGain: Float,
        preDelay: Float,
        decay: Float,
        damping: Float,
        body: Float
    ) {
        self.reverbMix = reverbMix
        self.delayFeedback = delayFeedback
        self.delayMix = delayMix
        self.mainGain = mainGain
        self.preDelay = preDelay
        self.decay = decay
        self.damping = damping
        self.body = body
        if let synth {
            applyConfiguration(to: synth)
        }
    }

    private func applyConfiguration(to synth: CreationSynthEngine) {
        synth.reverbMix = reverbMix
        synth.delayFeedback = delayFeedback
        synth.delayMix = delayMix
        synth.mainGain = mainGain
        synth.preDelayTime = preDelay
        synth.rvbDecay = decay
        synth.rvbDamping = damping
        synth.voiceBody = body
    }

    private func frequency(for midi: Int) -> Float {
        Float(440.0 * pow(2.0, Double(midi - 69) / 12.0))
    }
}

private enum ActualSoundLabSessionJSON {
    private struct SessionListEnvelope: Decodable {
        let sessions: [CreationSession]
    }

    private struct SessionEnvelope: Decodable {
        let session: CreationSession
    }

    static func decodeSessions(from data: Data) throws -> [CreationSession] {
        let decoder = decoder()
        if let sessions = try? decoder.decode([CreationSession].self, from: data) {
            return sessions
        }
        if let envelope = try? decoder.decode(SessionListEnvelope.self, from: data) {
            return envelope.sessions
        }
        if let envelope = try? decoder.decode(SessionEnvelope.self, from: data) {
            return [envelope.session]
        }
        return [try decoder.decode(CreationSession.self, from: data)]
    }

    static func encoder() -> JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return encoder
    }

    private static func decoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            try decodeDate(from: decoder)
        }
        return decoder
    }

    private static func decodeDate(from decoder: Decoder) throws -> Date {
        let container = try decoder.singleValueContainer()

        if let timestamp = try? container.decode(Double.self) {
            return Date(timeIntervalSince1970: timestamp)
        }

        let dateString = try container.decode(String.self)
        if let timestamp = Double(dateString) {
            return Date(timeIntervalSince1970: timestamp)
        }

        for options in iso8601Options {
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = options
            if let date = formatter.date(from: dateString) {
                return date
            }
        }

        throw DecodingError.dataCorruptedError(
            in: container,
            debugDescription: "Unsupported date format: \(dateString)"
        )
    }

    private static var iso8601Options: [ISO8601DateFormatter.Options] {
        [
            [.withInternetDateTime, .withFractionalSeconds],
            [.withInternetDateTime]
        ]
    }
}

private enum ActualSoundLabPersistence {
    static func load() -> [CreationSession]? {
        let url = sessionsURL
        guard FileManager.default.fileExists(atPath: url.path),
              let data = try? Data(contentsOf: url) else {
            return nil
        }

        return try? ActualSoundLabSessionJSON.decodeSessions(from: data)
    }

    static func save(_ sessions: [CreationSession]) {
        let url = sessionsURL
        do {
            try FileManager.default.createDirectory(
                at: url.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            try ActualSoundLabSessionJSON.encoder().encode(sessions).write(to: url, options: .atomic)
        } catch {
            NSLog("NeurimaSoundLab session persistence failed: \(error.localizedDescription)")
        }
    }

    private static var sessionsURL: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Neurima Sound Lab", isDirectory: true)
            .appendingPathComponent("sessions.json")
    }
}

struct ActualSoundLabShellView: View {
    @ObservedObject var store: ActualSoundLabStore

    var body: some View {
        NavigationSplitView {
            List(selection: $store.selectedSection) {
                Section("Workspace") {
                    ForEach(ActualSoundLabSection.allCases) { section in
                        Label(section.rawValue, systemImage: section.systemImage)
                            .tag(section)
                    }
                }

                Section("Timeline") {
                    Label("\(store.phrases.count) phrases", systemImage: "waveform.path")
                    Label("\(store.currentRecordingNotes) live notes", systemImage: "circle.grid.cross")
                    Label("\(store.keyName) \(store.selectedMode.displayName)", systemImage: "music.note.list")
                }
            }
            .listStyle(.sidebar)
            .navigationSplitViewColumnWidth(min: 210, ideal: 230)
        } detail: {
            Group {
                switch store.selectedSection {
                case .canvas:
                    ActualCreationWorkspace(store: store)
                case .soundDesign:
                    ActualSoundDesignWorkspace(store: store)
                case .sessions:
                    ActualSessionsWorkspace(store: store)
                }
            }
            .navigationTitle(store.selectedSection.rawValue)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    EffectModeControl(selection: $store.interactionMode)
                        .fixedSize()
                }

                ToolbarSpacer(.fixed, placement: .primaryAction)

                ToolbarItemGroup(placement: .primaryAction) {
                    Button {
                        store.toggleEvolution()
                    } label: {
                        Label(store.isEvolving ? "Stop Evolving" : "Evolve", systemImage: "sparkles")
                    }

                    Button {
                        store.openVisualizerWindow()
                    } label: {
                        Label("Visualizer", systemImage: "arrow.up.left.and.arrow.down.right")
                    }

                    Button {
                        store.saveSession()
                    } label: {
                        Label("Save", systemImage: "tray.and.arrow.down")
                    }

                    Button {
                        store.exportCurrentSession()
                    } label: {
                        Label(store.isExporting ? "Exporting" : "Export WAV", systemImage: "square.and.arrow.down")
                    }
                    .disabled(store.phrases.isEmpty || store.isExporting)
                }
            }
        }
        .soundLabUIStyle(.neurima(theme: .default))
    }
}

private struct EffectModeControl: View {
    @Binding var selection: CreationInteractionMode
    @Environment(\.soundLabUIStyle) private var style

    private let segmentWidth: CGFloat = 82
    private let controlHeight: CGFloat = 34
    private let inset: CGFloat = 3

    var body: some View {
        HStack(spacing: 0) {
            ForEach(CreationInteractionMode.pickerModes, id: \.rawValue) { mode in
                Button {
                    selection = mode
                } label: {
                    Text(mode.label)
                        .font(.callout.weight(selection == mode ? .semibold : .regular))
                        .lineLimit(1)
                        .frame(width: segmentWidth, height: controlHeight - inset * 2)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .foregroundStyle(selection == mode ? style.textPrimary : style.secondaryText)
                .background {
                    if selection == mode {
                        Capsule(style: .continuous)
                            .fill(style.textPrimary.opacity(0.13))
                    }
                }
                .accessibilityLabel(mode.label)
                .accessibilityAddTraits(selection == mode ? .isSelected : [])
            }
        }
        .padding(inset)
        .frame(width: segmentWidth * CGFloat(CreationInteractionMode.pickerModes.count) + inset * 2, height: controlHeight)
        .background(style.panelOverlay.opacity(0.76), in: Capsule(style: .continuous))
        .overlay {
            Capsule(style: .continuous)
                .stroke(style.panelBorder, lineWidth: 1)
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Effect")
    }
}

private struct ActualCreationWorkspace: View {
    @ObservedObject var store: ActualSoundLabStore
    @Environment(\.soundLabUIStyle) private var style

    var body: some View {
        VStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(store.status)
                            .font(.title3.weight(.semibold))
                        Text("\(store.voiceType.label) | \(store.keyName) \(store.selectedMode.displayName) | \(store.repeatMode.label)")
                            .font(.callout.monospacedDigit())
                            .foregroundStyle(style.secondaryText)
                    }

                    Spacer()

                    Picker("Key", selection: $store.keyOffset) {
                        ForEach(0..<store.keyLabels.count, id: \.self) { offset in
                            Text(store.keyLabels[offset]).tag(offset)
                        }
                    }
                    .frame(width: 92)
                    .onChange(of: store.keyOffset) { _, newValue in
                        store.setKeyOffset(newValue)
                    }

                    Picker("Mode", selection: $store.selectedMode) {
                        ForEach(SoundLabTheory.creationModeOptions) { option in
                            Text(option.shortLabel).tag(option.mode)
                        }
                    }
                    .frame(width: 150)
                    .onChange(of: store.selectedMode) { _, newValue in
                        store.setMode(newValue)
                    }

                    Picker("Voice", selection: $store.voiceType) {
                        ForEach(CreationVoiceType.allCases, id: \.rawValue) { voice in
                            Text(voice.label).tag(voice)
                        }
                    }
                    .frame(width: 180)
                    .onChange(of: store.voiceType) { _, newValue in
                        store.setVoiceType(newValue)
                    }

                    Picker("Repeat", selection: $store.repeatMode) {
                        ForEach(CreationRepeatMode.allCases, id: \.rawValue) { mode in
                            Text(mode.label).tag(mode)
                        }
                    }
                    .frame(width: 110)
                }
            }
            .padding(.horizontal, 22)
            .padding(.top, 18)

            ActualSoundLabCanvasSurface(store: store, rounded: true)
            .padding(.horizontal, 22)
            .frame(minHeight: 410)

            ActualSoundLabTransport(
                isRecording: store.isRecording,
                isPlaybackActive: store.isPlaying,
                phraseCount: store.phrases.count,
                currentRecordingNotes: store.currentRecordingNotes,
                canPlay: !store.phrases.isEmpty,
                keyName: store.keyName,
                isExpressionActive: store.isExpressionActive,
                expressionScalar: store.expressionScalar,
                isSustainActive: store.isSustainActive,
                onRecordToggle: store.toggleRecording,
                onPlayToggle: store.togglePlayback,
                onExpressionChanged: { value in
                    store.setExpressionScalar(value)
                },
                onExpressionEnded: {
                    store.resetExpression()
                },
                onSustainChanged: { value in
                    store.setSustainActive(value)
                }
            )

            if store.showTimeline {
                SoundLabArrangementLane(
                    appTheme: .default,
                    hasTimelineContent: !store.phrases.isEmpty || store.isRecording,
                    phrases: store.phrases,
                    selectedPhraseIndex: store.selectedPhraseIndex,
                    activePlaybackIndex: store.activePlaybackIndex,
                    playbackHighlightState: store.playbackHighlightState,
                    isReplaying: store.isPlaying,
                    playheadProgress: store.playheadProgress,
                    isRecording: store.isRecording,
                    currentRecordingNotes: store.currentRecordingNotes,
                    selectedKeyOffset: store.keyOffset,
                    selectedMode: store.selectedMode.rawValue,
                    keyLabels: store.keyLabels,
                    recommendedModeOptions: SoundLabTheory.modeOptions,
                    exploratoryModeOptions: SoundLabTheory.exploratoryModeOptions,
                    onPhraseTap: store.togglePhraseSelection,
                    onUpdateKey: store.updatePhraseKey,
                    onUpdateMode: store.updatePhraseMode,
                    onOverdub: store.startOverdub,
                    onDelete: store.deletePhrase,
                    phrasePlaybackDuration: { $0.playbackDuration }
                )
                .equatable()
                .padding(.horizontal, 22)
                .padding(.bottom, 18)
            }
        }
        .background(style.sheetBackground)
        .onAppear {
            store.prepareAudio()
        }
    }
}

private struct ActualSoundLabCanvasSurface: View {
    @ObservedObject var store: ActualSoundLabStore
    let rounded: Bool
    @Environment(\.soundLabUIStyle) private var style

    var body: some View {
        GeometryReader { geometry in
            SoundLabCreationCanvas(
                scaleIntervals: store.scaleIntervals,
                keyOffset: store.keyOffset,
                interactionMode: store.interactionMode,
                onNoteBegan: store.beginNote,
                onNoteGlide: store.glideNote,
                onNoteRetrigger: store.retriggerNote,
                onNoteEnded: store.endNote,
                onAllTouchesLifted: store.releaseAllNotes,
                externalSpawns: $store.pendingCanvasSpawns
            )
            .background { style.visualizerBackground }
            .modifier(ActualCanvasChrome(rounded: rounded, border: style.panelBorder))
            .onAppear {
                store.updateCanvasSize(geometry.size)
                store.prepareAudio()
            }
            .onChange(of: geometry.size) { _, newSize in
                store.updateCanvasSize(newSize)
            }
        }
    }
}

private struct ActualCanvasChrome: ViewModifier {
    let rounded: Bool
    let border: Color

    func body(content: Content) -> some View {
        if rounded {
            content
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .stroke(border, lineWidth: 1)
                }
        } else {
            content
        }
    }
}

private struct VisualizerPointerActivityView: NSViewRepresentable {
    let onActivity: () -> Void

    func makeNSView(context: Context) -> PointerActivityNSView {
        let view = PointerActivityNSView()
        view.onActivity = onActivity
        return view
    }

    func updateNSView(_ nsView: PointerActivityNSView, context: Context) {
        nsView.onActivity = onActivity
    }

    final class PointerActivityNSView: NSView {
        var onActivity: (() -> Void)?
        private var pointerTrackingArea: NSTrackingArea?

        override init(frame frameRect: NSRect) {
            super.init(frame: frameRect)
            wantsLayer = true
            layer?.backgroundColor = NSColor.clear.cgColor
        }

        @available(*, unavailable)
        required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

        override func viewDidMoveToWindow() {
            super.viewDidMoveToWindow()
            window?.acceptsMouseMovedEvents = true
        }

        override func updateTrackingAreas() {
            super.updateTrackingAreas()
            if let pointerTrackingArea {
                removeTrackingArea(pointerTrackingArea)
            }

            let trackingArea = NSTrackingArea(
                rect: bounds,
                options: [.activeAlways, .inVisibleRect, .mouseEnteredAndExited, .mouseMoved],
                owner: self
            )
            pointerTrackingArea = trackingArea
            addTrackingArea(trackingArea)
        }

        override func mouseEntered(with event: NSEvent) {
            onActivity?()
        }

        override func mouseMoved(with event: NSEvent) {
            onActivity?()
        }

        override func hitTest(_ point: NSPoint) -> NSView? {
            nil
        }
    }
}

struct ActualSoundLabVisualizerWindow: View {
    @ObservedObject var store: ActualSoundLabStore
    @AppStorage("appearanceMode") private var appearanceMode = AppearanceMode.system.rawValue
    @State private var isChromeRevealed = true
    @State private var isPointerOverChrome = false
    @State private var lastPointerActivityTime: CFTimeInterval = 0
    @State private var hideChromeTask: Task<Void, Never>?
    @State private var escapeKeyMonitor: Any?

    private var isImmersiveActive: Bool {
        store.isPlaying || store.isEvolving
    }

    private var isChromeVisible: Bool {
        !isImmersiveActive || isChromeRevealed
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            ActualSoundLabCanvasSurface(store: store, rounded: false)
                .ignoresSafeArea()

            VisualizerPointerActivityView {
                handlePointerActivity()
            }
            .ignoresSafeArea()

            visualizerChrome
                .opacity(isChromeVisible ? 1 : 0)
                .allowsHitTesting(isChromeVisible)
                .animation(.easeOut(duration: 0.55), value: isChromeVisible)
                .onHover { hovering in
                    isPointerOverChrome = hovering
                    if hovering {
                        revealChrome(cancelPendingFade: true)
                    } else {
                        scheduleChromeFade()
                    }
                }
                .onContinuousHover { phase in
                    if case .active = phase {
                        handlePointerActivity()
                    }
                }
        }
        .background(ThemeColors.visualizerBackground(for: .default))
        .soundLabUIStyle(.neurima(theme: .default))
        .preferredColorScheme(AppearanceMode(rawValue: appearanceMode)?.colorScheme)
        .onAppear {
            installEscapeKeyMonitor()
            lastPointerActivityTime = CACurrentMediaTime()
            handleImmersiveStateChanged()
        }
        .onChange(of: store.isPlaying) { _, _ in
            handleImmersiveStateChanged()
        }
        .onChange(of: store.isEvolving) { _, _ in
            handleImmersiveStateChanged()
        }
        .onDisappear {
            hideChromeTask?.cancel()
            hideChromeTask = nil
            removeEscapeKeyMonitor()
        }
        .onExitCommand {
            store.closeVisualizerWindow()
        }
    }

    private var visualizerChrome: some View {
        VStack(spacing: 0) {
            HStack(spacing: 14) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(store.status)
                        .font(.title3.weight(.semibold))
                    Text("\(store.voiceType.label) | \(store.keyName) \(store.selectedMode.displayName) | \(store.phrases.count) phrases")
                        .font(.callout.monospacedDigit())
                        .foregroundStyle(ThemeColors.secondary(for: .default))
                }

                Spacer()

                EffectModeControl(selection: $store.interactionMode)

                Button {
                    store.toggleEvolution()
                } label: {
                    Label(store.isEvolving ? "Evolving" : "Evolve", systemImage: "sparkles")
                }

                Button {
                    store.exportCurrentSession()
                } label: {
                    Label("Export", systemImage: "square.and.arrow.down")
                }
                .disabled(store.phrases.isEmpty || store.isExporting)

                Button {
                    store.closeVisualizerWindow()
                } label: {
                    Image(systemName: "arrow.down.right.and.arrow.up.left")
                }
                .buttonStyle(.borderless)
                .help("Close visualizer")
            }
            .padding(.horizontal, 24)
            .padding(.top, 18)

            Spacer()

            ActualSoundLabTransport(
                isRecording: store.isRecording,
                isPlaybackActive: store.isPlaying,
                phraseCount: store.phrases.count,
                currentRecordingNotes: store.currentRecordingNotes,
                canPlay: !store.phrases.isEmpty,
                keyName: store.keyName,
                isExpressionActive: store.isExpressionActive,
                expressionScalar: store.expressionScalar,
                isSustainActive: store.isSustainActive,
                onRecordToggle: store.toggleRecording,
                onPlayToggle: store.togglePlayback,
                onExpressionChanged: { value in
                    store.setExpressionScalar(value)
                },
                onExpressionEnded: {
                    store.resetExpression()
                },
                onSustainChanged: { value in
                    store.setSustainActive(value)
                }
            )
            .padding(.bottom, 26)
        }
    }

    private func handleImmersiveStateChanged() {
        if isImmersiveActive {
            revealChrome(cancelPendingFade: false)
        } else {
            hideChromeTask?.cancel()
            hideChromeTask = nil
            withAnimation(.easeOut(duration: 0.35)) {
                isChromeRevealed = true
            }
        }
    }

    private func handlePointerActivity() {
        guard isImmersiveActive else { return }
        let now = CACurrentMediaTime()
        guard !isChromeRevealed || now - lastPointerActivityTime >= 0.20 else { return }
        lastPointerActivityTime = now
        revealChrome(cancelPendingFade: false)
    }

    private func revealChrome(cancelPendingFade: Bool) {
        lastPointerActivityTime = CACurrentMediaTime()
        if cancelPendingFade {
            hideChromeTask?.cancel()
            hideChromeTask = nil
        }

        if !isChromeRevealed {
            withAnimation(.easeOut(duration: 0.18)) {
                isChromeRevealed = true
            }
        } else {
            isChromeRevealed = true
        }

        scheduleChromeFade()
    }

    private func scheduleChromeFade() {
        hideChromeTask?.cancel()
        guard isImmersiveActive else { return }

        hideChromeTask = Task { @MainActor in
            try? await Task.sleep(for: .seconds(1.9))
            guard !Task.isCancelled, isImmersiveActive else { return }
            let idleTime = CACurrentMediaTime() - lastPointerActivityTime
            if idleTime < 1.75 {
                scheduleChromeFade()
                return
            }
            withAnimation(.easeOut(duration: 0.7)) {
                isChromeRevealed = false
            }
            isPointerOverChrome = false
            NSCursor.setHiddenUntilMouseMoves(true)
        }
    }

    private func installEscapeKeyMonitor() {
        guard escapeKeyMonitor == nil else { return }
        escapeKeyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
            guard event.keyCode == 53 else { return event }
            store.closeVisualizerWindow()
            return nil
        }
    }

    private func removeEscapeKeyMonitor() {
        if let escapeKeyMonitor {
            NSEvent.removeMonitor(escapeKeyMonitor)
        }
        escapeKeyMonitor = nil
    }
}

private struct ActualPhraseStrip: View {
    @ObservedObject var store: ActualSoundLabStore
    @Environment(\.soundLabUIStyle) private var style

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(Array(store.phrases.enumerated()), id: \.element.id) { index, phrase in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(phrase.label)
                                .font(.headline)
                            Spacer()
                            Text("\(phrase.noteCount)")
                                .font(.caption.monospacedDigit())
                                .foregroundStyle(style.secondaryText)
                        }

                        Canvas { context, size in
                            let duration = max(phrase.playbackDuration, 0.1)
                            for note in phrase.notes {
                                let x = CGFloat(note.relativeTime / duration) * size.width
                                let h = CGFloat(note.velocity) * size.height
                                let rect = CGRect(x: x, y: (size.height - h) / 2, width: 4, height: max(h, 6))
                                context.fill(Path(roundedRect: rect, cornerRadius: 2), with: .color(style.interactiveAccent.opacity(0.75)))
                            }
                        }
                        .frame(height: 42)

                        Text("Phrase \(index + 1)")
                            .font(.caption)
                            .foregroundStyle(style.secondaryText)
                    }
                    .padding(12)
                    .frame(width: 210)
                    .background(style.panelOverlay, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .stroke(style.panelBorder, lineWidth: 1)
                    }
                }
            }
            .padding(.horizontal, 22)
            .padding(.bottom, 18)
        }
    }
}

private struct ActualSoundDesignWorkspace: View {
    @ObservedObject var store: ActualSoundLabStore
    @Environment(\.soundLabUIStyle) private var style

    var body: some View {
        ScrollView {
            HStack(alignment: .top, spacing: 22) {
                VStack(alignment: .leading, spacing: 14) {
                    Text("Tone")
                        .font(.title3.weight(.semibold))
                    CreationTonePad(
                        reverbMix: $store.toneReverbMix,
                        delayFeedback: $store.toneDelayFeedback,
                        onLiveChange: {
                            store.status = "Tone shaping"
                        },
                        onCommit: {
                            store.status = "Tone set"
                        }
                    )
                    .frame(minWidth: 380, maxWidth: 520)
                }

                VStack(spacing: 18) {
                    parameterPanel("Space") {
                        slider("Pre-Delay", value: $store.spacePreDelay, range: 0.010...0.150, display: "\(Int(store.spacePreDelay * 1000))ms")
                        slider("Decay", value: $store.spaceDecay, range: 0.20...0.98, display: "\(Int(store.spaceDecay * 100))%")
                        slider("Brightness", value: $store.spaceDamping, range: 0.20...0.86, display: "\(Int(store.spaceDamping * 100))%")
                        slider("Body", value: $store.spaceBody, range: 0.30...0.70, display: "\(Int(store.spaceBody * 100))%")
                    }

                    parameterPanel("Performance") {
                        slider("Gain", value: $store.toneMainGain, range: 0.50...2.0, display: String(format: "%.1fx", store.toneMainGain))
                        slider("Pad Delay", value: $store.padDelayMix, range: 0...0.75, display: "\(Int(store.padDelayMix * 100))%")
                        Stepper(value: $store.echoRepeatCount, in: 1...12) {
                            HStack {
                                Text("Repeat Count")
                                Spacer()
                                Text("\(store.echoRepeatCount)")
                                    .foregroundStyle(style.secondaryText)
                            }
                        }
                    }

                    parameterPanel("Output") {
                        Picker("Live Output", selection: liveOutputPreset) {
                            ForEach(SoundLabLiveOutputPreset.allCases) { preset in
                                Text(preset.rawValue).tag(preset)
                            }
                        }
                        .pickerStyle(.segmented)

                        slider("Volume", value: $store.liveOutputGain, range: SoundLabLiveOutput.gainRange, display: SoundLabLiveOutput.percentText(for: store.liveOutputGain))
                    }

                    parameterPanel("Evolution") {
                        slider("Echo Interval", value: $store.echoInterval, range: 3...20, display: "\(Int(store.echoInterval))s")
                        slider("Mutation", value: $store.mutationRate, range: 0.10...0.50, display: String(format: "%.2f", store.mutationRate))
                        Toggle("Scale Lock", isOn: $store.scaleLock)
                    }
                }
                .frame(minWidth: 360)
            }
            .padding(22)
        }
        .background(style.sheetBackground)
    }

    private var liveOutputPreset: Binding<SoundLabLiveOutputPreset> {
        Binding(
            get: { SoundLabLiveOutputPreset.nearest(to: store.liveOutputGain) },
            set: { store.liveOutputGain = $0.gain }
        )
    }

    private func parameterPanel<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 13) {
            Text(title)
                .font(.headline)
            content()
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(style.panelOverlay, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(style.panelBorder, lineWidth: 1)
        }
    }

    private func slider(_ title: String, value: Binding<Float>, range: ClosedRange<Float>, display: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(title)
                Spacer()
                Text(display)
                    .foregroundStyle(style.secondaryText)
                    .monospacedDigit()
            }
            Slider(value: value, in: range)
        }
    }

    private func slider(_ title: String, value: Binding<Double>, range: ClosedRange<Double>, display: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(title)
                Spacer()
                Text(display)
                    .foregroundStyle(style.secondaryText)
                    .monospacedDigit()
            }
            Slider(value: value, in: range)
        }
    }
}

private struct ActualSessionsWorkspace: View {
    @ObservedObject var store: ActualSoundLabStore
    @Environment(\.soundLabUIStyle) private var style

    var body: some View {
        VStack(spacing: 0) {
            if store.sessions.isEmpty {
                ContentUnavailableView(
                    "No sessions yet",
                    systemImage: "folder.badge.plus",
                    description: Text("Record phrases, then save the current Sound Lab state.")
                )
            } else {
                List(store.sessions) { session in
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(session.name)
                                .font(.headline)
                            Text("\(session.phrases.count) phrases | \(session.createdAt.formatted(date: .abbreviated, time: .shortened))")
                                .font(.caption)
                                .foregroundStyle(style.secondaryText)
                        }
                        Spacer()
                        Button("Load") {
                            store.loadSession(session)
                        }
                    }
                    .padding(.vertical, 6)
                }
            }

            Divider()

            HStack {
                Button {
                    store.saveSession()
                } label: {
                    Label("Save Current", systemImage: "tray.and.arrow.down")
                }
                .buttonStyle(.borderedProminent)

                Button {
                    store.exportCurrentSession()
                } label: {
                    Label(store.isExporting ? "Exporting" : "Export WAV", systemImage: "square.and.arrow.down")
                }
                .disabled(store.phrases.isEmpty || store.isExporting)

                Button {
                    store.importSessionData()
                } label: {
                    Label("Import Data", systemImage: "square.and.arrow.down.on.square")
                }

                Button {
                    store.exportCurrentSessionData()
                } label: {
                    Label("Export Data", systemImage: "square.and.arrow.up")
                }
                .disabled(store.phrases.isEmpty)

                Button {
                    store.revealLastExport()
                } label: {
                    Label("Reveal Export", systemImage: "magnifyingglass")
                }
                .disabled(store.lastExportURL == nil)

                Button {
                    store.revealLastDataExport()
                } label: {
                    Label("Reveal Data", systemImage: "doc.text.magnifyingglass")
                }
                .disabled(store.lastDataExportURL == nil)

                Button(role: .destructive) {
                    store.clearSessions()
                } label: {
                    Label("Clear Sessions", systemImage: "trash")
                }
                .disabled(store.sessions.isEmpty)

                Spacer()
            }
            .padding(14)
        }
        .background(style.sheetBackground)
    }
}

private extension ScaleMode {
    var displayName: String {
        switch self {
        case .minor: return "Minor"
        case .dorian: return "Dorian"
        case .phrygian: return "Phrygian"
        case .lydian: return "Lydian"
        case .mixolydian: return "Mixolydian"
        case .wholeTone: return "Whole Tone"
        case .octatonic: return "Octatonic"
        case .major: return "Major"
        case .locrian: return "Locrian"
        case .harmonicMinor: return "Harmonic Minor"
        case .melodicMinor: return "Melodic Minor"
        case .minorPentatonic: return "Minor Pentatonic"
        case .hungarian: return "Hungarian"
        case .chromatic: return "Chromatic"
        case .majorPentatonic: return "Major Pentatonic"
        case .harmonicMajor: return "Harmonic Major"
        }
    }
}
