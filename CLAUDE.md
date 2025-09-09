# CLAUDE.md

There are two React apps in this repository, but 04_market was created just for testing out stuff. You should take into consideration only 05_design, modify only that one.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a learning repository containing multiple projects demonstrating different technologies:

- `02_python_tools/` - Python package development and number guessing game
- `03_python_fastapi_project/` - FastAPI web application template  
- `04_market/` - THIS WAS JUST FOR TEST, DON'T MODIFY THIS
- `05_design/` - React/Vite design/UI focused application

## Common Development Commands

### Python Projects (02_python_tools/, 03_python_fastapi_project/)

**FastAPI Project (03_python_fastapi_project/fastapi-template/):**
- Setup: `uv sync`
- Run dev server: `uv run uvicorn main:app --reload`
- Run tests: `uv run pytest`
- Format code: `uv run black .` and `uv run isort .`
- Lint: `uv run flake8 .`

**Python Tools Package (02_python_tools/packages/):**
- Install in dev mode: `pip install -e .` (from packages/ directory)
- Test installation: Run `python ../test_import_fancy_pack/test.py` from packages/ directory

### React/Vite Projects (04_market/, 05_design/)

**Development commands (run from project directory):**
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Run linter: `npm run lint`
- Preview production build: `npm run preview`

## Architecture Overview

### Python Projects
- **FastAPI Template**: Standard FastAPI structure with SQLAlchemy ORM, SQLite database, Pydantic models, async support
- **Python Tools**: Simple Python package with number guessing game functionality

### React Projects  
- **04_market**: THIS WAS JUST FOR TEST, DON'T MODIFY THIS
- **05_design**: React application focused on UI/design with Tailwind CSS and Lucide icons

## Technology Stack

**Python Stack:**
- FastAPI for web framework
- SQLAlchemy + SQLite for database (async)
- Pydantic for data validation
- uv for dependency management
- pytest for testing

**React Stack:**
- React 19 with Vite build tool
- Tailwind CSS for styling
- ESLint for code quality
- PostCSS for CSS processing
- Framer Motion for animations (04_market only)

## Development Guidelines

- Each project is self-contained in its directory
- Python projects use modern async patterns where applicable
- React projects follow standard Vite + React patterns
- All projects include linting and formatting tools
- FastAPI project includes comprehensive API documentation via automatic OpenAPI generation