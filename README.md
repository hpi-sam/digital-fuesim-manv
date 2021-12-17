# digital-fuesim-manv

The official code for BP2021HG1

# Installation

1. Install [NodeJs](https://nodejs.org/) (at least version 14.x)
2. [npm](https://www.npmjs.com/) should already come with NodeJs - if not install it
3. Clone this repository
4. Run `npm install` in the root directory
5. a) Run ``npm install` in `/frontend`, `/shared` and `/backend`
   b) Run `npm run install` in the root folder

## Starting for development

### Option 1:

If you are using [vscode](https://code.visualstudio.com/), you can run the [task](https://code.visualstudio.com/docs/editor/tasks) `Start all` to start everything in one go.

### Option 2:

1. Open a terminal in `/shared` and run `npm run watch`
2. Open another terminal in `/frontend` and run `npm run start`
3. Open another terminal in `/backend` and run `npm run start`

## Debugging (in vscode)

### frontend

There are already the following [debug configurations](https://code.visualstudio.com/docs/editor/debugging) saved:

-   [frontend] Launch Chrome against localhost
-   [frontend] Attach to Karma
-   [frontend] Run test file

## Styleguide

-   names are never unique, ids are
