# valta.server

Websocket server

## setup

One time step. Must be repeated if `node_modules` folder is removed. Also run `yarn build` in common when you change it

    cd ../common
    yarn build
    yarn link
    cd ../server
    yarn link valta.common

## runnig

    yarn start

## lint

    yarn lint
