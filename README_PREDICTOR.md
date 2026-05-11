# CET College Predictor: Implementation Status

The project has been upgraded with a **Premium AI Counselor** system.

## Project Structure
- `train_ai_counselor.py`: Processes your JSON data into a high-performance knowledge base for the AI.
- `react_app/main.py`: A FastAPI backend that handles predictions and AI counseling.
- `react_app/static/index.html`: A state-of-the-art Glassmorphism UI for a premium experience.
- `cutoff_2024.json`: Your primary data source.

## Key Features
1. **HSC Eligibility**: Automatically checks if you meet the 45% (general) requirement.
2. **AI Counselor**: Provides strategic advice based on your percentile and the 2024 cutoff data.
3. **Smart Categorization**: Results are grouped into **Safe**, **Good Match**, and **Stretch** picks.
4. **Premium Design**: Modern dark theme with interactive elements.

## How to Run
1. **Train the AI**:
   ```bash
   python train_ai_counselor.py
   ```
2. **Start the Backend**:
   ```bash
   cd react_app
   python main.py
   ```
3. **View the App**:
   Open [http://localhost:8000](http://localhost:8000) in your browser.
