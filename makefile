up:
	docker-compose -f "docker-compose.yml" up -d --build --force-recreate
down:
	docker-compose -f "docker-compose.yml" down

restart: down debug

debug:
	docker-compose -f "docker-compose.yml" -f "docker-compose.dev.yml" up -d --build

build:
	docker-compose build --force-rm --no-cache && docker-compose -f "docker-compose.yml" up --detach