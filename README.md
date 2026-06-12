# OCR Text Extractor PWA for iphone

A Progressive Web App (PWA) that lets you **take a photo or upload an image** from your library, extract text with OCR, clean and format it, and translate it between **English, Swedish, and Estonian** — all right from your browser or iPhone home screen.

---

## Features

✅ **Take Photo or Upload Image**  
– Separate buttons for camera and photo library.  
– Works perfectly on iPhone and Android.  

✅ **Offline-Ready (PWA)**  
– Installable as a web app on mobile or desktop.  
– Works offline for OCR and text management (translation needs internet).  

✅ **Text Extraction**  
– Uses [Tesseract.js v5](https://github.com/naptha/tesseract.js).  
– Supports English, Swedish, Estonian OCR. 

✅ **Text Management**  
– Clean up spaces and line breaks.  
– Convert to uppercase/lowercase.  
– Copy or download extracted text as `.txt`.

✅ **Translation**  
– Translates up to 500 characters using the free MyMemory API.  
– Supports English ⇄ Swedish ⇄ Estonian.

---

## 🛠️ Setup

### 1. Clone the Repository

```bash

git clone https://github.com/yourusername/ocr-text-extractor.git
cd ocr-text-extractor
```
2. Project Structure

ocr-text-extractor/
│
├── index.html          # Main App UI
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── /icons/             # App icons for PWA
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable.png
└── README.md


Running Locally

You can run it directly by opening index.html,
but for full PWA support (service worker), use a local web server:

Option 1 — Python
python3 -m http.server 8000

Then open:
http://localhost:8000
Option 2 — VS Code Live Server Extension

Just click “Go Live” in VS Code.
Adding to Home Screen

Visit your app URL in Safari on iPhone.
Tap Share → Add to Home Screen.
Launch it from your home screen — now it behaves like a native app.

Dependencies

Tesseract.js v5
MyMemory Translation API

Roadmap
Add auto language detection before OCR
Add multi-page OCR batch mode
Add dark mode toggle
Add export to PDF

Author
Lukas Benneberg
GitHub: @benneberg


License
This project is licensed under the MIT License
