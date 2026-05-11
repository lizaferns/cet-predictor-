import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def load_and_flatten():
    with open(r'C:\Users\Liza\Downloads\cutoff_2024.json', 'r') as f:
        raw = json.load(f)
    rows = []
    for college in raw.get('data', []):
        c_name = college.get('college_name', college.get('name', 'N/A'))
        # Try to guess city from name if not provided
        city = college.get('city', 'N/A')
        if city == 'N/A' and ',' in c_name:
            city = c_name.split(',')[-1].strip()
            
        for course in college.get('courses', []):
            course_name = course.get('course_name', course.get('name', 'N/A'))
            cutoffs_dict = course.get('cutoffs', {})
            
            # Extract from all levels (state_level, stage_i, etc.)
            for level_name, level_data in cutoffs_dict.items():
                if isinstance(level_data, dict):
                    # Sometimes stage_i is a nested dict, sometimes it's the direct categories
                    for cat, vals in level_data.items():
                        if isinstance(vals, dict) and 'percentile' in vals:
                            rows.append({
                                'college_name': c_name,
                                'course_name': course_name,
                                'city': city,
                                'level': level_name,
                                'category': cat,
                                'rank': vals.get('rank', 0),
                                'percentile': vals.get('percentile', 0)
                            })
    return pd.DataFrame(rows)

if __name__ == "__main__":
    print("Loading and flattening data...")
    df = load_and_flatten()
    
    if df.empty:
        print("Error: No data loaded. Check JSON structure.")
        exit(1)
        
    print(f"Data loaded: {len(df)} rows.")
    
    # Preprocessing
    le_cat = LabelEncoder()
    le_col = LabelEncoder()
    le_course = LabelEncoder()
    le_city = LabelEncoder()
    
    df['cat_encoded'] = le_cat.fit_transform(df['category'])
    df['col_encoded'] = le_col.fit_transform(df['college_name'])
    df['course_encoded'] = le_course.fit_transform(df['course_name'])
    df['city_encoded'] = le_city.fit_transform(df['city'])
    
    # Save Encoders
    os.makedirs('react_app', exist_ok=True)
    joblib.dump(le_cat, 'react_app/le_cat.pkl')
    joblib.dump(le_col, 'react_app/le_col.pkl')
    joblib.dump(le_course, 'react_app/le_course.pkl')
    joblib.dump(le_city, 'react_app/le_city.pkl')
    
    # Synthetic target for training (Eligibility)
    # Let's say if percentile is <= some threshold, label=1
    # For training, we'll just use a dummy rule: 1 if random > 0.3
    df['label'] = (np.random.rand(len(df)) > 0.3).astype(int)
    
    X = df[['percentile', 'cat_encoded', 'col_encoded', 'course_encoded', 'city_encoded']]
    y = df['label']
    
    print("Training Model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Save Model and Data
    joblib.dump(model, 'react_app/cet_model.pkl')
    joblib.dump(df, 'react_app/flattened_data.pkl')
    
    print("Training Complete. Files saved in react_app/")
