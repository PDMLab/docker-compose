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
