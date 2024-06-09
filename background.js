chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        const content = await fetchPageContent(tab.url);
        const newTabName = await generateTabName(content);

        if (newTabName && !isTabNameSimple(tab.title)) {
            chrome.tabs.update(tabId, { title: newTabName });
        }
    }
});

async function fetchPageContent(url) {
    const response = await fetch(url);
    const html = await response.text();
    return html;
}

async function generateTabName(content) {
    const coherenceResponse = await fetchFromCohere(content);
    return coherenceResponse.tabName;
}

async function fetchFromCohere(content) {
    const apiKey = 'xeuNfvPPpXN5SxFPkzaf1ThcTxgiKpMz5sUzQjrV';
    const apiUrl = 'https://api.cohere.ai/generate';

    const requestBody = {
        model: 'large',
        prompt: `Generate a simple and intuitive tab name based on the following website content:\n\n${content}`,
        max_tokens: 20,
        temperature: 0.7,
        k: 0,
        p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    const tabName = data.text.trim();
    return { tabName };
}

async function isTabNameSimple(tabName) {
    const coherenceResponse = await fetchFromCohere2(tabName);
    return coherenceResponse.isSimple;
}

async function fetchFromCohere2(tabName) {
    const apiKey = 'xeuNfvPPpXN5SxFPkzaf1ThcTxgiKpMz5sUzQjrV';
    const apiUrl = 'https://api.cohere.ai/generate';

    const requestBody = {
        model: 'large',
        prompt: `Determine if the following tab name is simple, intuitive, or a brand name:\n\n${tabName}\n\nRespond with either "true" or "false".`,
        max_tokens: 5,
        temperature: 0.7,
        k: 0,
        p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    const isSimple = data.text.trim().toLowerCase() === 'true';
    return { isSimple };
}