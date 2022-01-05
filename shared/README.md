# Shared

This package contains utility functions, classes, types, etc. that are shared between the frontend and the backend.

Keep in mind to add new exports to the `index.ts` file in the folder.

## Architecture

-   [src/models/](./src/models) classes, interfaces and types that are used in the [state](./src/state.ts)
-   [src/store/](./src/store) reducers, actions and utilities that are used with the state
-   [src/utils/](./src/utils) general utilities
-   [src/socket-api/](./src/socket-api) the types for [socket.io](https://socket.io/docs/v4/typescript/)
