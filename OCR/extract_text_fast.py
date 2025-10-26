import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path
import sys

# Optional: If tesseract is not in PATH, specify its location
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_pdf(pdf_path):
    text = ""
    ocr_pages = []

    # Open PDF
    doc = fitz.open(pdf_path)

    # First, try extracting text using PyMuPDF
    for page_num, page in enumerate(doc):
        page_text = page.get_text().strip()
        if page_text:
            text += page_text + "\n"
        else:
            # Mark page for OCR if PyMuPDF returns empty
            ocr_pages.append(page_num)

    # Run OCR only on pages that had no text
    if ocr_pages:
        print(f"Running OCR on {len(ocr_pages)} page(s)...")
        images = convert_from_path(pdf_path)
        for page_num in ocr_pages:
            text += pytesseract.image_to_string(images[page_num]) + "\n"

    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_text_fast.py <pdf_path>")
        sys.exit(1)

    pdf_file = sys.argv[1]
    extracted_text = extract_text_from_pdf(pdf_file)
    
    if extracted_text:
        print("Extracted Text:\n")
        print(extracted_text)
    else:
        print("Failed to extract text.")
