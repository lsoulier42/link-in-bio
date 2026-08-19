.PHONY: up down build shell composer logs

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

shell:
	docker compose exec php bash

composer:
	docker compose exec php composer install -d backend

console:
	docker compose exec php php backend/bin/console $(cmd)

logs:
	docker compose logs -f
