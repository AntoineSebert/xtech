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
}
