function hasIpAddress(url) {
    const ipPattern = /^https?:\/\/(\d{1,3}\.){3}\d{1,3}/;
    return ipPattern.test(url);
}

function hasAtSymbol(url) {
    return url.includes('@');
}

function hasHttps(url) {
    return url.startsWith('https://');
}

function countSubdomains(url) {
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    const hostname = withoutProtocol.split('/')[0];
    const parts = hostname.split('.');
    return parts.length - 2;
}

function isSuspiciousTld(url) {
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top'];
    return suspiciousTlds.some(tld => url.includes(tld));
}

function isTooLong(url) {
    return url.length > 75;
}

function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function isTyposquat(url) {
    const knownBrands = ['paypal', 'google', 'amazon', 'facebook', 'apple', 'microsoft', 'netflix'];
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    const hostname = withoutProtocol.split('/')[0].replace('www.', '');
    const mainPart = hostname.split('.')[0].split('-')[0]; // grabs "paypa1" out of "paypa1-login.tk"

    for (const brand of knownBrands) {
        const distance = levenshteinDistance(mainPart, brand);
        if (distance > 0 && distance <= 2) {
            return { flagged: true, similarTo: brand };
        }
    }
    return { flagged: false };
}

function extractMLFeatures(url) {
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    const hostname = withoutProtocol.split('/')[0];

    const ipFeature = hasIpAddress(url) ? -1 : 1;

    let lengthFeature;
    if (url.length < 54) lengthFeature = 1;
    else if (url.length <= 75) lengthFeature = 0;
    else lengthFeature = -1;

    const atFeature = hasAtSymbol(url) ? -1 : 1;

    const subCount = countSubdomains(url);
    let subFeature;
    if (subCount <= 0) subFeature = 1;
    else if (subCount === 1) subFeature = 0;
    else subFeature = -1;

    const sslFeature = hasHttps(url) ? 1 : -1;

    const prefixSuffixFeature = hostname.includes('-') ? -1 : 1;

    const pathPart = url.replace(/^https?:\/\//, '');
    const doubleSlashFeature = pathPart.includes('//') ? -1 : 1;

    const httpsTokenFeature = hostname.toLowerCase().includes('https') ? -1 : 1;

    return [
        ipFeature,
        lengthFeature,
        atFeature,
        subFeature,
        sslFeature,
        prefixSuffixFeature,
        doubleSlashFeature,
        httpsTokenFeature
    ];
}

module.exports.extractMLFeatures = extractMLFeatures;

module.exports = {
    hasIpAddress,
    hasAtSymbol,
    hasHttps,
    countSubdomains,
    isSuspiciousTld,
    isTooLong,
    isTyposquat,
    extractMLFeatures
};