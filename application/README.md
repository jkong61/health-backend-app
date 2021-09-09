# Backend API for \<HealthApp\>

Requirements:
- Python 3.7 (`sudo apt install python3.7 python3.7-dev python3.7-venv`)
	- [pip-tools](https://github.com/jazzband/pip-tools) (`python3.7 -m pip install`)
- PostgreSQL (`sudo apt install postgresql postgresql-contrib`)
	- Start service if necessary: `sudo service postgresql restart`
	- Install psycopg2: `sudo apt install python-psycopg2 libpq-dev`
	- To enable PostgreSQL on system boot: `sudo systemctl enable postgresql`
	- Set up database:
		1. `sudo -i -u postgres`
		2. `createuser --interactive`
		3. `createdb <user>`

Development Setup:
1. Install requirements
2. Set up the virtual environment: `python3.7 -m venv venv`
3. Activate the Python environment: `. venv/bin/activate`
4. Install pip-tools: `pip install pip-tools`
5. Install python dependencies: `pip-sync requirements-dev.txt`
6. Create .env file: `cp .env.example app/.env`
	- Generate secret key and add it to `.env`: `openssl rand -hex 32`
7. Run the database migration: `alembic upgrade head`
8. Populate metadata tables: `python populate_database_metadata.py`
9. Start server: `uvicorn main:app --reload --host 0.0.0.0`
