#!/bin/sh

if [ $INITIAL -eq 1 ]; then
  cd app
  alembic upgrade head
  python populate_database_metadata.py -f ../data/food_data.csv -n ../data/nutrition_data_types.csv -m ../data/measurement.csv
  cd ..
fi

uvicorn app.main:app `if [ $DEV -eq 1 ]; then echo --reload; fi` --host 0.0.0.0 --port 9000