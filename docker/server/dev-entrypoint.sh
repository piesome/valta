#!/bin/sh

set -e

cd data
yarn
yarn link
npm run build
cd ..

cd common
yarn
yarn link
yarn link valta.data
cd ..

cd server
yarn
yarn link valta.common
yarn link valta.data
yarn start