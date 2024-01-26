function sendMessageToContentScript() {
	// Specify the tabId or use null for broadcasting to all tabs
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var tabId = tabs[0].id;

		// Send a message to the content script
		chrome.tabs.sendMessage(tabId, { message: "Hello from background script!" });
	});
}

function onBeforeRequest(details) {
	if (details.url.startsWith("https://www.npmjs.com/package/")) {
		sendMessageToContentScript()
	}
	return { cancel: false };
}


chrome.webRequest.onCompleted.addListener(onBeforeRequest, { urls: ["<all_urls>"] });
