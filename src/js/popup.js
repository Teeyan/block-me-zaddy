// Form overhead buttons
var blockUrlField;
var viewBlocksButton;
var createBlockButton;
var allBlocksDiv;


var viewBlocksSet = false;
var blockListCache = {};

window.onload = function() {
	blockUrlField = document.getElementById("blockUrl");

	createBlockButton = document.getElementById("createBlockButton");
	viewBlocksButton = document.getElementById("viewBlocksButton");

	createBlockButton.addEventListener("click", createBlockLink);
	viewBlocksButton.addEventListener("click", displayAllBlocks);

	allBlocksDiv = document.getElementById("blocksDiv");
}

/**
* Creates new blocked URL given the values in the form then clears it
*/
function createBlockLink(event) {
	console.log("creating block link");
	// Sanitize input
	url = blockUrlField.value;
	if(url == "") {
		console.log("cannot have blank input");
		return;
	}

	// Key-Value store but value
	chrome.storage.sync.set({ [url] : (new Date().toUTCString()) }, function() {
		console.log("adding block for URL");
	});
	blockUrlField.value = "";
}

/**
* Delete blocked url and remove it from the div table
* :param url: blocked url
* :param tr: table row to be deleted
*/
function deleteBlock(url, tr) {
	if(confirm("Are you sure you want to re-enable this URL?")) {
		chrome.storage.sync.remove(url, function() {
			console.log("re-enabling blocked URL %s", url);
		});
		tr.parentNode.removeChild(tr);
	} else {
		console.log("aborting delete...");
	}
}

/**
* Given a table, add a row to it containing URL value and a button that deletes the row
* :param table: table element to append row to
* :param url: url block
* :param date: timestamp of when the url block was added
* :param index: index of the row being added to the table used to id the element
*/
function addBlocksTableRow(table, url, date, index) {
	var tr = document.createElement('tr');

	var urlTd = document.createElement('td');
	urlTd.appendChild(document.createTextNode(url));
	tr.appendChild(urlTd);

	var dateTd = document.createElement('td');
	dateTd.appendChild(document.createTextNode(date));
	tr.appendChild(dateTd);

	var deleteTd = document.createElement('td');
	var deleteBttn = document.createElement('button');
	deleteBttn.innerHTML = "delete";
	deleteBttn.onclick = function() { deleteBlock(url, tr); }
	deleteTd.appendChild(deleteBttn);
	tr.appendChild(deleteBttn);
	
	table.appendChild(tr);
}

/**
* Displays all the links in the linksDiv and gives option for deleting them as well
*/
function displayAllBlocks(event) {
	console.log("viewing or hiding links");
	// Hide the div from view if viewLinksSet
	if(viewBlocksSet) {
		console.log("hiding blocks view")
		allBlocksDiv.innerHTML = "";
		viewBlocksButton.innerHTML = "View My Links";
		viewBlocksSet = false;
	}
	// Populate the div if unset
	else {
		console.log("populating blocks view")
		chrome.storage.sync.get(null, function(data) {
			var table = document.createElement('table');
			var content = document.createElement('tbody');
			table.setAttribute("id", "blocksTable");
			table.appendChild(content);

			index = 0;
			for(url in data) {
				addBlocksTableRow(table, url, data[url], index)
				index++;
			}
			allBlocksDiv.appendChild(table);
		});
		viewBlocksButton.innerHTML = "Hide Links";
		viewBlocksSet = true;
	}
}