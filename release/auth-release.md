# How CHANGELOG is setup for the auth project

## Installing dependencies

- Install husky
`npm install husky --include=dev`

- Install release-t
`npm install release-it @release-it/conventional-changelog @commitlint/config-conventional @commitlint/cli --include=dev`

- Install husky - Git hooks

```bash
$ ./node_modules/husky/lib/bin.js install
husky - Git hooks installed
```

- create file `commit-msg` in `.husky/commit-msg`

- make file executable
`chmod +x .husky/commit-msg`

- add and commit changes

- configure `release-it` through [commitlint.config.js](./commitlint.config.js)

- run "release-it"
`npm run release`
