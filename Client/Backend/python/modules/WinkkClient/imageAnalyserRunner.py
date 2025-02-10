import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ImageAnalyser import ImageAnalyser

def main():
    image_url = r"C:\Users\gabri\Downloads\Screenshot 2025-02-10 163855.jpg"  # Replace with the path to your image
    generator = ImageAnalyser()
    response = generator.generateResponse(image_url)
    print("Generated Response:", response)

if __name__ == "__main__":
    main()