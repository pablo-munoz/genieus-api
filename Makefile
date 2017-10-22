git_sha := $(shell git rev-parse --short HEAD)
build_date := $(shell date "+%Y-%m-%d-%H")

.PHONY: run
run:
	docker run -d -v ${PWD}:/genieus-api -p 5000:5000 --name genieus-api pmunoz/genieus-api:development

.PHONY: build
build:
	docker build -t pmunoz/genieus-api:development .
	docker tag pmunoz/genieus-api:development pmunoz/genieus-api:${git_sha}
	docker tag pmunoz/genieus-api:development pmunoz/genieus-api:${build_date}

.PHONY: deploy
push: build
	docker push pmunoz/genieus-api:development
	docker push pmunoz/genieus-api:${git_sha}
	docker push pmunoz/genieus-api:${build_date}

.PHONY: edit
edit:
	swagger project edit

.PHONY: clean
clean:
	docker stop genieus-api && docker rm genieus-api

.PHONY: logs
logs:
	docker logs genieus-api -f
