# Variables
IMAGE_NAME = resume-site
CONTAINER_NAME = resume-container
PORT = 8080

.PHONY: help install dev build preview docker-build docker-run docker-clean docker-pdf

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install local dependencies
	npm install

dev: ## Run local development server
	npm run dev

build: ## Build site and generate static PDF locally
	npm run build
	npm run generate-pdf

preview: ## Preview the production build locally
	npm run preview

docker-build: ## Build the Docker image (forced to linux/amd64 for cross-platform compatibility)
	docker build --platform linux/amd64 -t $(IMAGE_NAME) .

docker-run: docker-build ## Build and run the site via Docker on port 8080
	@echo "Site will be available at http://localhost:$(PORT)"
	docker run --rm -p $(PORT):80 --name $(CONTAINER_NAME) $(IMAGE_NAME)

docker-pdf: ## Extract documents from Docker
	@echo "Building builder stage..."
	docker build --platform linux/amd64 --target builder -t resume-builder-temp .
	@echo "Extracting documents..."
	docker run --name $(CONTAINER_NAME)-temp resume-builder-temp /bin/true
	docker cp $(CONTAINER_NAME)-temp:/app/dist/resume.pdf ./Gaurav_Resume_Professional.pdf
	docker cp $(CONTAINER_NAME)-temp:/app/dist/resume-simple.pdf ./Gaurav_Resume_Simple.pdf
	docker cp $(CONTAINER_NAME)-temp:/app/dist/resume-simple.docx ./Gaurav_Resume_Simple.docx
	docker rm $(CONTAINER_NAME)-temp
	@echo "Documents extracted: Gaurav_Resume_Professional.pdf, Gaurav_Resume_Simple.pdf, Gaurav_Resume_Simple.docx"

docker-clean: ## Remove Docker images and containers
	-docker rm -f $(CONTAINER_NAME)
	-docker rmi $(IMAGE_NAME)
	-docker rmi resume-builder-temp
