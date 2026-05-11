import os
import json
import pandas as pd
import numpy as np
import joblib
import torch
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from transformers import pipeline
from sklearn.ensemble import RandomForestClassifier

# Initialize FastAPI
app = FastAPI(title="CET College Predictor API")

# Global variables with type hints
model: RandomForestClassifier = None
le_cat: joblib.load = None
le_col: joblib.load = None
le_course: joblib.load = None
le_city: joblib.load = None
base_df: pd.DataFrame = None
df: pd.DataFrame = pd.DataFrame()

# Global paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Check both parent and current dir for the data file
DATA_FILE_OPTS = [
    os.path.join(os.path.dirname(BASE_DIR), "cutoff_2024.json"),
    os.path.join(BASE_DIR, "cutoff_2024.json"),
    r"C:\Users\Liza\Downloads\cutoff_2024.json"
]
DATA_FILE = next((f for f in DATA_FILE_OPTS if os.path.exists(f)), DATA_FILE_OPTS[0])
MODEL_PATH = os.path.join(BASE_DIR, 'cet_model.pkl')

# Load Local LLM (TinyLlama)
@torch.no_grad()
def load_llm():
    try:
        # Check if model is already downloaded to avoid errors
        return pipeline("text-generation", model="TinyLlama/TinyLlama-1.1B-Chat-v1.0", torch_dtype=torch.float32)
    except Exception as e:
        print(f"LLM Load Error (TinyLlama not found or incompatible): {e}")
        return None

llm = load_llm()

def load_ml_assets():
    global model, le_cat, le_col, le_course, le_city, base_df, df
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            le_cat = joblib.load(os.path.join(BASE_DIR, 'le_cat.pkl'))
            le_col = joblib.load(os.path.join(BASE_DIR, 'le_col.pkl'))
            le_course = joblib.load(os.path.join(BASE_DIR, 'le_course.pkl'))
            le_city = joblib.load(os.path.join(BASE_DIR, 'le_city.pkl'))
            base_df = joblib.load(os.path.join(BASE_DIR, 'flattened_data.pkl'))
            df = base_df.copy()
            print(f"ML Model loaded from {MODEL_PATH}. Rows: {len(df)}")
        else:
            print(f"Model not found at {MODEL_PATH}. Loading raw JSON from {DATA_FILE}...")
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r') as f:
                    raw = json.load(f)
                
                rows = []
                data_items = raw.get('data', []) if isinstance(raw, dict) else raw
                
                for college in data_items:
                    c_name = college.get('name', college.get('college_name', 'N/A'))
                    city = college.get('city', college.get('city_name', 'N/A')) 
                    for course in college.get('courses', []):
                        course_name = course.get('name', course.get('course_name', 'N/A'))
                        cutoffs = course.get('cutoffs', {})
                        for level_name, level_data in cutoffs.items():
                            if isinstance(level_data, dict):
                                # Some structures have stage_i, some have direct categories
                                categories_data = level_data.get('stage_i', level_data)
                                if isinstance(categories_data, dict):
                                    for category, values in categories_data.items():
                                        percentile = None
                                        rank = None
                                        if isinstance(values, dict):
                                            percentile = values.get('percentile')
                                            rank = values.get('rank')
                                        elif isinstance(values, (int, float)):
                                            percentile = values
                                        
                                        if percentile is not None:
                                            rows.append({
                                                'college_name': c_name, 'course_name': course_name, 'city': city,
                                                'level': level_name, 'category': category,
                                                'rank': rank, 'percentile': float(percentile)
                                            })
                df = pd.DataFrame(rows)
                print(f"Raw JSON loaded. Rows: {len(df)}")
            else:
                print(f"CRITICAL: Data file not found at {DATA_FILE}")
    except Exception as e:
        print(f"Error loading assets: {e}")

# Initial load
load_ml_assets()

class PredictRequest(BaseModel):
    percentile: float
    hsc_marks: float = 0.0
    category: str
    city_filter: str = ""
    course_filter: str = ""
    college_filter: str = ""

@app.get("/api/filters")
def get_filters():
    if df.empty:
        return {"categories": [], "cities": [], "courses": [], "status": "No data"}
    
    data_categories = df['category'].dropna().unique().tolist()
    # Prioritize common categories
    common = ["GOPENS", "GSCS", "GSTS", "GVJS", "GNT1S", "GNT2S", "GNT3S", "GOBCS", "EWS", "TFWS"]
    categories = sorted(list(set(common + data_categories)))
    
    cities = sorted(df['city'].dropna().unique().tolist())
    courses = sorted(df['course_name'].dropna().unique().tolist())
    colleges = sorted(df['college_name'].dropna().unique().tolist())

    return {
        "categories": categories, 
        "cities": cities, 
        "courses": courses, 
        "colleges": colleges,
        "status": "ok"
    }

@app.post("/api/predict")
def predict(req: PredictRequest):
    if df.empty:
        return {"results": [], "stretch_picks": 0, "safe_picks": 0, "eligible": True}
        
    # Engineering Eligibility Check (General Rule)
    is_eligible = req.hsc_marks >= 45.0
    
    filtered = df.copy()
    
    if req.city_filter and req.city_filter != "All Cities":
        filtered = filtered[filtered['city'].str.contains(req.city_filter, case=False, na=False)]
        
    if req.course_filter and req.course_filter != "All Courses":
        filtered = filtered[filtered['course_name'].str.contains(req.course_filter, case=False, na=False)]
        
    if req.college_filter and req.college_filter != "All Colleges":
        filtered = filtered[filtered['college_name'].str.contains(req.college_filter, case=False, na=False)]
        
    # Match Category
    cat_matches = filtered[filtered['category'] == req.category].copy()
    if cat_matches.empty:
        # Fallback to GOPENS if specific category not found
        cat_matches = filtered[filtered['category'] == 'GOPENS'].copy()

    # Filter by percentile
    results = cat_matches[cat_matches['percentile'] <= req.percentile].copy()
    results['margin'] = req.percentile - results['percentile']
    
    results_list = results.sort_values('margin', ascending=False).head(50).to_dict(orient='records')
    
    return {
        "results": results_list,
        "stretch_picks": sum(1 for r in results_list if r['margin'] < 2),
        "safe_picks": sum(1 for r in results_list if r['margin'] > 5),
        "eligible": is_eligible
    }

@app.post("/api/ai-recommend")
def ai_recommend(req: PredictRequest):
    # Simple rule-based advice if LLM is not available
    prediction = predict(req)
    colleges = prediction['results'][:5]
    
    if not colleges:
        return {"recommendation": "Based on your percentile, it's tough to find a match in the state-level list. Consider looking at private universities or institutional rounds."}

    context = "\n".join([f"- {c['college_name']} ({c['course_name']}) at {c['percentile']}%ile" for c in colleges])
    
    if llm:
        prompt = f"Student Profile: {req.percentile}%ile, Category {req.category}, HSC {req.hsc_marks}%. \nTop Matches:\n{context}\n\nProvide 3 sentences of expert counseling advice."
        formatted_prompt = f"<|system|>\nYou are an expert CET Counselor. Give strategic advice.</s>\n<|user|>\n{prompt}</s>\n<|assistant|>\n"
        try:
            output = llm(formatted_prompt, max_new_tokens=200, do_sample=True, temperature=0.7)
            recommendation = output[0]['generated_text'].split("<|assistant|>\n")[-1]
            return {"recommendation": recommendation}
        except Exception as e:
            print(f"LLM Inference error: {e}")
    
    # Fallback AI-like response
    advice = f"With {req.percentile}%ile, you have a strong chance at {colleges[0]['college_name']} for {colleges[0]['course_name']}. "
    advice += f"Since your HSC score is {req.hsc_marks}%, you meet the basic eligibility criteria. "
    advice += "Focus on the Cap Rounds carefully and prioritize these colleges in your option form."
    return {"recommendation": advice}

@app.get("/api/test")
def test():
    return {
        "total_rows": len(df),
        "llm_loaded": llm is not None,
        "data_path": DATA_FILE,
        "sample": df.head(1).to_dict(orient='records') if not df.empty else []
    }

app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(BASE_DIR, "static", "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
