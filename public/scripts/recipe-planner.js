var subjectObject = {
	"Ahmedabad": {
		"recipie 1": ["beet root", "coconut water", "ricebean"],
		"recipie 2": ["egg", "poultry", "omlet"],
	},
	"Ajmer": {
		"recipe 3": ["chicken", "poultry", "wing", "skinless"],
		"recipe 4": ["radish", "elongate", "white skin"],
	}
};

window.onload = function () {
	var kitchenSel = document.getElementById("kitchen-location");
	var recipeSel = document.getElementById("recipe");
	var ingredientSel = document.getElementById("ingredients");
	var recipeDel = document.getElementById("btn");

	for (var x in subjectObject) {
		kitchenSel.options[kitchenSel.options.length] = new Option(x, x);
	}
	kitchenSel.onchange = function () {
		//empty recipie- and ingredients- dropdowns
		ingredientSel.length = 1;
		recipeSel.length = 1;
		//display correct values
		for (var y in subjectObject[this.value]) {
			recipeSel.options[recipeSel.options.length] = new Option(y, y);
		}
	};
	recipeSel.onchange = function () {
		//empty ingredients dropdown
		ingredientSel.length = 1;
		//display correct values
		var z = subjectObject[kitchenSel.value][this.value];
		for (var i = 0; i < z.length; i++) {
			ingredientSel.options[ingredientSel.options.length] = new Option(z[i], z[i]);
		}
	};
	recipeDel.onclick = function () {
		var i;
		for (i = recipeSel.options.length - 1; i >= 0; i--) {
			if (recipeSel.options[i].selected)
				recipeSel.remove(i);
		}
	};
	const btnAdd = document.querySelector('#btnAdd');
	const btnRemove = document.querySelector('#btnRemove');
	const sb = document.querySelector('#list');
	const name = document.querySelector('#name');

	btnAdd.onclick = (e) => {
		e.preventDefault();

		// validate the option
		if (name.value == '') {
			alert('Please enter the ingredient');
			return;
		}
		// create a new option
		const option = new Option(name.value, name.value);
		// add it to the list
		sb.add(option, undefined);

		// reset the value of the input
		name.value = '';
		name.focus();
	};

	// remove selected option
	btnRemove.onclick = (e) => {
		e.preventDefault();

		// save the selected option
		let selected = [];

		for (let i = 0; i < sb.options.length; i++) {
			selected[i] = sb.options[i].selected;
		}

		// remove all selected option
		let index = sb.options.length;
		while (index--) {
			if (selected[index]) {
				sb.remove(index);
			}
		}
	};
};

function getRecipes() {
	const kitchen = document.getElementById('kitchen_select').value;

	const xhr = new XMLHttpRequest();
	xhr.open("POST", 'recipes',true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({'kitchen': kitchen}));

	xhr.onload = function () {
		if (xhr.readyState === xhr.DONE) {
			const response = JSON.parse(xhr.response);

			switch (xhr.status) {
				case 200:
					let acc = document.getElementById('recipesAccordion');
					while (acc.firstChild)
						acc.removeChild(acc.firstChild);

					if (response['recipes'].length === 0)
						acc.textContent = "No recipe to show.";
					else {
						const recipes = new Map();

						for (const recipeEntry of response['recipes']) {
							const ingredient = {
								'ingredient': recipeEntry.ingredient,
								'quantity': recipeEntry.quantity
							};

							if(recipes.has(recipeEntry.name))
								recipes.get(recipeEntry.name).push(ingredient);
							else
								recipes.set(recipeEntry.name, [ingredient]);
						}

						const template = document.getElementById('accordion-item');

						let i = 0;
						for (const [key, val] of recipes) {
							let clone = template.content.cloneNode(true);

							const recipeTitleId = 'recipe-' + i;
							const recipeDetailId = 'recipe-' + i + '-detail';

							let title = clone.querySelector("h2");
							title.setAttribute('id', recipeTitleId);

							let button = title.querySelector("button");
							button.textContent = key;
							button.setAttribute('data-bs-target', '#' + recipeDetailId);
							button.setAttribute('aria-controls', recipeDetailId);

							let detail = clone.getElementById("recipe-detail");
							detail.setAttribute('id', recipeDetailId);
							detail.setAttribute('aria-labelledby', recipeTitleId);

							let list = detail.querySelector("ul");

							for(const entry of val) {
								console.log(entry);
								let item = document.createElement("li");
								item.classList.add("list-group-item");
								item.textContent = entry.ingredient + ' : ' + entry.quantity;

								list.append(item);
							}

							acc.append(clone);
							i += 1;
						}
					}
					break;
				default:
					let alert = createAlert();
					alert.classList.add("alert-danger");
					alert.append(document.createTextNode('An error has occurred.'));
					document.getElementById("alerts").append(alert);
			}
		}
	};
}