import mysql.connector
from mysql.connector import Error

DB_NAME = "cet_predictor"
USER = "root"
PASSWORD = "VaLIaMpwaJescUNEcyBlCuInrFbovJPI"  # replace with your actual MySQL password
HOST = "mysql.railway.internal"

def setup_db():
    try:
        # Connect to MySQL server (no database selected yet)
        conn = mysql.connector.connect(
            host=HOST,
            user=USER,
            password=PASSWORD
        )
        cur = conn.cursor()

        # Create database if it doesn't exist
        cur.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' created or already exists.")

        cur.close()
        conn.close()

        # Connect to the cet_predictor database
        conn = mysql.connector.connect(
            host=HOST,
            user=USER,
            password=PASSWORD,
            database=DB_NAME
        )
        cur = conn.cursor()

        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        print("Table 'users' created or already exists.")

        cur.close()
        conn.close()

    except Error as e:
        print(f"Error during DB setup: {e}")

if __name__ == "__main__":
    setup_db()
