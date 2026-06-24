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
