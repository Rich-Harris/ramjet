#!/bin/sh

PATH=node_modules/.bin:$PATH

gobble build -f .tmp

rm -rf dist
mkdir -p dist
cp .tmp/ramjet.js dist/ramjet.js
cp .tmp/ramjet.min.js dist/ramjet.min.js