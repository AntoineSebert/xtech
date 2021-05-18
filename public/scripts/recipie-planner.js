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

