@echo off
set PGPASSWORD=root
echo Exporting the teamm3 PostgreSQL database to live_data_export.sql...
pg_dump -U postgres -h localhost -p 5432 -d teamm3 -F p -f live_data_export.sql
echo Database exported successfully!
pause
