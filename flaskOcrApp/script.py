import cv2
from paddleocr import PaddleOCR
import re

# Initialize PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# Initialize webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam")
    exit()

print("Press 'q' to quit, 's' to scan for numbers")

while True:
    ret, frame = cap.read()
    
    if not ret:
        print("Error: Failed to capture frame")
        break
    
    # Display the frame
    cv2.imshow('Webcam OCR - Press "s" to scan', frame)
    
    key = cv2.waitKey(1) & 0xFF
    
    # Press 's' to scan for numbers
    if key == ord('s'):
        print("\nScanning for numbers...")
        
        # Perform OCR on the frame
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
                    
                    if numbers and confidence > 0.9:
                        for num in numbers:
                            numbers_found.append((num, confidence))
                            print(f"Number found: {num} (confidence: {confidence:.2f})")
                
                if not numbers_found:
                    print("No numbers detected in the frame")
            else:
                print("No text detected in the frame")
        else:
            print("No text detected in the frame")
    
    # Press 'q' to quit
    elif key == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()