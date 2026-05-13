"""
MHT-CET College Predictor — FastAPI backend
- Reads cutoff_2024.json with college_name / city_name / course_name structure
- Rule-based AI counselor (no TinyLlama)
- MySQL login and registration with bcrypt password hashing
- /api/predict returns results matching the React frontend's expectations
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import json
import os
from pathlib import Path
import mysql.connector
import bcrypt
import smtplib
import random
import time
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="MHT-CET College Predictor API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://starlit-cactus-bdb990.netlify.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MySQL Connection ───────────────────────────────────────────────────────────
MYSQL_HOST = os.getenv("MYSQLHOST", "mysql.railway.internal")
MYSQL_PORT = int(os.getenv("MYSQLPORT", 3306))
MYSQL_USER = os.getenv("MYSQLUSER", "root")
MYSQL_PASSWORD = os.getenv("MYSQLPASSWORD", "VaLIaMpwaJescUNEcyBlCuInrFbovJPI")
MYSQL_DATABASE = os.getenv("MYSQLDATABASE", "cet_predictor")

print(f"[DB] Connecting to {MYSQL_HOST}:{MYSQL_PORT} as {MYSQL_USER}")

DB_CONFIG = {
    "host": MYSQL_HOST,
    "user": MYSQL_USER,
    "password": MYSQL_PASSWORD,
    "database": MYSQL_DATABASE,
    "port": MYSQL_PORT
}

# GMAIL CONFIG (From .env)
GMAIL = os.getenv("MAIL_EMAIL", "lizafernz27@gmail.com")
# Strip spaces from app password just in case user copied them from Gmail UI
GMAIL_APP_PASSWORD = os.getenv("MAIL_PASSWORD", "yrfxvjgclafpygke").replace(" ", "")

def send_otp_email(email: str, otp: str, subject_prefix: str = "Password Reset"):
    """Helper to send OTP email via Gmail SMTP"""
    try:
        msg = MIMEText(f"Hello,\n\nYour OTP for CET Predictor {subject_prefix} is: {otp}\n\nThis OTP is valid for 10 minutes.\n\nRegards,\nCET Predictor Team")
        msg["Subject"] = f"CET Predictor - {subject_prefix} OTP"
        msg["From"] = GMAIL
        msg["To"] = email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"[SMTP ERROR] {e}")
        return False

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

# ── Create table if not exists ─────────────────────────────────────────────────
def init_db():
    try:
        conn = mysql.connector.connect(
            host=DB_CONFIG["host"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            port=DB_CONFIG["port"]
        )
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS cet_predictor")
        cursor.execute("USE cet_predictor")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100),
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) UNIQUE NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print("[OK] MySQL database, users, and otps tables ready!")
    except Exception as e:
        print(f"[ERROR] MySQL Error: {e} — Login/Register will not work without MySQL")

init_db()

# ── Auth Models ────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str
    name: str
    email: str
    phone: str = ""
    password: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    email: str
    phone: str
    new_password: str

class SendOTPRequest(BaseModel):
    email: str

# ── Register OTP Endpoint ──────────────────────────────────────────────────────
@app.post("/api/send-registration-otp")
def send_registration_otp(req: SendOTPRequest):
    try:
        db = get_db()
        cursor = db.cursor()

        # Check if email already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (req.email,))
        if cursor.fetchone():
            cursor.close()
            db.close()
            return {"success": False, "message": "This email is already part of our community! Try logging in instead."}

        otp = str(random.randint(100000, 999999))
        expiry = datetime.now() + timedelta(minutes=10)

        cursor.execute("DELETE FROM otps WHERE email = %s", (req.email,))
        cursor.execute("INSERT INTO otps (email, otp, expires_at) VALUES (%s, %s, %s)", (req.email, otp, expiry))
        db.commit()
        cursor.close()
        db.close()

        if send_otp_email(req.email, otp, "Registration"):
            return {"success": True, "message": "Verification code sent! Check your inbox."}
        else:
            return {"success": False, "message": "We couldn't send the code. Please double-check your email or try again later."}

    except Exception as e:
        print(f"[ERROR] {e}")
        return {"success": False, "message": "Something went wrong. Please try again."}

# ── Register Endpoint ──────────────────────────────────────────────────────────
@app.post("/api/register")
def register(req: RegisterRequest):
    try:
        db = get_db()
        cursor = db.cursor()

        # Name validation
        if len(req.name.strip()) < 2:
            return {"success": False, "message": "Oops! Your name is a bit too short. Please enter your full name."}

        # Email validation
        import re
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, req.email):
            return {"success": False, "message": "That email doesn't look quite right. Could you double-check the format?"}

        # Check if email already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (req.email,))
        if cursor.fetchone():
            cursor.close()
            db.close()
            return {"success": False, "message": "This email is already part of our community! Try logging in instead."}

        # Verify OTP
        cursor.execute("SELECT otp, expires_at FROM otps WHERE email = %s", (req.email,))
        row = cursor.fetchone()
        if not row:
            cursor.close()
            db.close()
            return {"success": False, "message": "Please verify your email first by requesting an OTP."}

        stored_otp, expires_at = row
        if stored_otp != req.otp:
            cursor.close()
            db.close()
            return {"success": False, "message": "The code you entered is incorrect. Please check your email again."}
        
        if datetime.now() > expires_at:
            cursor.close()
            db.close()
            return {"success": False, "message": "This code has expired. Please request a new one."}

        # Phone validation
        if req.phone:
            if not re.match(r'^[6-9][0-9]{9}$', req.phone):
                cursor.close()
                db.close()
                return {"success": False, "message": "The phone number should be exactly 10 digits and start with 6, 7, 8, or 9. Almost there!"}

        # Password validation
        if len(req.password) < 8:
            cursor.close()
            db.close()
            return {"success": False, "message": "To keep your account safe, passwords need to be at least 8 characters long."}
        if not re.search(r'[A-Z]', req.password):
            cursor.close()
            db.close()
            return {"success": False, "message": "Add an uppercase letter to make your password stronger!"}
        if not re.search(r'[a-z]', req.password):
            cursor.close()
            db.close()
            return {"success": False, "message": "Don't forget a lowercase letter in your password."}
        if not re.search(r'[0-9]', req.password):
            cursor.close()
            db.close()
            return {"success": False, "message": "Including a number will make your password much more secure."}
        if not re.search(r'[!@#$%^&*]', req.password):
            cursor.close()
            db.close()
            return {"success": False, "message": "Almost there! Just add a special character like !@#$%^&* for maximum security."}

        # Hash password before saving — never save plain text!
        hashed = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt())

        # Save to database
        cursor.execute(
            "INSERT INTO users (username, name, email, phone, password) VALUES (%s, %s, %s, %s, %s)",
            (req.username, req.name, req.email, req.phone, hashed.decode('utf-8'))
        )
        
        # Delete OTP after successful registration
        cursor.execute("DELETE FROM otps WHERE email = %s", (req.email,))

        db.commit()
        cursor.close()
        db.close()

        return {"success": True, "message": "Account created successfully! You can now login."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ── Login Endpoint ─────────────────────────────────────────────────────────────
@app.post("/api/login")
def login(req: LoginRequest):
    try:
        db = get_db()
        cursor = db.cursor()

        # Find user by email
        cursor.execute("SELECT id, name, email, password FROM users WHERE email = %s", (req.email,))
        user = cursor.fetchone()
        cursor.close()
        db.close()

        if not user:
            return {"success": False, "message": "We couldn't find an account with that email. Would you like to register first?"}

        # Check password against hashed password
        stored_password = user[3]
        if bcrypt.checkpw(req.password.encode('utf-8'), stored_password.encode('utf-8')):
            return {
                "success": True,
                "message": "Login successful!",
                "name": user[1],
                "email": user[2],
                "id": user[0]
            }
        else:
            return {"success": False, "message": "Hmm, that password doesn't match. Give it another try?"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ── Constants for Filters ──────────────────────────────────────────────────
CATEGORIES = [
    "OPEN", "OBC", "SC", "ST", "VJ/DT", "NT1", "NT2", "NT3", "EWS", "TFWS",
    "GOPEN", "GSCS", "GSTS", "GVJS", "GNT1S", "GNT2S", "GNT3S", "GOBCS", "GSEBCS",
    "LOPEN", "LOBCS", "LSCS"
]

CITIES = [
    "Ahmednagar", "Akkalkuwa", "Akluj", "Akola", "Alandi", "Ambejogai", "Ambernath", "Amravati",
    "Andheri", "Aurangabad", "Avasari Khurd", "Badlapur", "Badnera", "Baramati", "Barshi", "Beed", "Bhadrawati",
    "Bhandara", "Bhor", "Bhusawal", "Boisar", "Borivali", "Buldhana", "Byculla", "Chandrapur", "Chembur",
    "Chhatrapati Sambhajinagar", "Chikhali", "Chincholi", "Chinchwad", "Dhule", "Dombivali", "Dondaicha",
    "Dumbarwadi", "Faizpur", "Gadhinglaj", "Haveli", "Hingoli", "Ichalkaranji", "Jalgaon", "Jalna", "Jaysingpur",
    "Kalmeshwar", "Kalyan", "Kamshet", "Kandivali", "Kankavli", "Karad", "Karjat", "Khalapur", "Kolhapur",
    "Kondhwa", "Kopar Khairane", "Kopargaon", "Kuran", "Latur", "Lohegaon", "Lonavala", "Lonere", "Malegaon",
    "Malwadi", "Matunga", "Mira Road", "Miraj", "Mumbai", "Nagpur", "Naigaon", "Nanded", "Nandurbar", "Narhe",
    "Nashik", "Navi Mumbai", "Osmanabad", "Pal", "Palghar", "Pandharpur", "Panvel", "Parbhani", "Parli", "Pimpri",
    "Pune", "Pusad", "Raigad", "Ramtek", "Ratnagiri", "Sakoli", "Sangamner", "Sangli", "Sangola", "Satara",
    "Sevagram", "Shahapur", "Shegaon", "Shevgaon", "Shirpur", "Sindhudurg", "Solapur", "Someshwar Nagar",
    "Talegaon", "Thane", "Tuljapur", "Ulhasnagar", "Vasai", "Vile Parle", "Virar", "Wadwadi", "Wagholi",
    "Warananagar", "Wardha", "Washim", "Yavatmal", "Yelur"
]

COURSES = [
    "Aeronautical Engineering", "Agricultural Engineering", "Architectural Assistantship",
    "Artificial Intelligence", "Artificial Intelligence (AI) and Data Science", "Artificial Intelligence and Data Science",
    "Artificial Intelligence and Machine Learning", "Automation and Robotics", "Automobile Engineering", "Bio Medical Engineering",
    "Bio Technology", "Chemical Engineering", "Civil Engineering", "Civil Engineering and Planning", "Civil and Environmental Engineering",
    "Civil and infrastructure Engineering", "Computer Engineering", "Computer Engineering (Software Engineering)", "Computer Science",
    "Computer Science and Business Systems", "Computer Science and Design", "Computer Science and Engineering",
    "Computer Science and Engineering (Artificial Intelligence and Data Science)", "Computer Science and Engineering (Artificial Intelligence)",
    "Computer Science and Engineering (Cyber Security)", "Computer Science and Engineering (Data Science)",
    "Computer Science and Engineering (Internet of Things and Cyber Security Including Block Chain)", "Computer Science and Engineering (IoT)",
    "Computer Science and Engineering (Artificial Intelligence and Machine Learning)", "Computer Science and Information Technology",
    "Computer Science and Technology", "Computer Technology", "Cyber Security", "Data Engineering", "Data Science", "Dyestuff Technology",
    "Electrical Engg [Electronics and Power]", "Electrical Engineering", "Electrical and Computer Engineering",
    "Electrical and Electronics Engineering", "Electrical, Electronics and Power", "Electronics Engineering",
    "Electronics Engineering (VLSI Design and Technology)", "Electronics and Biomedical Engineering",
    "Electronics and Communication (Advanced Communication Technology)", "Electronics and Communication Engineering",
    "Electronics and Computer Engineering", "Electronics and Computer Science", "Electronics and Telecommunication Engg",
    "Fashion Technology", "Fibres and Textile Processing Technology", "Fire Engineering", "Food Engineering and Technology",
    "Food Technology", "Food Technology And Management", "Industrial IoT", "Information Technology", "Instrumentation Engineering",
    "Instrumentation and Control Engineering", "Internet of Things (IoT)", "Man Made Textile Technology",
    "Manufacturing Science and Engineering", "Mechanical and Automation Engineering", "Mechanical Engineering",
    "Mechanical Engineering Automobile", "Mechanical Engineering [Sandwich]", "Mechanical and Mechatronics Engineering (Additive Manufacturing)",
    "Mechatronics Engineering", "Metallurgy and Material Technology", "Mining Engineering", "Oil Fats and Waxes Technology",
    "Oil Technology", "Oil and Paints Technology", "Oil, Oleochemicals and Surfactants Technology", "Paints Technology",
    "Paper and Pulp Technology", "Petro Chemical Engineering", "Pharmaceutical and Fine Chemical Technology",
    "Pharmaceuticals Chemistry and Technology", "Plastic Technology", "Plastic and Polymer Engineering",
    "Polymer Engineering and Technology", "Printing and Packing Technology", "Production Engineering", "Production Engineering [Sandwich]",
    "Robotics and Artificial Intelligence", "Robotics and Automation", "Safety and Fire Engineering", "Structural Engineering",
    "Surface Coating Technology", "Technical Textiles", "Textile Chemistry", "Textile Engineering / Technology", "Textile Technology", "VLSI"
]

# ── Data loading ───────────────────────────────────────────────────────────────
DATA_FILE = Path(__file__).parent / "cutoff_2024.json"

def load_data() -> list[dict]:
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Data file not found: {DATA_FILE}")

    with open(DATA_FILE, encoding="utf-8") as f:
        raw = json.load(f)

    records = []
    items = raw if isinstance(raw, list) else raw.get("data", [])

    for college_entry in items:
        if not isinstance(college_entry, dict):
            continue

        college_name = college_entry.get("college_name", college_entry.get("name", "Unknown College"))
        college_name = (college_name or "Unknown College").strip()

        city = college_entry.get("city_name", college_entry.get("city", ""))
        city = (city or "").strip()

        courses = college_entry.get("courses", [])
        if not isinstance(courses, list):
            continue

        for course_entry in courses:
            course_name = course_entry.get("course_name", course_entry.get("name", "Unknown Course"))
            course_name = (course_name or "Unknown Course").strip()

            cutoffs = course_entry.get("cutoffs", {})
            merged_cutoffs = {}
            for level_name in ["state_level", "stage_i"]:
                level_data = cutoffs.get(level_name, {})
                if isinstance(level_data, dict):
                    for cat, vals in level_data.items():
                        percentile = vals.get("percentile") if isinstance(vals, dict) else vals
                        if percentile is not None:
                            try:
                                merged_cutoffs[cat.upper()] = float(percentile)
                            except (TypeError, ValueError):
                                pass

            if merged_cutoffs:
                found_city = city
                if not found_city or found_city == "Maharashtra":
                    for c in CITIES:
                        if c.lower() in college_name.lower():
                            found_city = c
                            break

                records.append({
                    "college_name": college_name,
                    "city_name":    found_city if found_city else "Maharashtra",
                    "course_name":  course_name,
                    "cutoffs":      merged_cutoffs,
                })

    return records

try:
    COLLEGES = load_data()
    print(f"[OK] Loaded {len(COLLEGES)} college-course records from {DATA_FILE.name}")
except Exception as exc:
    COLLEGES = []
    print(f"[WARNING] Warning: {exc}")

# ── Models ──────────────────────────────────────────────────
class PredictRequest(BaseModel):
    percentile: float
    category: str
    city_filter: str = ""
    course_filter: str = ""

class CollegeResult(BaseModel):
    college_name: str
    city_name:    str
    course_name:  str
    cutoff:       float
    margin:       float
    tier:         str
    advice:       str

class PredictResponse(BaseModel):
    results:       list[CollegeResult]
    safe_picks:    int
    stretch_picks: int
    summary:       str

# ── Logic ───────────────────────────────────────────────────────
TIER_RULES = {
    "safe":    (5.0,  float("inf")),
    "match":   (2.0,  5.0),
    "stretch": (0.0,  2.0),
}

ADVICE_TEMPLATES = {
    "safe":    "Strong fit — your percentile is well above the cutoff.",
    "match":   "Good match — you meet the cutoff comfortably.",
    "stretch": "Stretch pick — your percentile is just above the cutoff.",
}

def classify(margin: float) -> str:
    for tier, (lo, hi) in TIER_RULES.items():
        if lo <= margin < hi:
            return tier
    return "stretch"

def counselor_advice(tier: str, college: str, course: str, margin: float) -> str:
    base = ADVICE_TEMPLATES.get(tier, "")
    return f"{college} – {course}: margin {margin:+.2f}. {base}"

def build_summary(safe: list, match: list, stretch: list, percentile: float, category: str) -> str:
    total = len(safe) + len(match) + len(stretch)
    if total == 0:
        return f"No colleges found for {category} at {percentile:.2f}."
    return (
        f"Found {total} colleges for {category} at {percentile:.2f} — "
        f"{len(safe)} safe, {len(match)} good matches, {len(stretch)} stretch."
    )


# ── Endpoints ──────────────────────────────────────────────────────────────────
@app.get("/api/filters")
def get_filters():
    return {
        "categories": CATEGORIES,
        "cities": sorted(CITIES),
        "courses": sorted(COURSES)
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/test")
def test():
    return {
        "status": "ok",
        "records_loaded": len(COLLEGES),
        "sample": COLLEGES[:2] if COLLEGES else []
    }

@app.post("/api/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if not COLLEGES:
        raise HTTPException(status_code=503, detail="The cutoff data is currently unavailable. Please try again later.")

    if req.percentile < 0 or req.percentile > 100:
        return {"results": [], "safe_picks": 0, "stretch_picks": 0, "summary": "Whoops! Percentiles should be between 0 and 100. Please adjust your score."}

    cat_query = req.category.strip().upper()
    city_q = req.city_filter.strip().lower()
    course_q = req.course_filter.strip().lower()

    if "all" in city_q: city_q = ""
    if "all" in course_q: course_q = ""

    all_results = []
    safe_count = 0
    stretch_count = 0

    for rec in COLLEGES:
        if city_q:
            city_match = (city_q in rec["city_name"].lower()) or (city_q in rec["college_name"].lower())
            if not city_match:
                continue

        if course_q and course_q not in rec["course_name"].lower():
            continue

        cutoff = None

        if cat_query in rec["cutoffs"]:
            cutoff = rec["cutoffs"][cat_query]

        if cutoff is None:
            for k, v in rec["cutoffs"].items():
                if k.startswith(cat_query):
                    cutoff = v
                    break

        if cutoff is None:
            alias_map = {
                "OPEN": "GOPEN", "OBC": "GOBC", "SC": "GSCS", "ST": "GSTS",
                "VJ/DT": "GVJS", "NT1": "GNT1", "NT2": "GNT2", "NT3": "GNT3"
            }
            alias = alias_map.get(cat_query)
            if alias:
                for k, v in rec["cutoffs"].items():
                    if k.startswith(alias):
                        cutoff = v
                        break

        if cutoff is None:
            cutoff = rec["cutoffs"].get("GOPENS") or rec["cutoffs"].get("GOPENH") or rec["cutoffs"].get("GOPENO")

        if cutoff is None:
            continue

        margin = req.percentile - cutoff
        if margin < 0:
            continue

        tier = classify(margin)
        advice = counselor_advice(tier, rec["college_name"], rec["course_name"], margin)

        result = CollegeResult(
            college_name=rec["college_name"],
            city_name=rec["city_name"],
            course_name=rec["course_name"],
            cutoff=round(cutoff, 2),
            margin=round(margin, 2),
            tier=tier,
            advice=advice,
        )

        all_results.append(result)
        if tier == "safe":
            safe_count += 1
        elif tier == "stretch":
            stretch_count += 1

    all_results.sort(key=lambda x: x.margin, reverse=True)

    safe_list    = [r for r in all_results if r.tier == "safe"]
    match_list   = [r for r in all_results if r.tier == "match"]
    stretch_list = [r for r in all_results if r.tier == "stretch"]

    return PredictResponse(
        results=all_results,
        safe_picks=safe_count,
        stretch_picks=stretch_count,
        summary=build_summary(safe_list, match_list, stretch_list, req.percentile, cat_query)
    )

# ── Serve Frontend ────────────────────────────────────────────────────────────
BASE_DIR     = Path(__file__).parent
FRONTEND_DIR = BASE_DIR / "frontend" / "dist"

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = FRONTEND_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIR / "index.html"))
else:
    @app.get("/")
    def root():
        return {"status": "ok", "message": "Backend is running. Build the frontend to see the UI."}


# ── Password Reset Endpoints ──────────────────────────────────────────────────
@app.post("/api/forgot-password")
def forgot_password(data: dict):
    email = data.get("email")
    if not email:
        return {"success": False, "message": "Email is required!"}

    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            cursor.close()
            db.close()
            return {"success": False, "message": "Email not found in our database!"}

        otp = str(random.randint(100000, 999999))
        expiry = datetime.now() + timedelta(minutes=10)

        cursor.execute("DELETE FROM otps WHERE email = %s", (email,))
        cursor.execute("INSERT INTO otps (email, otp, expires_at) VALUES (%s, %s, %s)", (email, otp, expiry))
        db.commit()
        cursor.close()
        db.close()

        if send_otp_email(email, otp, "Password Reset"):
            return {"success": True, "message": "OTP sent successfully to your email!"}
        else:
            return {"success": False, "message": "Failed to send OTP. Please check your email and try again."}

    except Exception as e:
        print(f"SMTP/DB Error: {e}")
        return {"success": False, "message": f"An error occurred. Please try again."}


@app.post("/api/verify-otp")
def verify_otp(data: dict):
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return {"success": False, "message": "Email and OTP are required!"}

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT otp, expires_at FROM otps WHERE email = %s", (email,))
        row = cursor.fetchone()
        cursor.close()
        db.close()

        if not row:
            return {"success": False, "message": "No OTP sent for this email!"}

        stored_otp, expires_at = row

        if datetime.now() > expires_at:
            return {"success": False, "message": "OTP has expired!"}

        if stored_otp != otp:
            return {"success": False, "message": "Invalid OTP!"}

        return {"success": True, "message": "OTP verified successfully!"}

    except Exception as e:
        return {"success": False, "message": f"Database error: {str(e)}"}


@app.post("/api/reset-password")
def reset_password(data: dict):
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    if not email or not otp or not new_password:
        return {"success": False, "message": "All fields are required!"}

    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT otp, expires_at FROM otps WHERE email = %s", (email,))
        row = cursor.fetchone()

        if not row:
            cursor.close()
            db.close()
            return {"success": False, "message": "OTP verification failed (not found)!"}

        stored_otp, expires_at = row
        if stored_otp != otp or datetime.now() > expires_at:
            cursor.close()
            db.close()
            return {"success": False, "message": "OTP verification failed or expired!"}

        hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed.decode('utf-8'), email))
        cursor.execute("DELETE FROM otps WHERE email = %s", (email,))

        db.commit()
        cursor.close()
        db.close()

        return {"success": True, "message": "Password updated successfully! You can now login."}

    except Exception as e:
        return {"success": False, "message": f"Database error: {str(e)}"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("local_llm_app:app", host="0.0.0.0", port=8000, reload=True)
