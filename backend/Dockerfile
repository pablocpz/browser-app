FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirements to cache them in docker layer
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create the criminal_data directory
RUN mkdir -p /app/criminal_data

# Set the working directory
WORKDIR /app

# Command to run the application
CMD ["uvicorn", "sam_server.app:app", "--host", "0.0.0.0", "--port", "8000"]
