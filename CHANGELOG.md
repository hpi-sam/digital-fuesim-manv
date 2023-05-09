# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project does **not** adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.1] - 2023-05-09

### Fixed

-   Queries for the current number of patients and the current treatment progress won't be answered by the treat patients behavior if there is no leader of the requested simulated region.
-   The frontend for the treat patients behavior hides the "assigned personnel" column not only in the `unknown` but also the `noTreatment` phase.
-   The diff link in the changelog for v0.4.0 now refers to the correct tags.

## [0.5.0] - 2023-05-08

### Added

-   There are now events for the removal of patients, vehicles, material, and personnel from simulated regions.
    -   When personnel, material, or patients are removed, the treatments get reassigned.
    -   When the leader is removed, a new one gets selected.
-   The trainer editor now offers pre-configured templates for different kinds of simulated regions.
    -   These templates come with different border colors.
-   Simulated regions display their names on the map.
-   There is now a button in the patients tab of a simulated region that removes the patient from the simulated region and places the patient on the map next to the simulated region (on the right hand side).
-   Simulated regions and viewports display their names on the map.
-   Vehicles now have a property to indicate their current occupation.
-   The emergency operations center ("Leitstelle") now has an option to select a different destination for a specified amount of vehicles.
-   Treatment progress falls back to no treatment when a leader is missing in the region.
-   All vehicles in a simulated region can be managed with the new vehicles tab.
    -   All operations from the vehicle popup (change name, load, unload) are available.
    -   There is a detailed list of the personnel that belongs to the vehicle.
    -   A list of patients that are in the vehicle is shown and the patients tab opens for details when clicking a patient.
    -   Vehicles can be deleted or moved to the map.
    -   Trainers can see the current occupation of a vehicle and cancel it.
-   Simulated regions are prefixed with "\[Simuliert]" in the request target selection for the requests behavior.
-   The patient, whose popup is open, is now highlighted.
-   There is now a behavior that transfers patients. It has configurable load times and delay between transfers.
    -   Its user interface can be used to transfer specific patients in specific vehicles.
    -   Its user interface displays what vehicles are being loaded and what vehicles are waiting for transfer.
-   Exercises can be started and paused trough a new button in the simulated regions modal, so the modal does not have to be closed to access the button in the toolbar.
-   Changes of the treatment progress can now be reported automatically.
-   The waiting times for vehicles that are getting loaded or are waiting for transfer are shown.
-   There are now buttons in the patients and vehicles tabs that create and lead to a transfer behavior that is pre filled with the patient or vehicle.

### Changed

-   Loading or unloading a vehicle from its popup does not close the popup automatically.
-   Patient treatment sorts the patients by their UUID before triaging or assigning treatments in simulated regions. This way, the order of triage does not depend on the order the patients have been added.
-   The load all into vehicle button in the vehicle popup is now visible to trainers only.

### Fixed

-   For Tragetrupp vehicles, the load and unload buttons are now properly disabled.
-   The patient status display now updates the pregnancy indicator properly.

## [0.4.1] - 2023-04-20

### Fixed

-   Added a guard clause to handle exercises with radiogram actions containing incorrect uuids.
-   Fixed deletion of invalid actions in the database.

## [0.4.0] - 2023-04-19

### Added

-   There is now a display for how many different variations of a patient template exists.
-   There is now a display for whether a patient is pregnant.
-   The patient status display that visualizes the progression of a patient explains its icons via a tooltip.
-   There is now a behavior that answers vehicle requests from other regions.
-   There is now a behavior that automatically distributes vehicles to regions.
    -   The types and optional limits of the distribution can be specified.
    -   The behavior distributes the vehicles in rounds of one vehicle per category for every region every 60 seconds
-   There is now a behavior to forward requests to other simulated regions or the trainees.
-   There is now a radiogram for missing transfer connections and vehicle requests.
    -   Radiograms for vehicle requests can also be answered in the user interface, whether they have been accepted or not.
-   When personnel is missing during patient treatment in a simulated region, the reassign treatment activity now sends an event to notify the region about the shortage.
-   A new behavior has been added to respond to personnel shortages by instructing the region to request new vehicles.
    -   The priorities of vehicles to request can be configured in a new behavior tab.
-   Development builds (the docker container with the `dev` tag) now show the commit hash they have been built from in the version number.
-   The time until the next treatment recalculation for the automatic patient treatment is shown.

### Fixed

-   New patients added to simulated regions during treatment are now also triaged and treated.
-   When treatment is no longer secured, the displayed status is reverted back to lack of personnel.
-   When the treatment status changes, personnel is reassigned immediately instead of after the next interval.

### Changed

-   The icon for `C` (transport priority) in a patient status code has been changed to a road sign to be distinguishable from the icon for `D` (complication).
-   `ConditionParameters.minimumHealth` and `ConditionParameters.maximumHealth` are now inclusive.
-   Connected transfer points and hospitals are now listed in alphabetical order in the transfer popups.

### Fixed

-   Dead/Black patients can now be treated (for the automatic triage to work), but they won't be treated after triage.

## [0.3.0] - 2023-03-27

### Added

-   There are now radiograms, which can be used by the simulation to send messages to the trainees. These are generated automatically by an activity.
    -   There is a radiogram for displaying the material count in a simulated region.
    -   There is a radiogram for displaying the patient count in a simulated region.
    -   There is a radiogram for displaying the personnel count in a simulated region.
    -   There is a radiogram for displaying the vehicle count in a simulated region.
    -   There is a radiogram for displaying the current treatment status in a simulated region
-   There is a behavior responsible for creating and managing the activities which create radiograms
-   In the large simulation overview modal, a column has been added to interact with radiograms.
    -   It displays all radiograms, optionally filtered to those that are not done.
    -   Radiograms can be accepted and marked as done.
-   Behaviors can clean up the state when they are removed from a simulated region.
-   There are now tests, that ensure that migrations do not fail

### Fixed

-   "Leitstelle" was misspelled in the title of the EOC modal
-   Transfer points do not change their connection upon arrival of a vehicle

## [0.2.1] - 2023-03-11

### Changed

-   Revert previous change: Patients, vehicles, personnel and material inside a simulated region are now deleted, when the simulated region is deleted. For vehicles, personnel, and material, they will only be deleted if all that belong together are in the same simulated region.

### Fixed

-   Exercises in which simulated regions are deleted no longer crash on import due missing patients in the tick action.

## [0.2.0] - 2023-03-10

### Added

-   The popup of a simulated region now has five tabs: _Overview_, _Patients, \_Transfers_, _Hospitals_ and _Behaviors_
    -   The _Overview_ tab allows setting the name of the simulated region and shows the current number of patients, vehicles, personnel and material
    -   The _Patients_ tab lists all patients in the simulated region and allows inspecting their detailed information.
        When clicking on a patient somewhere else in the popup (e.g. in the treat patients behavior details), the patient will be shown in this tab.
    -   The _Transfers_ tab allows setting up transfer connections from/to other simulated regions and/or transfer points
    -   The _Hospitals_ tab allows setting up transfer connections to hospitals
    -   The _Behaviors_ tab allows adding and removing behaviors from simulated regions, inspect their current state and customize their settings
        -   For the assign leader behavior, the type of the currently assigned leader is shown
        -   For the treat patients behavior, the current treatment phase is shown. Additionally the matching from patients to personnel is shown, including information on how many patients are treated by the same personnel at a time and the visible status and progression of the patients. There are also settings for how often the matching is recalculated and how long it takes to count patients.
        -   For the unload arrived vehicles behavior, the unload duration can be set and all currently unloading vehicles are listed with their remaining time
-   To manage exercises with a large amount of simulated regions easily, a large modal has been added that can be used to manage all simulated regions
    -   Every simulated region popup shows a button to view the current simulated region in this modal
-   Simulated Regions now act as transfer points, meaning that they can be start and destination of a transfer
    -   Connection lines will be shown for transfer connections from/to simulated regions, too

### Changed

-   Images are now stored in git and not git lfs anymore
-   Patients, vehicles, personnel and material inside a simulated region are now deleted, when the simulated region is deleted. For vehicles, personnel, and material, they will only be deleted if all that belong together are in the same simulated region.

### Fixed

-   Making a _Gruppenführer_ leader of a simulated region if the region already had a leader did not work. Now, if there already is a leader, better personnel (i.e. the old leader was not a _Gruppenführer_ but the new one is) will be chosen as new leader
-   When a _Gruppenführer_ is leader of a simulated region, the treat patients behavior no longer stops working
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

[Unreleased]: https://github.com/hpi-sam/digital-fuesim-manv/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/hpi-sam/digital-fuesim-manv/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/hpi-sam/digital-fuesim-manv/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/hpi-sam/digital-fuesim-manv/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/hpi-sam/digital-fuesim-manv/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/hpi-sam/digital-fuesim-manv/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/hpi-sam/digital-fuesim-manv/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/hpi-sam/digital-fuesim-manv/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/hpi-sam/digital-fuesim-manv/compare/37bd43bc1beb4aa9ad597b1ac763dd71b5709737...v0.0.0
