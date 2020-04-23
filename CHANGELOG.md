# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.23.4](https://github.com/PDMLab/docker-compose/compare/v0.23.3...v0.23.4) (2020-04-23)


### Features

* allow passing service names to `rm` function ([3a68db7](https://github.com/PDMLab/docker-compose/commit/3a68db75e3b879f12fe3c6cedbc9ad09a52914a5))

### [0.23.3](https://github.com/PDMLab/docker-compose/compare/v0.23.2...v0.23.3) (2020-03-06)


### Features

* add ability to pass --abort-on-container-exit flag to up methods ([e85af8c](https://github.com/PDMLab/docker-compose/commit/e85af8c092a54a3fb48519bb39956324bbef4fc2))


### Bug Fixes

* reset jest set timeout to original value ([c4ed7ed](https://github.com/PDMLab/docker-compose/commit/c4ed7ed2de9c4c161518ab1d1fc50877df4c7fa2))

### [0.23.2](https://github.com/PDMLab/docker-compose/compare/v0.23.1...v0.23.2) (2019-12-31)

### [0.23.1](https://github.com/PDMLab/docker-compose/compare/v0.23.0...v0.23.1) (2019-10-26)

# 0.23.0 / 2019-10-25

## :tada: Enhancements

* [#97](https://github.com/PDMLab/docker-compose/pull/97):
  * Add a `version` function

# 0.22.2 / 2019-08-31

## :bug: Fixes

* [#94](https://github.com/PDMLab/docker-compose/pull/94):
  * Fix a copy-paste typo for pull commands

# 0.22.1 / 2019-08-31

## :tada: Enhancements

* [#93](https://github.com/PDMLab/docker-compose/pull/93):
  * Add pull command methods to readme

## :lock: Security Fixes
* [#92](https://github.com/PDMLab/docker-compose/pull/92):
  * Fix `eslint-utils` security issue

# 0.22.0 / 2019-08-30

## :tada: Enhancements

* [#90](https://github.com/PDMLab/docker-compose/pull/90):
  * Add `pullOne`, `pullMany` and `pullAll` methods

# 0.21.0 / 2019-08-15

## :tada: Enhancements

* [#89](https://github.com/PDMLab/docker-compose/pull/89):
  * Add `stopOne()` command

# 0.20.2 / 2019-07-30

## :tada: Enhancements

* [#87](https://github.com/PDMLab/docker-compose/pull/87):
  * Use proper `es2015` library (for Promises, etc.) in `tsconfig`

## :bug: Fixes

* [#87](https://github.com/PDMLab/docker-compose/pull/87):
  * Fix linting after build was called
* [#86](https://github.com/PDMLab/docker-compose/pull/86):
  * Fix interfaces not being exposed in typings file

# 0.20.1 / 2019-07-26

## :tada: Enhancements

* [#84](https://github.com/PDMLab/docker-compose/pull/84):
  * Set Node 6.0 as minimum version

# 0.20.0 / 2019-07-23

## :tada: Enhancements

* [#83](https://github.com/PDMLab/docker-compose/pull/83):
  * Migrate to Typescript

# 0.19.0 / 2019-07-13

## :tada: Enhancements

* [#77](https://github.com/PDMLab/docker-compose/pull/77):
  * handle error based on exit code
  * replace `tape` with `jest`

# 0.18.0 / 2019-07-10

## :tada: Enhancements

* [#82](https://github.com/PDMLab/docker-compose/pull/82): Allow passing an array as command to `run` and `exec`

# 0.17.3 / 2019-05-29

## :bug: Fixes

* [#69](https://github.com/PDMLab/docker-compose/pull/76): Fix declaration for `logs` function

# 0.17.2 / 2019-05-02

## :nut_and_bolt: Other

* [#69](https://github.com/PDMLab/docker-compose/issues/69): Remove winston dependency and lib/log

# 0.17.1 / 2019-05-01

## :bug: Fixes

* [#66](https://github.com/PDMLab/docker-compose/issues/66): Trailing commas causing syntax error on NodeJS 6.x

# 0.17.0 / 2019-04-30

## :tada: Enhancements

* [#58](https://github.com/PDMLab/docker-compose/issues/58): Expose docker-compose exit code in results
