from io import BytesIO
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import requests
import dotenv
import os
from openai import OpenAI

# Load environment variables from .env file
dotenv.load_dotenv()

# load variables from .env file
URLSCAN_API_KEY = os.getenv("URLSCAN_API_KEY")
HIBP_API_KEY = os.getenv("HIBP_API_KEY")


# Create FastAPI instance
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to the CheckSafe API!"}


@app.get("/ask-question")
async def get_question(question: str):
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    client = OpenAI()
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a cybersecurity expert."},
                {"role": "user", "content": question},
            ],
        )

        return completion.choices[0].message

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# API endpoint to proxy requests to urlscan.io
@app.post("/scan-url/")
async def scan_url(url: str):
    urlscan_api = "https://urlscan.io/api/v1/scan/"
    api_key = URLSCAN_API_KEY

    headers = {
        "API-Key": api_key,
        "Content-Type": "application/json",
    }
    payload = {"url": url}

    try:
        response = requests.post(urlscan_api, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


# API endpoint to get scan results from urlscan.io
@app.get("/scan-results/")
async def scan_results(scan_id: str):
    urlscan_api = f"https://urlscan.io/api/v1/result/{scan_id}/"

    try:
        response = requests.get(urlscan_api)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


# API endpoint to get scan results image from urlscan.io
@app.get("/scan-results-image/")
async def scan_results_image(scan_id: str):
    urlscan_api = f"https://urlscan.io/screenshots/{scan_id}.png"

    try:
        # Make the GET request to retrieve the image
        response = requests.get(urlscan_api)
        response.raise_for_status()  # Check if the request was successful

        # Return the image as a StreamingResponse
        return StreamingResponse(BytesIO(response.content), media_type="image/png")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/check-email/")
async def check_email(email: str):
    HIBP_API_URL = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
    headers = {
        "User-Agent": "FastAPI HIBP Client",  # HIBP API requires a user-agent header
        "hibp-api-key": HIBP_API_KEY,  # HIBP API key
    }

    try:
        # Make GET request to HIBP API
        response = requests.get(f"{HIBP_API_URL}", headers=headers)

        # If email has been found in a breach
        if response.status_code == 200:
            return response.json()  # Return the breaches data

        # If no breach was found for the email
        elif response.status_code == 404:
            return {"message": "Email has not been found in any breaches."}

        # If any other error occurs
        else:
            response.raise_for_status()

    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500, detail=f"Error connecting to HIBP API: {str(e)}"
        )


# Run the FastAPI app
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="8000:")
