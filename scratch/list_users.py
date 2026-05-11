import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "WILL@_1981",
    "database": "cet_predictor"
}

def list_users():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT id, username, name, email, phone, created_at FROM users")
        users = cursor.fetchall()
        
        if not users:
            print("No users found.")
        else:
            print(f"{'ID':<5} | {'Name':<20} | {'Email':<30} | {'Phone':<15} | {'Username':<15}")
            print("-" * 90)
            for user in users:
                print(f"{user['id']:<5} | {user['name']:<20} | {user['email']:<30} | {user['phone'] or 'N/A':<15} | {user['username']:<15}")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_users()
