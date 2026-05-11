import os
from dotenv import load_dotenv

load_dotenv()

email = os.getenv("MAIL_EMAIL")
password = os.getenv("MAIL_PASSWORD")

print(f"MAIL_EMAIL: {email}")
print(f"MAIL_PASSWORD: {'SET' if password else 'NOT SET'}")

if password:
    print(f"Password starts with: {password[:4]}...")
