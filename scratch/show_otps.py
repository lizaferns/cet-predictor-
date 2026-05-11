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
    cursor.execute("SELECT email, otp, expires_at FROM otps")
    rows = cursor.fetchall()
    print("Active OTPs in Database:")
    for row in rows:
        print(f"Email: {row[0]}, OTP: {row[1]}, Expires At: {row[2]}")
    conn.close()
except Exception as e:
    print("Error:", e)
