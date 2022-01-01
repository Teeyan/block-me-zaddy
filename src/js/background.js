var urlBlocksCache = {}

function updateSnapshot() {
	chrome.storage.sync.get(null, function(data) {
		urlBlocksCache = data;
	});
}

chrome.runtime.onInstalled.addListener(function() {
	console.log("Installed block-me-zaddy. Thanks Zaddy!")
});

// On browser creation and new tab creation / load get a snapshot of the blocked URLs in storage
chrome.windows.onCreated.addListener(function(content) {
	updateSnapshot();
});

chrome.tabs.onCreated.addListener(function(content) {
	updateSnapshot();
});

// Listener for when url values in storage are changed so that we can refresh our storage cache
chrome.storage.onChanged.addListener(function(changes, namespace) {
	updateSnapshot();
})

// Listener for main logic. Intercerpt url requests and only process if they are not blocked
chrome.webRequest.onBeforeRequest.addListener(function(request) {
	console.log("Received request for %s", request.url);
	
	for (var url in urlBlocksCache) {
		urlRegExp = new RegExp(url);
		requestInd = request.url.search(urlRegExp)
		if(requestInd != -1) {
			console.log("url was blocked based off of rule matching %s", url);
			return { "redirectUrl": chrome.extension.getURL("../html/redirect.html") };
		}
	}
	return;
}, { urls:["https://*/*", "http://*/*"] }, ["blocking"]);