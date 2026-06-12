# txtr — OCR & Translation

**Extract and translate text from any photo or document.** txtr is a lightweight, mobile-first Progressive Web App (PWA) that processes Optical Character Recognition (OCR) directly on your device. No accounts, no subscriptions, and it works completely offline.

## ⚡ Features

* **On-Device OCR:** Powered by Tesseract.js, your images never leave your phone. Privacy is built-in by default.
* **Offline First:** Install it to your home screen and use the core extraction tools without an internet connection.
* **Smart Translation:** Translates exclusively from your original extracted text, preventing the compounding errors common in multi-step translations.
* **Text Formatting Tools:** Instantly strip junk characters, normalize spacing, or toggle letter casing with one tap.
* **Export Ready:** Copy directly to your clipboard or download as a `.txt` file.

## 🛠 Tech Stack

* **Frontend:** Vanilla HTML, CSS, JavaScript
* **OCR Engine:** [Tesseract.js](https://tesseract.projectnaptha.com/) (v5)
* **Translation API:** MyMemory Translation API
* **Architecture:** Mobile-first, portrait-oriented PWA

## 🚀 Installation & Usage

txtr is built to be installed as a PWA. 

1.  Navigate to the live site on your mobile device.
2.  Tap the share icon (iOS) or menu button (Android) and select **"Add to Home Screen"**.
3.  Launch txtr from your home screen for a full-screen, native-like experience.

### Local Development

To run the project locally, you just need to serve the directory. No build step required.

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

```
## 💎 Pro Version
The base version includes English, Swedish, and Estonian OCR. A one-time purchase of $3 unlocks the Pro Language Pack, granting access to 9 additional offline OCR languages:
 * Norwegian, Danish, Finnish, German, French, Spanish, Portuguese, Dutch, and Italian.
## 📝 License
This project is licensed under the MIT License

Author
Lukas Benneberg
GitHub: @relvanta


