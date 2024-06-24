FROM python:3.11

WORKDIR /app

COPY Pipfile Pipfile.lock ./

RUN pip install pipenv && pipenv install --deploy --ignore-pipfile

COPY . .

CMD ["pipenv", "run", "uvicorn", "sam_server.app:app", "--host", "0.0.0.0", "--port", "8000"]