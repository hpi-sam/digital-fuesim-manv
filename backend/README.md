# Overview over the backend

## Split in `src` and `test`

The backend contains a `src` folder which is mainly intended for production code. It also contains unit test files.
The `test` folder on the other hand contains integration/end-to-end tests for the backend.

The rule of thumb for which test should go where is that if a test file tests the behavior of more than one source file, especially in case it tests the integration of those source files with each other or further parts of the backend, it should go in the `test` folder.
All other test files, i.e. files that only test the isolated behavior of a single source file, should be named the same as the file they test with the suffix `.spec.ts` instead of `.ts`.

## Environment Variables

A [`.env.example`](.env.example) file is provided, containing the default values for all environment variables (where such defaults exist).
To use them, copy the file to a new file called `.env` in the same directory. You can adjust the variables there for your own needs. This file is excluded from git to not share any sensitive information one might store in environment variables.
To use other values during automated tests, you can append `_TESTING` to a variable, which will then be preferred over the non-`_TESTING` variable.
For a more detailed view please look at the [`Config`](src/config.ts).

## Components

### `index.ts`

When starting, the `index.ts` is executed. It simply creates a `FuesimServer`, which automatically starts it.

### `FuesimServer`

The `FuesimServer` is a class responsible for starting and stopping both the webserver (`ExerciseHttpServer`) and the websocket server (`ExerciseWebsocketServer`) parts of the backend.
Both servers use `express` as the underlying architecture.
Both servers currently use CORS allow all origins as a temporary solution.

### `ExerciseHttpServer`

The webserver is responsible for all HTTP-API-Requests. This currently includes only creating and deleting an exercise.
The webserver sets up all available routes in its constructor. The methods doing the actual work for the routes are called there.
The communication between those is done using the `HttpResponse` type from [`src/exercise/http-handler/utils.ts`](src/exercise/http-handler/utils.ts) which includes a [response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) and a body that can also be used as an error message.
These worker methods are located in [`src/exercise/http-handler/api`](src/exercise/http-handler/api) and structured in files, where for each major route (e.g. `exercise` or `blobs`) there is a file with multiple methods, one for each allowed HTTP method.
All routes served by this server should be prefixed by `/api/`.

It listens on port `3201` by default (`13201` during tests).

The OpenAPI definition of this API can be found at [`../docs/swagger.yml`](../docs/swagger.yml).

### `ExerciseWebsocketServer`

The websocket server is used for websocket communication using [`socket.io`](https://socket.io/) between the backend and the connected clients.
It serves the most important role in both storing the exercise state and synchronizing it across the clients.
The handlers for incoming messages are defined in [`src/exercise/websocket-handler`](src/exercise/websocket-handler). Each message (as defined in `shared`) gets its own file.
They are registered in [`src/exercise/websocket.ts`](src/exercise/websocket.ts) when the client connects.

The websocket server listens on port `3200` by default (`13200` during tests).

### Storing clients

When a new client connects to the websocket, a [`ClientWrapper`](src/exercise/client-wrapper.ts) gets created for it, where the connection between the socket, the eventually selected exercise, and the exercise object representing this client is stored.
These client wrappers get added to the [`clientMap`](src/exercise/client-map.ts).

### Storing Exercises

When an exercise gets created an [`ExerciseWrapper`](src/exercise/exercise-wrapper.ts) gets created for it, where the current state, the state history, and the set of connected `ClientWrappers` gets stored.
Its main purpose is the `reduce` method, allowing an `ExerciseAction` to be applied to the current state while also storing the old state in the history. For more information on the state management see the [root Readme](../README.md#state-management-and-synchronisation).
