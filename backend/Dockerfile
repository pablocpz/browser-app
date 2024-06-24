FROM python:3.11

WORKDIR /app

COPY Pipfile Pipfile.lock ./

RUN pip install pipenv && pipenv install --deploy --system --ignore-pipfile

COPY . .

CMD ["uvicorn", "sam_server.app:app", "--host", "0.0.0.0", "--port", "8000"]
