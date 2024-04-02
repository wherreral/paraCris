const mobileMenuButton = document.querySelector(".menu__hamburger");
const menuListItems = document.querySelector(".menu__nav");


window.addEventListener("load", () => {
	mobileMenuButton.addEventListener("click", () => {
		menuListItems.classList.toggle("menu__nav--open");
	});
});
