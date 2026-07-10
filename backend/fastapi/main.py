from fastapi import FastAPI

app = FastAPI(title="apiPedia FastAPI Service")

@app.get("/")
def home():
    return {
        "message": "Welcome to apiPedia FastAPI!"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }