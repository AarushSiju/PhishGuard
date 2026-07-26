chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading' && tab.url && tab.url.startsWith('http')) {
        analyzeAndBadge(tabId, tab.url);
    }
});

function analyzeAndBadge(tabId, url) {
    fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
    })
        .then(function (response) { return response.json(); })
        .then(function (data) {
            let color = '#2ecc71';
            let text = 'OK';

            if (data.verdict === 'high risk') {
                color = '#e74c3c';
                text = '!!!';
            } else if (data.verdict === 'medium risk') {
                color = '#f39c12';
                text = '!';
            }

            chrome.action.setBadgeBackgroundColor({ color: color, tabId: tabId });
            chrome.action.setBadgeText({ text: text, tabId: tabId });

            chrome.storage.local.set({ ['result_' + tabId]: data });
        })
        .catch(function (err) {
            console.log('Backend unreachable:', err);
            chrome.action.setBadgeBackgroundColor({ color: '#999999', tabId: tabId });
            chrome.action.setBadgeText({ text: '?', tabId: tabId });
        });
}