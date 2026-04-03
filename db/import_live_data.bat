@echo off
set PGPASSWORD=root
echo Importing live_data_export.sql into the teamm3 PostgreSQL database...
psql -U postgres -h localhost -p 5432 -d teamm3 -f live_data_export.sql
echo Database imported successfully!
pause
