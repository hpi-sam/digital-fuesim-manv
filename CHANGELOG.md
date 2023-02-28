# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project does **not** adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   A new team of contributors joined the project!
-   Even better, we are happy to welcome a new partner: Johanniter Akademie NRW, Campus Münster der Johanniter-Unfall-Hilfe e.V. (JUH).
-   Simulated regions are new elements on the map that behave similar to viewports.
    -   They have a flexible simulation framework for defining behaviors.
    -   These can contain personnel, vehicles, material and patients.
    -   Several behaviors providing the following automatic behavior already exist (but can't be activated at the moment):
        -   Let personnel leave their vehicle after arriving in a simulated region
        -   Assign a leader for a simulated region
        -   Count, triage and treat patients in a simulated region
-   Added customizable pages for imprint and privacy notice.
-   The frontend now displays the current software version and shows a feedback button on most pages.
-   Added [CHANGELOG.md](./CHANGELOG.md), a [release and versioning guide](./README.md#releases) and release actions.

### Changed

-   Elements that are dragged to the map can be deleted or added to a transfer point directly instead of having to drop and move them.
-   Various internal refactoring:
    -   Marked VS Code configs as examples.
    -   Introduced uniform abstract representation for positions.
    -   Added property for type distinction to all objects in the state.
    -   Moved lots of functionality from `OlMapManager` to feature managers.
    -   Improved pipeline and branch protection

### Fixed

-   Moving the map no longer closes popups but they can be closed with ESC.
-   Minor dependency updates
-   Updated deprecated actions

## [0.0.0]

### Initial unstable release of Digitale FüSim MANV

[Unreleased]: https://github.com/Nils1729/digital-fuesim-manv/compare/v0.0.0...HEAD
[0.0.0]: https://github.com/Nils1729/digital-fuesim-manv/compare/37bd43bc1beb4aa9ad597b1ac763dd71b5709737...v0.0.0
