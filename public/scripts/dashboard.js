function toggle(link) {
	if(!link.classList.contains("active")) {
		let old = document.querySelector("a.nav-link.active");
		old.classList.remove("active");
		old.classList.add("link-secondary");
		old.removeAttribute('aria-current');

		let oldContent = document.getElementById(old.getAttribute("data-name"));
		oldContent.classList.remove("d-block");
		oldContent.classList.add("d-none");

		link.classList.add("active");
		link.setAttribute('aria-current', "page");

		let newContent = document.getElementById(link.getAttribute("data-name"));
		newContent.classList.add("d-block");
		newContent.classList.remove("d-none");
	}
}