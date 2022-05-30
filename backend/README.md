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

When starting, the `index.ts` is executed. It establishes a database connection and creates a `FuesimServer`, which automatically starts the application.

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

### Database

We are using [PostgreSQL 14](https://www.postgresql.org/) for persistance with [typeorm](https://github.com/typeorm/typeorm/) as an in-between layer for model definitions and interaction with the database.

The credentials and other parameters of the database must match the [`.env` file in the root directory](../.env).

#### Start the database

There are two main ways to start the database.

##### Option 1 using `docker-compose` (recommended)

(All `docker-compose` commands have to be run in the project root directory, all `npm` scripts have to be run in the `backend/` folder.)

1. Setup your environment file. If you don't have another service running on port 5432 you can use the default settings (otherwise just use another port as your `DFM_DB_PORT`), apart from the password where you should use a good one, and the host which should be changed from `db` to `localhost` in case you want to run the backend and the database on your host machine.
2. Make sure to have `docker-compose` installed, refer to [the relevant section of the root README for this](../README.md#starting-for-deployment-using-docker).
3. If you want to start both the server and the database using `docker-compose`, use `docker-compose up -d`, in case you only want to start the database, use `docker-compose up -d db`.
   In the latter case you probably need the database exposed to your host machine. For this, uncomment the `ports` section of the [`docker-compose.yml`](../docker-compose.yml).
4. Run all pending migrations, [see below](#npm-scripts).

##### Option 2 using PostgreSQL directly

You can also [install PostgreSQL 14 from the official page](https://www.postgresql.org/download/). However, this is untested and not supported by us. If you have any further questions refer to official sources for PostgreSQL, e.g. the [documentation](https://www.postgresql.org/docs/).

#### `npm` scripts

Use the npm script `migration:run` to apply all pending migrations, `migration:revert` to revert the latest migration (can be applied multiple times for older migrations) and `migration:generate <name>` to generate a new migration from the current changes between the models defined in code and present in the database.
Note that when using non-`sh`-like shells (e.g. Windows `cmd` and PowerShell) you have to append `:windows` to the names of the scripts.

You can use the npm script `db:purge` to remove all elements from the database (no need for `:windows` here).

#### Note for developers

Note that all changes in model and migration files have to be imported in [`src/database/data-source.ts`](./src/database/data-source.ts) before using them.

#### Without a database

If you want to, you can also disable the database.
Set the environment variable `DFM_USE_DB` (in [`../.env`](../.env)) to `false` to achieve this.
Note however that this results in a) all history being saved in memory instead of on disk, and b) once the backend exits, for whatever reason, all data is gone forever.

### Migrations

We use [state migrations](./src/database/state-migrations/) to convert outdated states to new versions.
Look at [`migrations.ts`](./src/database/state-migrations/migrations.ts) for more information.
