#!/bin/sh

PATH=node_modules/.bin:$PATH

gobble build -f .tmp

rm dist/*
cp .tmp/ramjet* dist