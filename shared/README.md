# Shared

This package contains utility functions, classes, types, etc. that are shared between the frontend and the backend.

Keep in mind to add new exports to the `index.ts` file in the folder.

## Architecture

-   [src/models/](./src/models) classes, interfaces and types that are used in the [state](./src/state.ts)
    -   Note that in all cases other than validation plain objects of these classes have to be used (instead of instance objects). You can use the `create` methods of all models for this.
-   [src/store/](./src/store) reducers, actions and utilities that are used with the state
-   [src/utils/](./src/utils) general utilities
-   [src/socket-api/](./src/socket-api) the types for [socket.io](https://socket.io/docs/v4/typescript/)
-   [src/data/](./src/data) data like default objects for the state or dummy objects for testing
-   [src/state-helpers/](./src/state-helpers) utilities for working with the state.

## Updates to state types

Note that whenever the state types get updated you have to update `ExerciseState.currentStateVersion` in [`state.ts`](./src/state.ts).

## IsDevelopment

To check whether the current environment is in development or production mode, a global environment variable is assumed to be set. Look at [`utils/is-development.ts`](./src/utils/is-development.ts) for further information.
