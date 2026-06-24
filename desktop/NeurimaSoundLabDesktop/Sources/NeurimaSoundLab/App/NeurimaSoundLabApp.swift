import AppKit
import SwiftUI

@main
struct NeurimaSoundLabApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = ActualSoundLabStore()
    @AppStorage("appearanceMode") private var appearanceMode = AppearanceMode.system.rawValue

    var body: some Scene {
        WindowGroup("Neurima Sound Lab") {
            ActualSoundLabShellView(store: store)
                .frame(minWidth: 1040, minHeight: 680)
                .preferredColorScheme(AppearanceMode(rawValue: appearanceMode)?.colorScheme)
                .modifier(AppAppearanceModeModifier(mode: appearanceMode))
        }
        .commands {
            ActualSoundLabCommands(store: store)
        }

        Settings {
            SettingsView()
                .preferredColorScheme(AppearanceMode(rawValue: appearanceMode)?.colorScheme)
                .modifier(AppAppearanceModeModifier(mode: appearanceMode))
        }
    }
}

private struct AppAppearanceModeModifier: ViewModifier {
    let mode: String

    func body(content: Content) -> some View {
        content
            .onAppear(perform: apply)
            .onChange(of: mode) { _, _ in apply() }
    }

    private func apply() {
        let appearance: NSAppearance? = switch AppearanceMode(rawValue: mode) {
        case .dark:
            NSAppearance(named: .darkAqua)
        case .light:
            NSAppearance(named: .aqua)
        case .system, .none:
            nil
        }
        NSApp.appearance = appearance
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
}

struct ActualSoundLabCommands: Commands {
    let store: ActualSoundLabStore

    var body: some Commands {
        CommandMenu("Sound Lab") {
            Button(store.isRecording ? "Stop Recording" : "Record Phrase") {
                store.toggleRecording()
            }
            .keyboardShortcut("r", modifiers: [.command])

            Button(store.isPlaying ? "Pause Timeline" : "Play Timeline") {
                store.togglePlayback()
            }
            .keyboardShortcut(.space, modifiers: [])

            Divider()

            Button(store.isEvolving ? "Stop Evolving" : "Evolve Phrases") {
                store.toggleEvolution()
            }
            .keyboardShortcut("e", modifiers: [.command])

            Button("Export WAV") {
                store.exportCurrentSession()
            }
            .keyboardShortcut("e", modifiers: [.command, .shift])
            .disabled(store.phrases.isEmpty || store.isExporting)

            Button("Export Data") {
                store.exportCurrentSessionData()
            }
            .keyboardShortcut("d", modifiers: [.command, .shift])
            .disabled(store.phrases.isEmpty)

            Button("Import Data") {
                store.importSessionData()
            }
            .keyboardShortcut("i", modifiers: [.command, .shift])

            Button(store.showTimeline ? "Hide Timeline" : "Show Timeline") {
                store.showTimeline.toggle()
            }
            .keyboardShortcut("t", modifiers: [.command])

            Button("Open Visualizer") {
                store.openVisualizerWindow()
            }
            .keyboardShortcut("f", modifiers: [.command, .shift])

            Button("Play In Visualizer") {
                store.openVisualizerWindow(startPlayback: true)
            }
            .keyboardShortcut("p", modifiers: [.command, .shift])
            .disabled(store.phrases.isEmpty)

            Divider()

            Button("Save Session") {
                store.saveSession()
            }
            .keyboardShortcut("s", modifiers: [.command])

            Button("Clear Timeline") {
                store.clear()
            }
        }
    }
}

private struct SettingsView: View {
    @AppStorage("appearanceMode") private var appearanceMode = AppearanceMode.system.rawValue

    var body: some View {
        Form {
            Picker("Appearance", selection: $appearanceMode) {
                ForEach(AppearanceMode.allCases) { mode in
                    Text(mode.rawValue).tag(mode.rawValue)
                }
            }
        }
        .formStyle(.grouped)
        .padding(24)
        .frame(width: 420)
    }
}
