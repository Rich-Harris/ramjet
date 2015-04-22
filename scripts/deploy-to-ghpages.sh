#!/bin/bash

set -e;

if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
	echo "Deploying to Github pages..."

	( cd dist
		git init
		git config user.name "Travis-CI"
		git config user.email "richard.a.harris+travis@gmail.com"
		git add .
		git commit -m "Deployed to Github Pages"

		echo "Pushing to gh-pages"
		git push --force "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
	)
fi
