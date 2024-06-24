FROM python:3.11

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0

WORKDIR /app

COPY Pipfile Pipfile.lock ./

RUN pip install pipenv && pipenv install --deploy --system --ignore-pipfile

COPY . .

CMD ["uvicorn", "sam_server.app:app", "--host", "0.0.0.0", "--port", "8000"]
