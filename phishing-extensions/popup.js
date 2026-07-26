chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    document.getElementById('url-display').textContent = tab.url;

    chrome.storage.local.get(['result_' + tab.id], function (items) {
        const data = items['result_' + tab.id];

        if (!data) {
            document.getElementById('status').textContent = 'No scan result yet — try reloading this page.';
            return;
        }

        document.getElementById('status').style.display = 'none';

        const verdictEl = document.getElementById('verdict');
        verdictEl.style.display = 'block';
        verdictEl.textContent = data.verdict.toUpperCase() + ' — Score: ' + data.score + '/100';

        if (data.verdict === 'high risk') verdictEl.style.color = '#e74c3c';
        else if (data.verdict === 'medium risk') verdictEl.style.color = '#f39c12';
        else verdictEl.style.color = '#2ecc71';

        const reasonsEl = document.getElementById('reasons');
        if (data.reasons && data.reasons.length > 0) {
            data.reasons.forEach(function (reason) {
                const li = document.createElement('li');
                li.textContent = reason;
                reasonsEl.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No red flags detected.';
            reasonsEl.appendChild(li);
        }
    });
});