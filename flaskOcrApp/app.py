from flask import Flask, jsonify
from flask_cors import CORS
import cv2
from paddleocr import PaddleOCR
import re
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js server to call this API

# Initialize PaddleOCR once (for better performance)

def capture_and_scan():
    """
    Capture a photo from webcam after 1 second and extract numbers with OCR.
    Returns the highest confidence number found.
    """
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        return {"error": "Could not open webcam"}, 500
    
    try:
        # Wait 1 second before capturing
        print("Waiting 1 second before capture...")
        time.sleep(1)
        
        # Capture frame
        ret, frame = cap.read()
        
        if not ret:
            return {"error": "Failed to capture frame"}, 500
        
        print("Frame captured, performing OCR...")
        
        # Perform OCR on the frame
        ocr = PaddleOCR(use_angle_cls=True, lang='en')
        result = ocr.predict(frame)
        
        # Extract and filter numbers
        if result and len(result) > 0:
            ocr_result = result[0]
            
            # Check if we have recognized texts
            if 'rec_texts' in ocr_result and 'rec_scores' in ocr_result:
                rec_texts = ocr_result['rec_texts']
                rec_scores = ocr_result['rec_scores']
                
                numbers_found = []
                
                for text, confidence in zip(rec_texts, rec_scores):
                    # Find numbers in the text
                    numbers = re.findall(r'\d+\.?\d*', text)
                    
                    if numbers and confidence > 0.5:  # Lower threshold for better detection
                        for num in numbers:
                            numbers_found.append({
                                'number': num,
                                'confidence': float(confidence)
                            })
                            print(f"Number found: {num} (confidence: {confidence:.2f})")
                
                if numbers_found:
                    # Sort by confidence and return the highest
                    highest = max(numbers_found, key=lambda x: x['confidence'])
                    return {
                        "success": True,
                        "number": highest['number'],
                        "confidence": highest['confidence'],
                        "all_numbers": numbers_found
                    }, 200
                else:
                    return {
                        "success": False,
                        "message": "No numbers detected in the frame"
                    }, 200
            else:
                return {
                    "success": False,
                    "message": "No text detected in the frame"
                }, 200
        else:
            return {
                "success": False,
                "message": "No text detected in the frame"
            }, 200
            
    except Exception as e:
        return {"error": str(e)}, 500
    
    finally:
        # Always release the webcam
        cap.release()

@app.route('/scan', methods=['POST'])
def scan_webcam():
    """
    POST endpoint to capture webcam photo and scan for numbers.
    Returns the highest confidence number found.
    """
    result, status_code = capture_and_scan()
    return jsonify(result), status_code

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
