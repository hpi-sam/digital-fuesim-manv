# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project does **not** adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   The popup of a simulated region now has got three tabs: _Overview_, _Transfers_ and _Behaviors_
    -   The _Overview_ tab allows setting the name of the simulated region and shows the current number of patients, vehicles, personnel and material
    -   The _Transfers_ tab allows setting up transfer connections from/to other simulated regions and/or transfer points
    -   The _Behaviors_ tab allows adding and removing behaviors from simulated regions, inspect their current state and customize their settings
        -   For the assign leader behavior, the type of the currently assigned leader is shown
        -   For the unload arrived vehicles behavior, the unload duration can be set and all currently unloading vehicles are listed with their remaining time
-   To manage exercises with a large amount of simulated regions easily, a large modal has been added that can be used to manage all simulated regions
    -   Every simulated region popup shows a button to view the current simulated region in this modal
-   Simulated Regions now act as transfer points, meaning that they can be start and destination of a transfer
    -   Connection lines will be shown for transfer connections from/to simulated regions, too

### Changed

-   Images are now stored in git and not git lfs anymore

### Fixed

-   Making a _Gruppenführer_ leader of a simulated region if the region already had a leader did not work. Now, if there already is a leader, better personnel (i.e. the old leader was not a _Gruppenführer_ but the new one is) will be chosen as new leader
-   Errors in migrating exercises lo longer crash the backend
-   If the history of an exercise cannot be restored, it is now dropped and the current state is used
-   Actions that affect vehicles that are not fully loaded will now be removed in migrations, enabling the restoration of most of the history

## [0.1.0] - 2023-03-01

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

[Unreleased]: https://github.com/hpi-sam/digital-fuesim-manv/compare/0.1.0...HEAD
[0.1.0]: https://github.com/hpi-sam/digital-fuesim-manv/compare/v0.0.0...0.1.0
[0.0.0]: https://github.com/hpi-sam/digital-fuesim-manv/compare/37bd43bc1beb4aa9ad597b1ac763dd71b5709737...v0.0.0
