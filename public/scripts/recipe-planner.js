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

let ingredient_count = 1;

function addIngredientFieldToList() {
	const list = document.getElementById("recipe_ingredients");
	const template = document.getElementById('ingredient_item');
	let clone = template.content.cloneNode(true);

	clone.querySelector("select").setAttribute('name', 'recipe[' + ingredient_count + '][name]');
	clone.querySelector("input").setAttribute('name', 'recipe[' + ingredient_count + '][quantity]');
	list.append(clone);

	ingredient_count += 1;
}

function removeIngredient(button) {
	const item = button.parentNode;
	item.parentNode.removeChild(item);
	updateNutritional();
}

function updateNutritional() {
	const entries = document.getElementById('recipe_ingredients')
		.querySelectorAll('.recipe-ingredient');

	let filteredEntries = new Map();

	for (const entry of entries) {
		let nameField = entry.querySelector("select");
		let quantityField = entry.querySelector("input");

		if(nameField.checkValidity() && nameField.value.length !== 0
			&& quantityField.checkValidity() && quantityField.value.length !== 0) {
			filteredEntries.set(nameField.value, quantityField.valueAsNumber);
		}
	}

	let energy = 0.0, protein = 0.0, water = 0.0, ash = 0.0, fat = 0.0, carbs = 0.0, cost = 0.0;

	for (const [key, val] of filteredEntries) {
		const ratio = val / 100;

		energy += ratio * ingredientsData.get(key).energy;
		protein += ratio * ingredientsData.get(key).protein;
		water += ratio * ingredientsData.get(key).water;
		ash += ratio * ingredientsData.get(key).ash;
		fat += ratio * ingredientsData.get(key).fat;
		carbs += ratio * ingredientsData.get(key).carbs;
		cost += ratio * Number(ingredientsData.get(key).cost.replace(/[^0-9.-]+/g,""));
	}

	/*
    category :
	    - non-compliant
	    - young children : 450cal + 12gr proteins
	    - older children : 700cal + 20gr proteins
	 */

	let energyYoung = document.getElementById("energy-young");
	energyYoung.textContent = String(parseInt(energy)) + ' kcal';
	energyYoung.setAttribute("aria-valuenow", String(parseInt(energy)));
	const energyPercentYoung = (100 / 450) * energy;
	energyYoung.style = "width: " + (energyPercentYoung < 100 ? energyPercentYoung : 100) + "%;";

	let energyOld = document.getElementById("energy-old");
	energyOld.textContent = String(parseInt(energy)) + ' kcal';
	energyOld.setAttribute("aria-valuenow", String(parseInt(energy)));
	const energyPercentOld = (100 / 700) * energy;
	energyOld.style = "width: " + (energyPercentOld < 100 ? energyPercentOld : 100) + "%;";

	let proteinYoung = document.getElementById("protein-young");
	proteinYoung.textContent = String(parseInt(protein)) + ' gr';
	proteinYoung.setAttribute("aria-valuenow", String(parseInt(protein)));
	const proteinPercentYoung = (100 / 12) * protein;
	proteinYoung.style = "width: " + (proteinPercentYoung < 100 ? proteinPercentYoung : 100) + "%;";

	let proteinOld = document.getElementById("protein-old");
	proteinOld.textContent = String(parseInt(protein)) + ' gr';
	proteinOld.setAttribute("aria-valuenow", String(parseInt(protein)));
	const proteinPercentOld = (100 / 20) * protein;
	proteinOld.style = "width: " + (proteinPercentOld < 100 ? proteinPercentOld : 100) + "%;";

	document.getElementById("recipe-water").textContent = String(water);
	document.getElementById("recipe-ash").textContent = String(ash);
	document.getElementById("recipe-fat").textContent = String(fat);
	document.getElementById("recipe-carbs").textContent = String(carbs);
	document.getElementById("recipe-cost").textContent = String(cost);
}
