import SwiftUI

enum AppearanceMode: String, CaseIterable, Identifiable, Hashable {
    case system = "System"
    case light = "Light"
    case dark = "Dark"

    var id: String { rawValue }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .light: return .light
        case .dark: return .dark
        }
    }
}

struct SoundLabPlaybackHighlightState: Equatable {
    var activeIndex: Int?
    var trailingIndex: Int?
    var transitionProgress: Double

    static let inactive = SoundLabPlaybackHighlightState(
        activeIndex: nil,
        trailingIndex: nil,
        transitionProgress: 0
    )
}

enum SoundLabLiveOutput {
    static let userDefaultsKey = "soundLab.liveOutputGain"
    static let defaultGain: Float = 1.0
    static let gainRange: ClosedRange<Float> = 0.35...3.0

    static func loadGain() -> Float {
        guard UserDefaults.standard.object(forKey: userDefaultsKey) != nil else {
            return defaultGain
        }
        return clamped(UserDefaults.standard.float(forKey: userDefaultsKey))
    }

    static func saveGain(_ gain: Float) {
        UserDefaults.standard.set(clamped(gain), forKey: userDefaultsKey)
    }

    static func clamped(_ gain: Float) -> Float {
        max(gainRange.lowerBound, min(gainRange.upperBound, gain))
    }

    static func percentText(for gain: Float) -> String {
        "\(Int((clamped(gain) * 100).rounded()))%"
    }
}

enum SoundLabLiveOutputPreset: String, CaseIterable, Identifiable {
    case natural = "Natural"
    case external = "TV / External"
    case bluetooth = "Car / Bluetooth"

    var id: String { rawValue }

    var gain: Float {
        switch self {
        case .natural: return 1.0
        case .external: return 2.0
        case .bluetooth: return 3.0
        }
    }

    static func nearest(to gain: Float) -> SoundLabLiveOutputPreset {
        allCases.min { lhs, rhs in
            abs(lhs.gain - gain) < abs(rhs.gain - gain)
        } ?? .natural
    }
}
