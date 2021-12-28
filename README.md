# digital-fuesim-manv

The official code for BP2021HG1

# Installation

1. Install [NodeJs](https://nodejs.org/) (at least version 14.x)
2. [npm](https://www.npmjs.com/) should already come with NodeJs - if not install it
3. Clone this repository
4. Either a or b:

    a) Run `npm run install:all` in the root folder
    b) Run `npm install` in the root directory, `/frontend`, `/shared` and `/backend`

## Starting for development

### Option 1:

If you are using [vscode](https://code.visualstudio.com/), you can run the [task](https://code.visualstudio.com/docs/editor/tasks) `Start all` to start everything in one go.

### Option 2:

1. Open a terminal in `/shared` and run `npm run watch`
2. Open another terminal in `/frontend` and run `npm run start`
3. Open another terminal in `/backend` and run `npm run start`

## Debugging

### frontend

There are already the following [debug configurations](https://code.visualstudio.com/docs/editor/debugging) for vscode saved:

-   [frontend] Launch Chrome against localhost
-   [frontend] Attach to Karma
-   [frontend] Run test file

In addition you can make use of the following browser extensions:

-   [Angular DevTools](https://chrome.google.com/webstore/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh)
-   [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension/) for [NgRx](https://ngrx.io/guide/store-devtools)

## End to end tests

We are using [cypress](https://www.npmjs.com/package/cypress) to run the end-to-end tests. You can find the code under `/frontend/cypress` in the repository.

### Running the tests

To run the tests locally it is recommended to use the vscode [task](https://code.visualstudio.com/docs/editor/tasks) `Start all & cypress`. Alternatively you can start the frontend and backend manually and then run `npm run cy:open` in `/frontend`.

If you only want to check wether the tests are passing you can run `npm run cy:run` in `/frontend` instead.

### Visual regression testing

We are also making use of visual regression tests via [cypress-image-diff](https://github.com/uktrade/cypress-image-diff).
The screenshots are stored under `/frontend/cypress-visual-screenshots`.

The `baseline` folder contains the reference screenshots (the desired result).
If a test fails a new screenshot is taken and put in the `comparison` folder.
If the new screenshot is the new desired result, then you only have to move it in the `baseline` folder and replace the old reference screenshot with the same name.
In the `diff` folder you can see the changes between the baseline and the comparison screenshot.

## Styleguide

-   names are never unique, ids are
