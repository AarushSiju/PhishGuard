 --> PhishGuard - A phishing and malicious URL detector built for our Cybersecurity hackathon submission. PhishGuard combines rule-based heuristics with a trained machine learning classifier to flag risky URLs in real time, complete with a risk score and a plain-English explanation of why a link was flagged.

Problem Statement: Build a browser extension or web application that analyzes URLs and emails in real time, flagging phishing attempts using a combination of heuristics (domain age, structural red flags, etc.) and a trained ML classifier. The tool should present a clear risk score along with a short explanation of why a link was flagged.

Phishing remains one of the most common entry points for cyberattacks, and most users have no quick way to verify whether a link or email is safe before clicking. PhishGuard analyzes URLs in real time, flagging phishing attempts using a combination of heuristics (domain patterns, structural red flags) and a trained ML classifier, presenting a clear risk score along with a short explanation of why a link was flagged.

## Features

- **Heuristic engine** — checks for raw IP addresses, `@` symbol redirects, missing HTTPS, excessive subdomains, suspicious TLDs (`.tk`, `.ml`, `.ga`, `.cf`, `.xyz`, `.top`), unusually long URLs, and typosquatting against known brand names (Levenshtein distance matching)
- **Trained ML classifier** — a Random Forest model trained on 11,000+ labeled phishing/legitimate URLs, achieving ~90% accuracy
- **Combined risk scoring** — heuristic and ML scores are weighted together into a single 0–100 risk score with a low/medium/high risk verdict
- **Batch scanning** — paste multiple URLs (one per line) into the web app and get a results table for all of them at once
- **Real-time browser extension** — automatically scans the URL of any page the instant it loads, flagging risk via a colored badge on the extension icon, no manual action required

## Tech Stack:
- **Frontend:** React
- **Backend:** Node.js + Express
- **ML service:** Python (Flask + scikit-learn)
- **Browser extension:** Chrome Manifest V3

## Project Structure: 
```
PhishGuard/
  backend/              Node/Express server — heuristic engine + API routes
  phishing-ml/          Python ML training script, dataset, and Flask prediction API
  phishing-frontend/    React web app (batch URL scanner)
  phishing-extension/   Chrome extension for real-time, on-load scanning
```

## Setup:
You'll need three services running at once, each in its own terminal.

### 1. Backend (Node/Express) — port 5000
```bash
cd backend
npm install
node server.js
```

### 2. ML API (Flask) — port 5001
```bash
cd phishing-ml
pip install pandas scikit-learn flask flask-cors joblib
python app.py
```
If `phishing_model.pkl` and `feature_columns.pkl` aren't present in this folder, train the model first:
```bash
python train.py
```

### 3. Frontend (React) — port 3000
```bash
cd phishing-frontend
npm install
npm start
```
Opens automatically at `http://localhost:3000`.

### 4. Browser extension (optional):
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `phishing-extension` folder
4. Make sure the backend (step 1) is running — the extension calls it directly

**Start order matters:** always have the backend and ML API running before testing the frontend or extension.

## Testing It:
Try these in the web app or by navigating to them directly in the browser (for the extension):

**Should flag as risky:**
```
http://paypa1-login.tk/verify
http://192.168.1.100/account-login
http://amaz0n-security-check.xyz/login
```

**Should show low risk:**
```
https://www.wikipedia.org
https://github.com
```

## How Scoring Works:
Each heuristic check contributes points to a base risk score. That score is combined with the ML model's phishing probability (weighted 70% heuristics / 30% ML) into a final 0–100 score:
- **0–29:** Low risk
- **30–59:** Medium risk
- **60–100:** High risk

If the ML service is unreachable, the system gracefully falls back to heuristics-only scoring.

## Future Work:
- Domain-age lookup via a WHOIS API
- Email phishing analysis (sender/reply-to mismatch, urgency language detection, embedded link scanning)
- Cross-referencing a real threat-intelligence source (e.g. Google Safe Browsing)
- Expanding the ML feature set beyond the current 8 live-computable features

## Team

Built by a team of 4 for our Cybersecurity hackathon submission.
