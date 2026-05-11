import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "WILL@_1981",
    "database": "cet_predictor",
    "port": 3306 
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("DESCRIBE otps")
    print("Schema of 'otps' table:")
    for row in cursor.fetchall():
        print(row)
    conn.close()
except Exception as e:
    print("Error:", e)
