<div align="center">
    <img src="logo.png" />
    <div><strong>Multiplayer 4X strategy game</strong></div>
</diV>

## dev start

```sh
yarn install
yarn data
./node_modules/.bin/knex migrate:latest --env index-server-development
./node_modules/.bin/knex migrate:latest --env game-server-development

# each in different shell
yarn index-server
yarn game-server:dev
yarn client:dev
```

## generating a terrain svg

```sh
./node_modules/.bin/ts-node src/Common/Util/HexSvg.ts -C '#ffffff' -c '#000000' > thing.svg
```
