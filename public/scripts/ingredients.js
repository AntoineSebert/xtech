/*
async function postIngredient(url = '', data = {}) {
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin,
		// same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	return response.json(); // parses JSON response into native JavaScript objects
}
*/

function addIngredient() {
	fetch('/ingredients')
		.then(response => response.json())
		.then(data => console.log(data));
}

function deleteIngredients() {
	let checkedIngredients = document.querySelectorAll('tbody input[type=checkbox]:checked');
	let ids = Array.from(checkedIngredients.values()).map(i => i.value);
	console.log(ids);

	const xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", 'http://localhost:5000/ingredients/delete',true); // false for synchronous request
	xmlHttp.setRequestHeader('Content-Type', 'application/json');
	xmlHttp.send(JSON.stringify({'ids': ids}));

	return xmlHttp.responseText;
}

function addEditableEmptyRow() {

}
