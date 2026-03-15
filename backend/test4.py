import psycopg2
try:
    psycopg2.connect(host='aws-0-ap-south-1.pooler.supabase.com', port=6543, user='postgres', password='Sushant@1234', database='postgres')
    print('SUCCESS')
except Exception as e:
    print('ERROR:', e)
