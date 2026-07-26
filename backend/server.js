const express = require('express');
const cors = require('cors');
const heuristics = require('./heuristics');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

function analyzeUrl(url) {
    let score = 0;
    const reasons = [];

    if (heuristics.hasIpAddress(url)) {
        score += 25;
        reasons.push('URL uses a raw IP address instead of a domain name');
    }

    if (heuristics.hasAtSymbol(url)) {
        score += 20;
        reasons.push("URL contains an '@' symbol, often used to disguise the real destination");
    }

    if (!heuristics.hasHttps(url)) {
        score += 10;
        reasons.push('URL does not use HTTPS');
    }

    if (heuristics.countSubdomains(url) >= 3) {
        score += 15;
        reasons.push('URL has an unusually high number of subdomains');
    }

    if (heuristics.isSuspiciousTld(url)) {
        score += 15;
        reasons.push('URL uses a domain extension commonly associated with phishing');
    }

    if (heuristics.isTooLong(url)) {
        score += 10;
        reasons.push('URL is unusually long');
    }

    const typosquatResult = heuristics.isTyposquat(url);
    if (typosquatResult.flagged) {
        score += 30;
        reasons.push(`URL closely resembles the trusted domain "${typosquatResult.similarTo}"`);
    }

    score = Math.min(score, 100);

    let verdict = 'low risk';
    if (score >= 60) verdict = 'high risk';
    else if (score >= 30) verdict = 'medium risk';

    return { score, verdict, reasons };
}

app.post('/analyze-batch', async function (req, res) {
    const urls = req.body.urls;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'No URLs provided' });
    }

    const results = [];

    for (const url of urls) {
        const heuristicResult = analyzeUrl(url);

        let mlResult = null;
        try {
            const mlFeatures = heuristics.extractMLFeatures(url);
            const mlResponse = await fetch('http://localhost:5001/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: mlFeatures })
            });
            mlResult = await mlResponse.json();
        } catch (err) {
            // ML unreachable, continue with heuristics only
        }

        const combinedScore = mlResult && mlResult.phishing_probability !== undefined
            ? Math.round(heuristicResult.score * 0.7 + mlResult.phishing_probability * 0.3)
            : heuristicResult.score;

        let verdict = 'low risk';
        if (combinedScore >= 60) verdict = 'high risk';
        else if (combinedScore >= 30) verdict = 'medium risk';

        results.push({
            url: url,
            score: combinedScore,
            verdict: verdict,
            reasons: heuristicResult.reasons
        });
    }

    res.json({ results: results });
});

app.post('/analyze', async function (req, res) {
    const url = req.body.url;

    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }

    const heuristicResult = analyzeUrl(url);

    let mlResult = null;
    try {
        const mlFeatures = heuristics.extractMLFeatures(url);
        const mlResponse = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ features: mlFeatures })
        });
        mlResult = await mlResponse.json();
    } catch (err) {
        console.log('ML service unreachable, continuing with heuristics only');
    }

    const combinedScore = mlResult && mlResult.phishing_probability !== undefined
        ? Math.round(heuristicResult.score * 0.7 + mlResult.phishing_probability * 0.3)
        : heuristicResult.score;

    let verdict = 'low risk';
    if (combinedScore >= 60) verdict = 'high risk';
    else if (combinedScore >= 30) verdict = 'medium risk';

    res.json({
        score: combinedScore,
        verdict: verdict,
        reasons: heuristicResult.reasons,
        ml_prediction: mlResult ? mlResult.prediction : 'unavailable'
    });
});

app.listen(5000, function () {
    console.log('Server running on http://localhost:5000');
});