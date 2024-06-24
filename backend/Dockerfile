FROM python:3.11-slim

WORKDIR /backend
#it's not the working dir of the runtime

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*


# Copy only requirements to cache them in docker layer
COPY requirements.txt .

COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project

# Set the working directory

# Command to run the application
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "sam_server.app:app", "--host", "0.0.0.0", "--port", "8000"]

