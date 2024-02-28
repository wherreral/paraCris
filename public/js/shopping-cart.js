const SHOPPING_CART_STORAGE_KEY = "storage__shopping__cart";

function formatPriceValue(price) {
	return new Intl.NumberFormat('es-CL', {
		style: 'currency',
		currency: 'CLP',
	}).format(price);
}

function getShoppingCartListFromLocalStorage() {
	const shoppingCartList = window.localStorage.getItem(SHOPPING_CART_STORAGE_KEY);
	if (shoppingCartList) return JSON.parse(shoppingCartList);
	return [];
}

function getTotalShoppingCartPrice() {
	const items = getShoppingCartListFromLocalStorage();
	const total = items.reduce((acc, current) => (Number(current.price) * current.quantity) + acc, 0);
	return total;
}

function getTotalShoppingCartQuantity() {
	const items = getShoppingCartListFromLocalStorage();
	const total = items.reduce((acc, current) => current.quantity + acc, 0);
	return total;
}

function addToShoppingCart(item) {
	const cart = getShoppingCartListFromLocalStorage();
	const product = {
		id: item.id,
		image: item.image,
		price: item.price,
		quantity: item.quantity,
	};
	const productIdx = cart.findIndex((currentProduct) => currentProduct.id === product.id);
	if (productIdx !== -1) {
		cart[productIdx].quantity += item.quantity;
	} else {
		cart.push(product);
	}
	window.localStorage.setItem(SHOPPING_CART_STORAGE_KEY, JSON.stringify(cart));
}

function removeFromShoppingCart(id) {
	const cart = getShoppingCartListFromLocalStorage();
	const updatedCart = cart.filter((cart) => cart.id !== id);
	window.localStorage.setItem(SHOPPING_CART_STORAGE_KEY, JSON.stringify(updatedCart));
}

function toggleShowShoppingCart() {
	const shoppingCartOverlay = document.querySelector(".shopping-cart__overlay");
	const shoppingCartSidebar = document.querySelector(".shopping-cart__sidebar");
	const hasOverlayShowClass = shoppingCartOverlay.classList.contains("shopping-cart__overlay--show");
	const hasSidebarShowClass = shoppingCartSidebar.classList.contains("shopping-cart__sidebar--show");
	if (hasOverlayShowClass && hasSidebarShowClass) {
		shoppingCartOverlay.classList.remove("shopping-cart__overlay--show");
		shoppingCartSidebar.classList.remove("shopping-cart__sidebar--show");
		return;
	}
	shoppingCartOverlay.classList.add("shopping-cart__overlay--show");
	shoppingCartSidebar.classList.add("shopping-cart__sidebar--show");
}

function createShoppingCartItemCard(item) {
	const card = document.createElement("section");
	card.classList.add("shopping-cart__item");

	const image = document.createElement("img");
	image.classList.add("shopping-cart__image");
	image.src = item.image;
	image.width = 248;
	image.height = 480;

	const price = document.createElement("span");
	price.classList.add("shopping-card__price");
	price.textContent = `${item.quantity} x ${formatPriceValue(Number(item.price))}`;

	const deleteButton = document.createElement("button");
	deleteButton.classList.add("shopping-cart__delete-item");
	deleteButton.type = "button";
	deleteButton.innerHTML = "&times;";
	deleteButton.addEventListener("click", (event) => {
		removeFromShoppingCart(item.id);
		renderShoppingCartItems();
		renderTotalShoppingCart();
		renderTotalCartItemsOnMenuButton();
		renderCompleteOrderButton();
	});

	const group = document.createElement("div");
	group.classList.add("shopping-cart__group");

	card.appendChild(image);
	group.appendChild(price);
	group.appendChild(deleteButton);
	card.appendChild(group);

	return card;
}

function clearShoppingCartItems() {
	const htmlCartItems = document.querySelectorAll('.shopping-cart__item');
	for (let idx = 0; idx < Array.from(htmlCartItems).length; idx++) {
		htmlCartItems[idx].remove();
	}
}

function renderShoppingCartItems() {
	clearShoppingCartItems();
	const shoppingCartItems = getShoppingCartListFromLocalStorage();
	const shoppingCartContent = document.querySelector(".shopping-cart__content");

	if (shoppingCartItems.length === 0) {
		const title = document.createElement("h4");
		title.classList.add("shopping-cart__empty-title");
		title.textContent = "Aún no has agregado un producto al carrito, agrega uno para poder comprar. 🛒";
		shoppingCartContent.appendChild(title);
	}

	if (shoppingCartItems.length > 0) {
		const title = document.querySelector(".shopping-cart__empty-title");
		if (title) title.remove();
	}

	for (let idx = 0; idx < shoppingCartItems.length; idx++) {
		const productCard = createShoppingCartItemCard(shoppingCartItems[idx]);
		shoppingCartContent.appendChild(productCard);
	}
}

function renderTotalShoppingCart() {
	const shoppigCartTotalLabel = document.querySelector("#shopping-cart-total");
	const total = getTotalShoppingCartPrice();
	const quantity = getTotalShoppingCartQuantity();
	shoppigCartTotalLabel.textContent = `Total: ${formatPriceValue(total)} (${quantity})`;
}

function renderTotalCartItemsOnMenuButton() {
	const htmlTotalBadge = document.querySelector(".shopping-cart__total-badge");
	if (htmlTotalBadge) htmlTotalBadge.remove();

	const button = document.querySelector("#menu-shopping-cart-button");
	const quantity = getTotalShoppingCartQuantity();
	const badge = document.createElement("span");

	badge.classList.add("shopping-cart__total-badge");
	badge.textContent = quantity > 9 ? '9+' : quantity;

	if (quantity > 0) button.appendChild(badge);
}

function renderCompleteOrderButton() {
	const htmlCompleteOrderButton = document.querySelector(".shopping-cart__complete-order-btn");
	if (htmlCompleteOrderButton) htmlCompleteOrderButton.remove();

	const footer = document.querySelector(".shopping-cart__footer");
	const quantity = getTotalShoppingCartQuantity();
	const button = document.createElement("button");
	button.classList.add("shopping-cart__complete-order-btn");
	button.disabled = quantity > 0 ? false : true;
	button.textContent = "Procesar Compra";
	button.addEventListener("click", () => {
		console.log("Procesando compra... 🛒");
	});

	footer.appendChild(button);
}

window.addEventListener("load", () => {
	renderTotalCartItemsOnMenuButton();
	const shoppingCartCloseBtn = document.querySelector(".shopping-cart__close-btn");
	const shoppingCartSidebar = document.querySelector("#shopping-cart-sidebar");
	const shoppingCartOverlay = document.querySelector("#shopping-cart-overlay");
	const shoppingCartMenuButton = document.querySelector("#menu-shopping-cart-button");
	const objects = document.querySelectorAll("#myHref");

	shoppingCartSidebar.addEventListener("click", (event) => event.stopPropagation());
	shoppingCartOverlay.addEventListener("click", () => toggleShowShoppingCart());
	shoppingCartCloseBtn.addEventListener("click", () => toggleShowShoppingCart());
	shoppingCartMenuButton.addEventListener("click", () => {
		renderShoppingCartItems();
		renderTotalShoppingCart();
		renderCompleteOrderButton();
		toggleShowShoppingCart();
	});
	// document.querySelectorAll("#myHref").addEventListener("click", e => {
	for (let i = 0; i < objects.length; i++) {
		objects[i].addEventListener("click", (e) => {
			const elem = e.target;
			const product = {
				id: elem.getAttribute("data-id"),
				image: elem.getAttribute("data-image"),
				price: elem.getAttribute("data-price"),
				quantity: 1,
			};
			toggleShowShoppingCart();
			addToShoppingCart(product);
			renderShoppingCartItems();
			renderTotalShoppingCart();
			renderTotalCartItemsOnMenuButton();
			renderCompleteOrderButton();
			/*
			var parent = e.target.parentElement;
			// console.log(parent.firstChild.getAttribute("id"))
			const prodId = parent.firstChild.getAttribute("id");
			//cbox[i].classList.toggle("red");
			//CALL API ADD TO CART
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function() {
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				console.log('save response ' + xmlHttp.responseText);
				var myObject = JSON.parse(xmlHttp.responseText);
				//console.log(myObject.orderId);
				//update cart quantity
				var badge = document.getElementById("cart_menu_num");
				badge.style.display = 'block';
				// console.log("badge:" + badge);
				let value = badge.innerText;
				// console.log("value:" + value);
				//badge.value = badge.value + 1;
				if (!isNaN(value) && value !== undefined) {
					badge.innerText = parseInt(value) + 1;
				} else {
					badge.innerText = 1;
				}
				//badge.InnerHTML = bad
				}
			}
			API_HOST = 'http://localhost:3002';
			var url = new URL(API_HOST + "/add/product/" + prodId);
			xmlHttp.open("POST", url);
			xmlHttp.setRequestHeader('Content-Type', 'application/json');
			xmlHttp.send();
			*/
		});
	}
	// Can also cancel the event and manually navigate
	// e.preventDefault();
	// window.location = e.target.href;
	//});
});
