# Webcam OCR Flask API

Flask API backend that captures webcam photos and extracts numbers using PaddleOCR.

## Setup

1. **Install Python dependencies:**

   ```bash
   pip install -r requirements_route.txt
   ```

2. **Run the Flask server:**

   ```bash
   python app.py
   ```

   The server will start on `http://localhost:5000`

## API Endpoints

### POST `/scan`

Captures a photo from the webcam after 1 second and returns the highest confidence number detected.

**Response (Success):**

```json
{
  "success": true,
  "number": "123",
  "confidence": 0.95,
  "all_numbers": [
    { "number": "123", "confidence": 0.95 },
    { "number": "45", "confidence": 0.87 }
  ]
}
```

**Response (No numbers found):**

```json
{
  "success": false,
  "message": "No numbers detected in the frame"
}
```

**Response (Error):**

```json
{
  "error": "Could not open webcam"
}
```

### GET `/health`

Health check endpoint to verify the server is running.

**Response:**

```json
{
  "status": "healthy"
}
```

## Testing

You can test the API using curl:

```bash
# Health check
curl http://localhost:5000/health

# Scan for numbers
curl -X POST http://localhost:5000/scan
```

## Notes

- The webcam will be accessed for approximately 1 second per request
- Numbers with confidence > 0.5 are considered
- The highest confidence number is returned as the primary result
- CORS is enabled to allow requests from the Node.js server
