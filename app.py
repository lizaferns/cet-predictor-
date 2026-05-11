import streamlit as st
import pandas as pd
import json
import os
import requests

# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(page_title="CET College Predictor 2024", layout="wide")

# ── Custom Styling ─────────────────────────────────────────────────────────────
st.markdown("""
    <style>
    .main { background-color: #f8f9fa; }
    .stMetric {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        border: 1px solid #eee;
    }
    h1 { color: #1e3a8a; font-weight: 800; }
    .stButton>button {
        width: 100%;
        border-radius: 8px;
        height: 3em;
        background-color: #1e3a8a;
        color: white;
        font-weight: 600;
    }
    </style>
    """, unsafe_allow_html=True)

# ── Backend URL ────────────────────────────────────────────────────────────────
BACKEND_URL = "http://localhost:8000"

# ── Check if backend is alive ──────────────────────────────────────────────────
def is_backend_running():
    try:
        res = requests.get(f"{BACKEND_URL}/health", timeout=3)
        return res.status_code == 200
    except:
        return False

# ── Auth Functions ─────────────────────────────────────────────────────────────
def show_auth_page():
    st.title("🎓 Maharashtra CET College Predictor 2024")
    st.markdown("Please login or register to continue.")
    st.divider()

    # ── Backend status warning ──
    if not is_backend_running():
        st.error("""
        ❌ **Backend server is not running!**

        Please start it by running this command in a terminal:
        ```
        cd C:\\Users\\Liza\\OneDrive\\Desktop\\cet-predictor
        python local_llm_app.py
        ```
        Then refresh this page.
        """)
        st.stop()

    tab1, tab2 = st.tabs(["🔐 Login", "📝 Register"])

    # ── Login Tab ──
    with tab1:
        st.subheader("Login to Your Account")
        email    = st.text_input("Email", key="login_email", placeholder="Enter your email")
        password = st.text_input("Password", type="password", key="login_pass", placeholder="Enter your password")

        if st.button("Login", key="login_btn"):
            if not email or not password:
                st.error("Please fill in all fields.")
            else:
                try:
                    res = requests.post(
                        f"{BACKEND_URL}/api/login",
                        json={"email": email, "password": password},
                        timeout=5
                    )
                    data = res.json()
                    if data.get("success"):
                        st.session_state.logged_in = True
                        st.session_state.name  = data.get("name", "User")
                        st.session_state.email     = email
                        st.success(f"Welcome back, {data.get('name')}!")
                        st.rerun()
                    else:
                        st.error(data.get("message", "Login failed."))
                except requests.exceptions.ConnectionError:
                    st.error("❌ Cannot reach backend on port 8000. Is `python local_llm_app.py` running?")
                except Exception as e:
                    st.error(f"❌ Error: {e}")

        # ── Forgot Password Section ──
        with st.expander("🔑 Forgot Password?"):
            if "forgot_step" not in st.session_state:
                st.session_state.forgot_step = 1
            
            # Step 1: Email verification
            f_email = st.text_input("Registered Email", key="f_email_step1", placeholder="Enter your email", 
                                    disabled=(st.session_state.forgot_step > 1))
            
            if st.session_state.forgot_step == 1:
                if st.button("Verify Email", key="verify_email_btn"):
                    if not f_email:
                        st.error("Please enter your email.")
                    else:
                        with st.spinner("Verifying email..."):
                            try:
                                res = requests.post(f"{BACKEND_URL}/api/forgot-password", json={"email": f_email})
                                data = res.json()
                                if data.get("success"):
                                    st.success("✅ Email Verified! OTP sent to inbox")
                                    st.session_state.forgot_step = 2
                                    st.session_state.forgot_email = f_email
                                    st.rerun()
                                else:
                                    st.error("❌ Invalid Email — not registered")
                            except Exception as e:
                                st.error(f"Error: {e}")
            
            # Step 2: OTP verification
            if st.session_state.forgot_step >= 2:
                st.divider()
                f_otp = st.text_input("Enter 6-digit OTP", key="f_otp_step2", placeholder="123456",
                                      disabled=(st.session_state.forgot_step > 2))
                
                if st.session_state.forgot_step == 2:
                    if st.button("Verify OTP", key="verify_otp_btn"):
                        if not f_otp or len(f_otp) != 6:
                            st.error("Please enter a valid 6-digit OTP.")
                        else:
                            with st.spinner("Verifying OTP..."):
                                try:
                                    res = requests.post(f"{BACKEND_URL}/api/verify-otp", 
                                                        json={"email": st.session_state.forgot_email, "otp": f_otp})
                                    data = res.json()
                                    if data.get("success"):
                                        st.success("✅ OTP Verified")
                                        st.session_state.forgot_step = 3
                                        st.session_state.forgot_otp = f_otp
                                        st.rerun()
                                    else:
                                        st.error("❌ Wrong OTP")
                                except Exception as e:
                                    st.error(f"Error: {e}")
            
            # Step 3: Reset password
            if st.session_state.forgot_step == 3:
                st.divider()
                new_pass = st.text_input("New Password", type="password", key="f_new_pass_step3")
                conf_pass = st.text_input("Confirm New Password", type="password", key="f_conf_pass_step3")
                
                if st.button("Reset Password", key="reset_pass_final_btn"):
                    if not new_pass or not conf_pass:
                        st.error("Please fill in both password fields.")
                    elif new_pass != conf_pass:
                        st.error("❌ Passwords do not match!")
                    elif len(new_pass) < 6:
                        st.error("❌ Password must be at least 6 characters.")
                    else:
                        with st.spinner("Resetting password..."):
                            try:
                                res = requests.post(f"{BACKEND_URL}/api/reset-password", 
                                                   json={
                                                       "email": st.session_state.forgot_email, 
                                                       "otp": st.session_state.forgot_otp, 
                                                       "new_password": new_pass
                                                   })
                                data = res.json()
                                if data.get("success"):
                                    st.success("✅ Password reset successfully! Please login")
                                    # Clear all session state as requested
                                    st.session_state.clear()
                                    # The success message stays in the current UI run.
                                    # No st.rerun() here allows user to read the message.
                                else:
                                    st.error(data.get("message", "Reset failed."))
                            except Exception as e:
                                st.error(f"Error: {e}")

    # ── Register Tab ──
    with tab2:
        st.subheader("Create New Account")
        name = st.text_input("Name", key="reg_name_input", placeholder="Enter your name")
        reg_email = st.text_input("Email", key="reg_email_input", placeholder="Enter your email")
        reg_phone = st.text_input("Phone Number", key="reg_phone_input", placeholder="Enter 10-digit phone number")
        reg_pass = st.text_input("Password", type="password", key="reg_pass_input", placeholder="Choose a password")
        reg_confirm = st.text_input("Confirm Password", type="password", key="reg_confirm_input", placeholder="Confirm your password")

        if st.button("Register", key="register_btn"):
            if not name or not reg_email or not reg_phone or not reg_pass or not reg_confirm:
                st.error("Please fill in all fields.")
            elif len(reg_phone) != 10 or not reg_phone.isdigit():
                st.error("Phone number must be exactly 10 digits.")
            elif len(set(reg_phone)) == 1:
                st.error(f"Invalid phone number: Cannot be 10 identical digits (e.g., {reg_phone[0]} repeated).")
            elif reg_pass != reg_confirm:
                st.error("Passwords do not match!")
            elif len(reg_pass) < 6:
                st.error("Password must be at least 6 characters.")
            else:
                try:
                    res = requests.post(
                        f"{BACKEND_URL}/api/register",
                        json={"name": name, "username": name, "email": reg_email, "phone": reg_phone, "password": reg_pass},
                        timeout=5
                    )
                    data = res.json()
                    if data.get("success"):
                        st.success(data.get("message", "Account created! Please login."))
                    else:
                        st.error(data.get("message", "Registration failed."))
                except requests.exceptions.ConnectionError:
                    st.error("❌ Cannot reach backend on port 8000. Is `python local_llm_app.py` running?")
                except Exception as e:
                    st.error(f"❌ Error: {e}")


# ── Data Loading ───────────────────────────────────────────────────────────────
@st.cache_data
def load_data(file_path):
    if not os.path.exists(file_path):
        return pd.DataFrame()

    try:
        with open(file_path, 'r') as f:
            raw = json.load(f)
    except Exception as e:
        st.error(f"Error loading JSON: {e}")
        return pd.DataFrame()

    rows = []
    for college in raw.get('data', []):
        college_name = college.get('college_name', 'N/A')
        city         = college.get('city_name', 'N/A')

        for course in college.get('courses', []):
            course_name = course.get('course_name', 'N/A')
            cutoffs     = course.get('cutoffs', {})

            state_level = cutoffs.get('state_level', {})
            stage_i     = cutoffs.get('stage_i', {})

            for level_name, level_data in [('state_level', state_level), ('stage_i', stage_i)]:
                if isinstance(level_data, dict):
                    for category, values in level_data.items():
                        if isinstance(values, dict) and values:
                            rank       = values.get('rank')
                            percentile = values.get('percentile')
                            if percentile is not None:
                                rows.append({
                                    'college_name': college_name,
                                    'course_name':  course_name,
                                    'city':         city,
                                    'level':        level_name,
                                    'category':     category,
                                    'rank':         rank,
                                    'percentile':   percentile
                                })

    return pd.DataFrame(rows)


# ── AI Counselor ───────────────────────────────────────────────────────────────
def get_ai_recommendation(user_percentile, user_category, city_filter, course_filter, filtered_df):
    if filtered_df.empty:
        return "No colleges found matching your criteria. Try adjusting your filters."

    safe    = filtered_df[filtered_df['margin'] > 5].head(4)
    good    = filtered_df[(filtered_df['margin'] >= 2) & (filtered_df['margin'] <= 5)].head(4)
    stretch = filtered_df[(filtered_df['margin'] >= 0) & (filtered_df['margin'] < 2)].head(3)

    response  = "## 🎓 AI Counselor Recommendation\n\n"
    response += f"**Your Profile:** {user_percentile}%ile | {user_category}\n\n"

    if not safe.empty:
        response += "### ✅ Safe Picks *(Admission Highly Likely)*\n"
        for _, row in safe.iterrows():
            response += f"- **{row['college_name']}** — {row['course_name']} *(Cutoff: {row['percentile']:.2f}, Margin: +{row['margin']:.2f}%)*\n"
        response += "\n"

    if not good.empty:
        response += "### 🎯 Good Matches *(Balanced Choice)*\n"
        for _, row in good.iterrows():
            response += f"- **{row['college_name']}** — {row['course_name']} *(Cutoff: {row['percentile']:.2f}, Margin: +{row['margin']:.2f}%)*\n"
        response += "\n"

    if not stretch.empty:
        response += "### 🔥 Stretch Colleges *(Worth Trying)*\n"
        for _, row in stretch.iterrows():
            response += f"- **{row['college_name']}** — {row['course_name']} *(Cutoff: {row['percentile']:.2f}, Margin: +{row['margin']:.2f}%)*\n"
        response += "\n"

    response += "### 💡 Personal Advice\n"
    response += f"- With **{user_percentile}%ile** in **{user_category}** category, you have **{len(filtered_df)} eligible colleges**.\n"

    if user_percentile >= 95:
        response += "- Your score is excellent! Focus on top government colleges and premium private institutes.\n"
    elif user_percentile >= 85:
        response += "- Your score is strong! Prioritize college reputation over branch if possible.\n"
    elif user_percentile >= 70:
        response += "- Decent score! Focus on the branch you want rather than college name at this range.\n"
    else:
        response += "- Apply to all eligible colleges and don't miss any CAP round deadlines.\n"

    response += "- Always apply to 2-3 safe picks + 2 good matches + 1 stretch college for best chances.\n"
    response += "- Don't miss CAP Round 1, 2, and 3 deadlines — each round gives new opportunities!\n"

    return response


# ── Session State Init ─────────────────────────────────────────────────────────
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
if "name" not in st.session_state:
    st.session_state.name = ""

# ── Show Auth if not logged in ─────────────────────────────────────────────────
if not st.session_state.logged_in:
    show_auth_page()
    st.stop()

# ── Main App (only after login) ────────────────────────────────────────────────
st.title("🎓 Maharashtra CET College Predictor 2024")
st.markdown("Find the best engineering colleges based on last year's cutoffs.")

DATA_FILE = 'cutoff_2024.json'
df = load_data(DATA_FILE)

if df.empty:
    st.error("❌ Could not load data from `cutoff_2024.json`. Please make sure the file exists in the same folder as `app.py`.")
else:
    st.success(f"✅ Data loaded! {len(df)} records found across {df['college_name'].nunique()} colleges.")

    with st.sidebar:
        st.markdown(f"👋 **Welcome, {st.session_state.name}!**")
        if st.button("🚪 Logout"):
            st.session_state.logged_in = False
            st.session_state.name  = ""
            st.rerun()

        st.divider()
        st.header("🎯 Input Your Score")
        user_percentile = st.number_input("Your CET Percentile", min_value=0.0, max_value=100.0, value=95.0, step=0.01)

        data_categories = df['category'].unique().tolist()
        CATEGORY_LIST   = sorted(list(set([
            "GOPENS", "GSCS", "GSTS", "GVJS", "GNT1S", "GNT2S", "GNT3S", "GOBCS", "GSEBCS",
            "LOPENS", "LOBCS", "LSCS", "EWS", "TFWS", "PWDOPENS"
        ] + data_categories)))
        user_category = st.selectbox("Your Category", options=CATEGORY_LIST)

        st.divider()
        st.header("🔍 Filters")

        data_cities = df['city'].unique().tolist()
        CITY_LIST   = sorted(list(set([
            "Ahmednagar", "Akkalkuwa", "Akluj", "Akola", "Alandi", "Ambejogai", "Ambernath", "Amravati",
            "Andheri", "Aurangabad", "Avasari Khurd", "Badlapur", "Badnera", "Baramati", "Barshi", "Beed",
            "Bhandara", "Bhor", "Bhusawal", "Boisar", "Borivali", "Buldhana", "Byculla", "Chandrapur",
            "Chhatrapati Sambhajinagar", "Chikhali", "Chincholi", "Chinchwad", "Dhule", "Dombivali",
            "Faizpur", "Gadhinglaj", "Haveli", "Hingoli", "Ichalkaranji", "Jalgaon", "Jalna", "Jaysingpur",
            "Kalmeshwar", "Kalyan", "Kamshet", "Kandivali", "Kankavli", "Karad", "Karjat", "Khalapur",
            "Kolhapur", "Kondhwa", "Kopar Khairane", "Kopargaon", "Latur", "Lohegaon", "Lonavala", "Lonere",
            "Malegaon", "Mira Road", "Miraj", "Mumbai", "Nagpur", "Nanded", "Nandurbar", "Nashik",
            "Navi Mumbai", "Osmanabad", "Palghar", "Pandharpur", "Panvel", "Parbhani", "Pimpri", "Pune",
            "Raigad", "Ramtek", "Ratnagiri", "Sakoli", "Sangamner", "Sangli", "Satara", "Sevagram",
            "Shahapur", "Shegaon", "Shirpur", "Solapur", "Talegaon", "Thane", "Ulhasnagar", "Vasai",
            "Virar", "Wardha", "Washim", "Yavatmal"
        ] + data_cities)))
        CITY_LIST.insert(0, "All Cities")
        city_filter = st.selectbox("Filter by City", options=CITY_LIST)

        data_courses = df['course_name'].unique().tolist()
        COURSE_LIST  = sorted(list(set([
            "Aeronautical Engineering", "Agricultural Engineering", "Artificial Intelligence",
            "Artificial Intelligence and Data Science", "Automation and Robotics", "Automobile Engineering",
            "Bio Medical Engineering", "Bio Technology", "Chemical Engineering", "Civil Engineering",
            "Computer Engineering", "Computer Science", "Computer Science and Engineering",
            "Cyber Security", "Data Science", "Electrical Engineering", "Electronics Engineering",
            "Electronics and Communication Engineering", "Electronics and Telecommunication Engg",
            "Fashion Technology", "Fire Engineering", "Food Technology", "Information Technology",
            "Instrumentation Engineering", "Internet of Things (IoT)", "Mechanical Engineering",
            "Mechatronics Engineering", "Mining Engineering", "Plastic and Polymer Engineering",
            "Production Engineering", "Robotics and Artificial Intelligence", "Textile Technology", "VLSI"
        ] + data_courses)))
        COURSE_LIST.insert(0, "All Courses")
        course_filter = st.selectbox("Filter by Course", options=COURSE_LIST)

        predict_btn = st.button("🔍 Predict My Colleges")

    if predict_btn:
        # Robust Category matching for Streamlit
        # First, filter by percentile
        temp_df = df[df['percentile'] <= user_percentile].copy()
        
        # Then, apply category matching (exact OR starts with OR alias starts with)
        alias_map = {
            "OPEN": "GOPEN", "OBC": "GOBC", "SC": "GSCS", "ST": "GSTS", 
            "VJ/DT": "GVJS", "NT1": "GNT1", "NT2": "GNT2", "NT3": "GNT3"
        }
        search_cat = alias_map.get(user_category, user_category)

        filtered_df = temp_df[
            (temp_df['category'] == user_category) | 
            (temp_df['category'].str.startswith(user_category)) |
            (temp_df['category'].str.startswith(search_cat))
        ].copy()

        if city_filter != "All Cities":
            filtered_df = filtered_df[
                (filtered_df['city'].str.contains(city_filter, case=False, na=False)) |
                (filtered_df['college_name'].str.contains(city_filter, case=False, na=False))
            ]

        if course_filter != "All Courses":
            filtered_df = filtered_df[
                filtered_df['course_name'].str.contains(course_filter, case=False, na=False)
            ]

        filtered_df['margin'] = user_percentile - filtered_df['percentile']
        filtered_df = filtered_df.sort_values(by='margin')
        filtered_df = filtered_df.drop_duplicates(subset=['college_name', 'course_name'], keep='first')

        stretch_picks = filtered_df[filtered_df['margin'] < 2].shape[0]
        safe_picks    = filtered_df[filtered_df['margin'] > 5].shape[0]
        good_picks    = filtered_df[(filtered_df['margin'] >= 2) & (filtered_df['margin'] <= 5)].shape[0]

        m_col1, m_col2, m_col3 = st.columns(3)
        with m_col1:
            st.metric("🔥 Stretch Picks", stretch_picks)
        with m_col2:
            st.metric("🎯 Good Matches", good_picks)
        with m_col3:
            st.metric("🛡️ Safe Picks", safe_picks)

        st.subheader(f"Results for {user_category} at {user_percentile}%ile")

        if not filtered_df.empty:
            display_df = filtered_df[['college_name', 'course_name', 'city', 'rank', 'percentile', 'margin']].rename(columns={
                'college_name': 'College',
                'course_name':  'Course',
                'city':         'City',
                'rank':         'Cutoff Rank',
                'percentile':   'Cutoff %ile',
                'margin':       'Margin'
            })
            display_df['Cutoff %ile'] = display_df['Cutoff %ile'].round(2)
            display_df['Margin']      = display_df['Margin'].round(2)
            st.dataframe(display_df, use_container_width=True, hide_index=True)

            st.divider()
            st.subheader("🤖 AI Counselor")
            if st.button("✨ Get Personalized AI Advice"):
                with st.spinner("Analyzing your profile..."):
                    recommendation = get_ai_recommendation(
                        user_percentile, user_category,
                        city_filter, course_filter, filtered_df
                    )
                    st.markdown(recommendation)
        else:
            st.warning("⚠️ No colleges found. Try adjusting filters or lowering your percentile.")
    else:
        st.info("💡 Enter your details in the sidebar and click **Predict My Colleges**.")