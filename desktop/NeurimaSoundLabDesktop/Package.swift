// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "NeurimaSoundLabDesktop",
    platforms: [
        .macOS("26.0")
    ],
    products: [
        .executable(name: "NeurimaSoundLab", targets: ["NeurimaSoundLabDesktop"])
    ],
    dependencies: [
        .package(path: "../../../Neurima_DSP/Neurima/Packages/NeurimaDesignSystem"),
        .package(path: "../../../Neurima_DSP/Neurima/Packages/NeurimaSoundLab"),
        .package(path: "../../../Neurima_DSP/Neurima/Packages/NeurimaSoundLabUI"),
    ],
    targets: [
        .executableTarget(
            name: "NeurimaSoundLabDesktop",
            dependencies: [
                .product(name: "NeurimaDesignSystem", package: "NeurimaDesignSystem"),
                .product(name: "NeurimaSoundLab", package: "NeurimaSoundLab"),
                .product(name: "NeurimaSoundLabUI", package: "NeurimaSoundLabUI"),
            ],
            path: "Sources/NeurimaSoundLab"
        )
    ],
    swiftLanguageModes: [.v5]
)
