# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.23.19](https://github.com/PDMLab/docker-compose/compare/v0.23.18...v0.23.19) (2023-02-05)

### [0.23.18](https://github.com/PDMLab/docker-compose/compare/v0.23.17...v0.23.18) (2023-01-24)


### Bug Fixes

* add stopMany to default exports ([ff914e9](https://github.com/PDMLab/docker-compose/commit/ff914e910cb963b8fa7f283a1f51cb66fae0f52b))

### [0.23.17](https://github.com/PDMLab/docker-compose/compare/v0.23.16...v0.23.17) (2022-01-18)


### Bug Fixes

* ps --services trim on undefined ([#201](https://github.com/PDMLab/docker-compose/issues/201)) ([5df547e](https://github.com/PDMLab/docker-compose/commit/5df547e0af97bc6ba2ac96aab26eb5bf4b60e2b8))

### [0.23.16](https://github.com/PDMLab/docker-compose/compare/v0.23.15...v0.23.16) (2022-01-16)


### Features

* stop many ([#200](https://github.com/PDMLab/docker-compose/issues/200)) ([f10a9b6](https://github.com/PDMLab/docker-compose/commit/f10a9b610160c4ac06d0d38cbd9db4a6fe7761c9))

### [0.23.15](https://github.com/PDMLab/docker-compose/compare/v0.23.14...v0.23.15) (2022-01-14)


### Bug Fixes

* **#178:** fix quiet trim issue, add tests ([#197](https://github.com/PDMLab/docker-compose/issues/197)) ([2016bc7](https://github.com/PDMLab/docker-compose/commit/2016bc75db9996155d61f3d7f93c98c5fb960df1))

### [0.23.14](https://github.com/PDMLab/docker-compose/compare/v0.23.13...v0.23.14) (2021-11-29)


### Features

* passing callback to report progress ([#191](https://github.com/PDMLab/docker-compose/issues/191)) ([f60e4d5](https://github.com/PDMLab/docker-compose/commit/f60e4d5a186ea3ca0b99e8443e1c4006d75be5a7))

### [0.23.13](https://github.com/PDMLab/docker-compose/compare/v0.23.12...v0.23.13) (2021-07-20)


### Features

* single container pause and unpause added ([5921b51](https://github.com/PDMLab/docker-compose/commit/5921b51977cbd51ffcb1def458738ccfccbe1dd9))


### Bug Fixes

* now lints correctly ([74b4d6e](https://github.com/PDMLab/docker-compose/commit/74b4d6ea22d7e1b9ebbbbe9874e5314b7adfa31a))

### [0.23.12](https://github.com/PDMLab/docker-compose/compare/v0.23.11...v0.23.12) (2021-06-06)


### Features

* **dx:** add default export ([c4b6087](https://github.com/PDMLab/docker-compose/commit/c4b60872aecfdc6610e9b2141a45ea7785820af7))

### [0.23.11](https://github.com/PDMLab/docker-compose/compare/v0.23.10...v0.23.11) (2021-06-04)

### [0.23.10](https://github.com/PDMLab/docker-compose/compare/v0.23.9...v0.23.10) (2021-05-11)


### Bug Fixes

* fix mapping ipv6-based port mappings ([53fb971](https://github.com/PDMLab/docker-compose/commit/53fb97196f3cf0ebb229d127e9b630c863eaf8fc))
* fix mapping ipv6-based port mappings ([6dec0c6](https://github.com/PDMLab/docker-compose/commit/6dec0c6bb6220b06eff188a26220b405d632bed3))
* fix mapping ipv6-based port mappings ([dbdb900](https://github.com/PDMLab/docker-compose/commit/dbdb9008f25d237254312d79382e342d03f4c5bb))
* fix mapping ipv6-based port mappings ([8aa8465](https://github.com/PDMLab/docker-compose/commit/8aa846553c2d045f610392bf38569fb3579b9aa6))
* fix mapping ipv6-based port mappings ([21b63cb](https://github.com/PDMLab/docker-compose/commit/21b63cbc53635ee8532c388e57f4552f1b3ae6e3))
* fix mapping ipv6-based port mappings ([48c9f08](https://github.com/PDMLab/docker-compose/commit/48c9f0841af2bbcb8ec666a38eee3ab8236304d0))
* fix mapping ipv6-based port mappings ([e7013df](https://github.com/PDMLab/docker-compose/commit/e7013dfab10e4e369ee076b465c40a5bcb50802b))

### [0.23.9](https://github.com/PDMLab/docker-compose/compare/v0.23.8...v0.23.9) (2021-05-08)


### Features

* Add execPath option to set path to docker-compose executable ([58f09f4](https://github.com/PDMLab/docker-compose/commit/58f09f4c7414df5a6ee7af7f77d2af297d84d6c1))

### [0.23.8](https://github.com/PDMLab/docker-compose/compare/v0.23.7...v0.23.8) (2021-04-15)


### Bug Fixes

* ignore vuepress cache + temp files on release ([#148](https://github.com/PDMLab/docker-compose/issues/148)) ([e58387d](https://github.com/PDMLab/docker-compose/commit/e58387d82e4586f7a8156446f12c999c9a6f9f42))

### [0.23.7](https://github.com/PDMLab/docker-compose/compare/v0.23.5...v0.23.7) (2021-04-14)


### Features

* allow to pass docker compose configuration as string ([e8c14d3](https://github.com/PDMLab/docker-compose/commit/e8c14d318ce440ab02c858b1ca1dbeeb2985dc00))
* make result for `config --services` command type safe ([6f105ca](https://github.com/PDMLab/docker-compose/commit/6f105ca16098ba8de11f85ec0d092130b65293e4))
* make result for `config --volumes` command type safe ([51b20b4](https://github.com/PDMLab/docker-compose/commit/51b20b43d6eccac45653553437a546e4ccee51a6))
* make result for `config` command type safe ([a2f5a4e](https://github.com/PDMLab/docker-compose/commit/a2f5a4ec0eee8fcbd60fa12f969b8eb83a4730fb))
* make result for `port` command type safe ([70a98f4](https://github.com/PDMLab/docker-compose/commit/70a98f473b7bd46f0aa03c1a4334fa2abf6c3455))
* make result for `ps` command type safe ([880d252](https://github.com/PDMLab/docker-compose/commit/880d2522b5777db30c48569a41dd09fb7e46a4b3))
* make result for `version` command type safe ([a7da038](https://github.com/PDMLab/docker-compose/commit/a7da0380a8464bbd2efc2c16b70b67d4fdf77c24))


### Bug Fixes

* filter empty entries from `config --services` command ([ed91eba](https://github.com/PDMLab/docker-compose/commit/ed91eba770d3a32d82dda4e927d31ed4b6d01db4))
* **test:** fix broken tests ([afb2b11](https://github.com/PDMLab/docker-compose/commit/afb2b1116b12c4800563e85adb15ebd39e030516))

### [0.23.6](https://github.com/PDMLab/docker-compose/compare/v0.23.5...v0.23.6) (2021-01-06)


### Features

* allow to pass docker compose configuration as string ([e8c14d3](https://github.com/PDMLab/docker-compose/commit/e8c14d318ce440ab02c858b1ca1dbeeb2985dc00))

### [0.23.5](https://github.com/PDMLab/docker-compose/compare/v0.23.4...v0.23.5) (2020-07-10)


### Bug Fixes

* update flags incompatible with detached mode ([c808fa2](https://github.com/PDMLab/docker-compose/commit/c808fa2b90b2fd5db239685d101ccaa554ad98cf))

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
