import psycopg2
try:
    psycopg2.connect('postgresql://postgres.dealdikgxoibbnlomyoy:Sushant@1234@aws-0-ap-south-1.pooler.supabase.com:6543/postgres')
    print('SUCCESS')
except Exception as e:
    print('ERROR:', e)
