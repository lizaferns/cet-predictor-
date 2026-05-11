import json
import pandas as pd
import os
from pathlib import Path

def train_knowledge_base():
    """
    'Training' the AI Counselor involves processing the raw JSON data 
    into a structured format that the LLM can easily consume via context injection (RAG).
    """
    print("🚀 Starting AI Counselor 'Training' Phase...")
    
    # Path setup
    current_dir = Path(__file__).parent
    data_file = current_dir / "cutoff_2024.json"
    output_dir = current_dir / "react_app"
    output_dir.mkdir(exist_ok=True)
    
    if not data_file.exists():
        print(f"❌ Error: {data_file} not found!")
        return

    print(f"📖 Reading {data_file}...")
    with open(data_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    # Flatten the data for efficient retrieval
    print("🧹 Cleaning and Flattening data...")
    records = []
    items = raw_data.get('data', []) if isinstance(raw_data, dict) else raw_data
    
    for college in items:
        c_name = college.get('name', college.get('college_name', 'N/A'))
        city = college.get('city', college.get('city_name', 'N/A'))
        for course in college.get('courses', []):
            course_name = course.get('name', course.get('course_name', 'N/A'))
            cutoffs = course.get('cutoffs', {})
            for level, level_data in cutoffs.items():
                if isinstance(level_data, dict):
                    cat_data = level_data.get('stage_i', level_data)
                    if isinstance(cat_data, dict):
                        for cat, vals in cat_data.items():
                            percentile = None
                            if isinstance(vals, dict):
                                percentile = vals.get('percentile')
                            elif isinstance(vals, (int, float)):
                                percentile = vals
                            
                            if percentile:
                                records.append({
                                    'college': c_name,
                                    'course': course_name,
                                    'city': city,
                                    'category': cat,
                                    'percentile': float(percentile)
                                })

    df = pd.DataFrame(records)
    
    # Save the 'trained' knowledge base
    knowledge_path = output_dir / "knowledge_base.pkl"
    print(f"💾 Saving processed knowledge base to {knowledge_path}...")
    df.to_pickle(knowledge_path)
    
    # Generate a small summary for the LLM 'System Prompt'
    summary = {
        "total_colleges": len(df['college'].unique()),
        "total_courses": len(df['course'].unique()),
        "avg_percentile": float(df['percentile'].mean()),
        "categories": df['category'].unique().tolist()
    }
    
    with open(output_dir / "model_summary.json", 'w') as f:
        json.dump(summary, f, indent=4)

    print("✅ Training Complete! The AI Counselor is now ready to serve students.")
    print(f"📊 Processed {len(df)} cutoff points across {summary['total_colleges']} colleges.")

if __name__ == "__main__":
    train_knowledge_base()
