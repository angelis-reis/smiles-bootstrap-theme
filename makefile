# HELP
.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

ci-build: # build do tema da mesma forma que sera executado no pipeline
	# docker run --rm -v ${CURDIR}:/usr/src/app -w /usr/src/app/ jenkins/jenkins:2.230-centos7 /bin/sh -c 'nvm --version' 
	docker run --rm -v ${CURDIR}:/usr/src/app -w /usr/src/app/ node:12.13 /bin/sh -c 'npm install --only=prod && npm run ci:build' 