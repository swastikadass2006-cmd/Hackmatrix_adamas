FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for XGBoost and C++ runtimes
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model artifacts (.joblib) and prediction script
COPY . .

# Render dynamically sets PORT; default to 8000 for local runs
ENV PORT=8000
EXPOSE 8000

# Start FastAPI application using Uvicorn
CMD uvicorn predict:app --host 0.0.0.0 --port $PORT
