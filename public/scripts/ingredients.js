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

function createAlert() {
	let alert = document.createElement('div');
	alert.setAttribute('role', 'alert');
	alert.classList.add("alert", "alert-dismissible", "fade", "show");

	let button = document.createElement('button');
	button.setAttribute('type', 'button');
	button.setAttribute('data-bs-dismiss', 'alert');
	button.setAttribute('aria-label', 'Close');
	button.classList.add("btn-close");
	alert.append(button);
	
	return alert;
}

document.addEventListener("DOMContentLoaded", () => {
	for (let checkbox of document.querySelectorAll('#ingredients_table input[type=checkbox]:checked'))
		checkbox.checked = false;
});

function deleteIngredients() {
	let ids = Array.from(document.querySelectorAll(
		'#ingredients_table input[type=checkbox]:checked'
	).values()).map(i => i.value);

	const xhr = new XMLHttpRequest();
	xhr.open("POST", 'ingredients/delete',true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({'ids': ids}));

	xhr.onload = function () {
		if (xhr.readyState === xhr.DONE) {
			const response = JSON.parse(xhr.response);
			let alert = createAlert();
			
			switch (xhr.status) {
				case 200:
					const deleted = parseInt(response['deleted']);

					if(deleted === 0) {
						alert.classList.add("alert-warning");
						alert.append(document.createTextNode('No row(s) has been removed.'));
					} else {
						alert.classList.add("alert-success");
						alert.append(document.createTextNode(deleted + ' rows has been removed.'));
					}

					break;
				default:
					alert.classList.add("alert-danger");
					alert.append(document.createTextNode('An error has occurred.'));
			}

			document.getElementById("alerts").append(alert);
		}
	};
}

function addIngredient(form) {
	const xhr = new XMLHttpRequest();
	xhr.open("POST", 'ingredients/add',true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({
		'name': form.elements.name.value,
		'energy': form.elements.energy.value,
		'protein': form.elements.protein.value,
		'water': form.elements.water.value,
		'ash': form.elements.ash.value,
		'fat': form.elements.fat.value,
		'carbs': form.elements.carbs.value,
		'cost': form.elements.cost.value,
	}));

	xhr.onload = function () {
		if (xhr.readyState === xhr.DONE) {
			let alert = createAlert();

			switch (xhr.status) {
				case 200:
					alert.classList.add("alert-success");
					alert.append(document.createTextNode('The ingredient has been added.'));
					break;
				default:
					const response = JSON.parse(xhr.response);
					alert.classList.add("alert-danger");
					alert.append(document.createTextNode('Error: ' + response['errors']));
			}

			document.getElementById("alerts").append(alert);
		}
	};
}

function toggleNew() {
	let form = document.getElementById("newIngredient");
	form.hidden = !form.hidden;
}
