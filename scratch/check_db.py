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
    print("Connection successful!")
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    print("Tables:", cursor.fetchall())
    conn.close()
except Exception as e:
    print("Connection failed:", e)
