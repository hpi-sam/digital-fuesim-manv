# Benchmarks

This package contains benchmarks that can be used to

-   track and compare the performance of different exerciseExports
-   check different exerciseExports and the current reducers for correctness
-   test migrations on different exerciseExports
-   run custom benchmarks and tests - good for fast prototyping

## Running the benchmarks

The benchmarks are run on all exerciseExports in [`data/`](data/).
To test custom or confidential exerciseExports, add them to the [`data/`](data/) folder. Only exerciseExports ending with `.permanent.json` are tracked by git.
The benchmarks can be run with `npm run benchmark`.

## Architecture

The entry point to the benchmarks is [`src/app.ts`](src/app.ts).

If you want to check the implementation of a specific benchmark or want to add a new one look in [`src/steps.ts`](src/steps.ts).
To add a new benchmark, add a new step to the `steps` array in [`src/steps.ts`](src/steps.ts) and modify the stepState.
