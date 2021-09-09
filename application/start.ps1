param ($initial=0)
if ($initial) {
  Set-Location app
  alembic upgrade head
  python populate_database_metadata.py -f ../data/food_data.csv -n ../data/nutrition_data.csv
  Set-Location ..
}

uvicorn app.main:app --reload --host 0.0.0.0 --port 9000