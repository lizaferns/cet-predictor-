import mysql.connector

DB_CONFIG = {
    "host": "mysql.railway.internal",
    "user": "root",
    "password": "VaLIaMpwaJescUNEcyBlCuInrFbovJPI",
    "database": "cet_predictor"
}

def check_otps():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT email, otp, created_at FROM otps ORDER BY created_at DESC LIMIT 5")
        rows = cursor.fetchall()
        
        if not rows:
            print("No OTPs found in the database.")
        else:
            print(f"{'Email':<30} | {'OTP':<10} | {'Created At':<20}")
            print("-" * 65)
            for row in rows:
                print(f"{row[0]:<30} | {row[1]:<10} | {row[2]}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_otps()
