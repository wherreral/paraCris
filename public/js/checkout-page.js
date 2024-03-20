const checkoutAddressForm = document.querySelector("#checkout-address-form");
const checkoutPageFormSubmitButton = document.querySelector(".checkout-page__form-submit");
const checkoutPageMessage = document.querySelector(".checkout-page__message");

function createSummaryCartItemCard(item) {
	const card = document.createElement("section");
	card.classList.add("checkout-page__summary-item");

	const title = document.createElement("h3");
	title.classList.add("checkout-page__summary-item-title");
	title.textContent = item.name;

	const image = document.createElement("img");
	image.classList.add("checkout-page__summary-item-image");
	image.src = item.image;
	image.width = 248;
	image.height = 480;

	const price = document.createElement("span");
	price.classList.add("checkout-page__price");
	price.textContent = `${item.quantity} x ${formatPriceValue(Number(item.price))}`;

	const deleteButton = document.createElement("button");
	deleteButton.classList.add("checkout-page__summary-delete-item");
	deleteButton.type = "button";
	deleteButton.innerHTML = "&times;";
	deleteButton.addEventListener("click", () => {
		removeFromShoppingCart(item.id);
		renderSummaryCartItems();
		renderShoppingCartItems();
		renderTotalShoppingCart();
		renderTotalCartItemsOnMenuButton();
		renderCompleteOrderButton();
	});

	const group = document.createElement("div");
	group.classList.add("checkout-page__summary-item-group");

	card.appendChild(image);
	group.appendChild(title);
	group.appendChild(price);
	group.appendChild(deleteButton);
	card.appendChild(group);

	return card;
}

function renderSummaryCartOrder() {
	const htmlSummaryOrder = document.querySelector(".checkout-page__summary-order");
	if (htmlSummaryOrder) htmlSummaryOrder.remove();

	const totalValue = formatPriceValue(getTotalShoppingCartPrice());
	const card = document.createElement("div");
	card.classList.add("checkout-page__summary-order");

	const total = document.createElement("h3");
	total.classList.add("checkout-page__summary-order-title");
	total.textContent = `Total ${totalValue}`;

	card.appendChild(total);

	return card;
}

function clearSummaryCartItems() {
	const htmlCartItems = document.querySelectorAll('.checkout-page__summary-item');
	for (let idx = 0; idx < Array.from(htmlCartItems).length; idx++) {
		htmlCartItems[idx].remove();
	}
}

function renderSummaryCartItems() {
	clearShoppingCartItems();
	clearSummaryCartItems();
	const checkoutSummaryOrder = document.querySelector("#checkout-summary-order");
	const shoppingCartItems = getShoppingCartListFromLocalStorage();

	if (shoppingCartItems.length === 0) {
		const title = document.createElement("h3");
		title.classList.add("checkout-page__empty-title");
		title.textContent = "Aún no has agregado un producto al carrito, agrega uno para poder comprar. 🛒";
		checkoutSummaryOrder.appendChild(title);
	}

	if (shoppingCartItems.length > 0) {
		const title = document.querySelector(".checkout-page__empty-title");
		if (title) title.remove();
	}

	for (let idx = 0; idx < shoppingCartItems.length; idx++) {
		const productCard = createSummaryCartItemCard(shoppingCartItems[idx]);
		checkoutSummaryOrder.appendChild(productCard);
	}

	checkoutSummaryOrder.appendChild(renderSummaryCartOrder());
}

function handleCheckoutSubmit(event) {
	event.preventDefault();
	const shoppingCartItems = getShoppingCartListFromLocalStorage();
	if (!Boolean(shoppingCartItems.length)) {
		const message = document.createElement("small");
		message.classList.add("checkout-page__message", "checkout-page__message-error");
		message.textContent = "No hay productos para procesar.";
		checkoutAddressForm.appendChild(message);
		setTimeout(() => {
			const message = document.querySelector(".checkout-page__message");
			if (message) message.remove();
		}, 4500);
		return;
	}
	checkoutPageFormSubmitButton.disabled = true;
	checkoutPageFormSubmitButton.textContent = "Procesando...";

	const formData = new FormData(event.target);
	const data = {
		name: formData.get("name"),
		lastname: formData.get("lastname"),
		email: formData.get("email"),
		phone: formData.get("phone"),
		address: formData.get("address"),
		comune: formData.get("comune"),
		region: formData.get("region"),
		payment: formData.get("payment"),
	};

	setTimeout(() => {
		fetch("/checkout", {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})
		.then((response) => {
			if (response.ok) return response.json();
		})
		.then((data) => {
			const message = document.createElement("small");
			message.classList.add("checkout-page__message", "checkout-page__message-success");
			message.textContent = "Order Procesada";
			checkoutAddressForm.appendChild(message);
			console.log('Processing order...', data);
		})
		.catch((error) => {
			const message = document.createElement("small");
			message.classList.add("checkout-page__message", "checkout-page__message-error");
			message.textContent = "Error al procesar la orden";
			checkoutAddressForm.appendChild(message);
			console.log('Error processing the order...', error);
		})
		.finally(() => {
			checkoutPageFormSubmitButton.disabled = false;
			checkoutPageFormSubmitButton.textContent = "Confirmar";
			checkoutAddressForm.reset();
			setTimeout(() => {
				const message = document.querySelector(".checkout-page__message");
				if (message) message.remove();
			}, 4500);
		});
	}, 3000);
}


window.addEventListener("load", () => {
	renderTotalCartItemsOnMenuButton();
	renderSummaryCartItems();

	checkoutAddressForm.addEventListener("submit", handleCheckoutSubmit);
});

