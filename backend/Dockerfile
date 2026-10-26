FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Expose standard port
EXPOSE 8000

# Default start command for container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
