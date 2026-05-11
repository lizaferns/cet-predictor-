import json
import pandas as pd
import os

def load_data(file_path):
    if not os.path.exists(file_path):
        print("File not found")
        return pd.DataFrame()

    with open(file_path, 'r') as f:
        raw = json.load(f)

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

df = load_data('cutoff_2024.json')
print(f"Total rows loaded: {len(df)}")
if not df.empty:
    print(f"Categories found: {df['category'].unique()[:10]}")
    
    # Test filtering like app.py
    user_percentile = 95.0
    user_category = 'GOPENS'
    
    filtered_df = df[
        (df['category'] == user_category) &
        (df['percentile'] <= user_percentile)
    ].copy()
    print(f"Results for {user_category} at {user_percentile}%ile: {len(filtered_df)}")
    
    # Test with GOPENH
    user_category_h = 'GOPENH'
    filtered_df_h = df[
        (df['category'] == user_category_h) &
        (df['percentile'] <= user_percentile)
    ].copy()
    print(f"Results for {user_category_h} at {user_percentile}%ile: {len(filtered_df_h)}")
