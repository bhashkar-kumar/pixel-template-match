# CineMatch backend

1. python -m venv venv
2. venv\Scripts\activate          (Windows cmd)  |  source venv/bin/activate (Mac/Linux)
3. pip install -r requirements.txt
4. uvicorn main:app --reload --port 8000
5. Open http://localhost:8000/docs to test every endpoint.

Files
- main.py            API endpoints
- model.py           NeuMF architecture (must match training) + new-user fitting
- artifacts/         trained weights + data produced by train.py (do not rename)

Env vars
- CORS_ORIGINS       comma-separated extra frontend URLs allowed to call the API (e.g. your Vercel URL)
