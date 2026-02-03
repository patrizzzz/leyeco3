# Interactive Electrical Post Mapping & Connection System

Quick start (Windows):

1. Create a virtual environment:

```powershell
python -m venv venv
venv\Scripts\Activate.ps1   # or venv\Scripts\activate for cmd
```

2. Install deps:

```powershell
pip install -r requirements.txt
```

3. Run the app:

```powershell
set FLASK_APP=app.py
set FLASK_ENV=development
python app.py
```

Open http://127.0.0.1:5000

Next steps: Use MySQL with SQLAlchemy and Flask-Migrate. Example steps:

1. Install MySQL server and create a database (e.g., `leyeco_db`).
2. Set your `DATABASE_URL` in `.env`:
   - `DATABASE_URL=mysql+pymysql://<user>:<password>@<host>/<dbname>`
3. Install deps:

```powershell
pip install -r requirements.txt
```

4. Initialize and run migrations:

```powershell
set FLASK_APP=app.py
flask db init     # only first time
flask db migrate -m "initial"
flask db upgrade
```

5. Seed sample data:

```powershell
python seed_db.py
```

6. Run app:

```powershell
python app.py
```

Notes: For advanced GIS queries consider PostGIS (PostgreSQL) for spatial functions. Use `Flask-Migrate` for schema migrations and keep your `DATABASE_URL` secure (do not commit credentials).