const productPageDetailForm = document.querySelector("#product-page-detail-form");
const relatedProducts = document.querySelector("#related-products");
const relatedProductsCarousel = document.querySelector("#related-products-carousel");

function handleAddToCart(event, item = null) {
	event.preventDefault();
	const formData = new FormData(productPageDetailForm);
	const data = JSON.parse(productPageDetailForm.dataset.product);
	const product = {
		id: item ? item.id : String(data.id),
		image: item ? item.image : data.image,
		price: item ? item.price : data.price,
		quantity: item ? 1 : Number(formData.get("quantity")),
	};
	addToShoppingCart(product);
	toggleShowShoppingCart();
	renderShoppingCartItems();
	renderTotalShoppingCart();
	renderTotalCartItemsOnMenuButton();
	renderCompleteOrderButton();
}

function createRelatedProductsCart(products) {
	const swiper = document.createElement("div");
	swiper.classList.add("swiper", "related-products-swipper");
	const swipperWrapper = document.createElement("div");
	swipperWrapper.classList.add("swiper-wrapper");
	for (let idx = 0; idx < products.length; idx++) {
		const swipperSlide = document.createElement("div");
		swipperSlide.classList.add("swiper-slide");
		const swipperCard = document.createElement("div");
		swipperCard.classList.add("related-products-swipper__Card");
		const swipperImage = document.createElement("img");
		swipperImage.classList.add("related-products-swipper__image");
		swipperImage.src = products[idx].image;
		swipperImage.alt = "";
		swipperImage.width = 248;
		swipperImage.height = 480;
		const swipperPrice = document.createElement("span");
		swipperPrice.classList.add("related-products-swipper__price");
		swipperPrice.textContent = formatPriceValue(Number(products[idx].price));
		const swipperButton = document.createElement("button");
		swipperButton.classList.add("related-products-swipper__add-to-cart");
		swipperButton.type = "button";
		swipperButton.textContent = "Agregar al Carro";
		swipperButton.addEventListener("click", (event) => handleAddToCart(event, products[idx]));

		swipperCard.appendChild(swipperImage);
		swipperCard.appendChild(swipperPrice);
		swipperCard.appendChild(swipperButton);
		swipperSlide.appendChild(swipperCard);
		swipperWrapper.appendChild(swipperSlide);
	}
	swiper.appendChild(swipperWrapper);
	return swiper;
}

function initSwipper() {
	// const swipper = document.querySelector(".related-products-swipper");
	new Swiper(".related-products-swipper", {
		slidesPerView: 3,
		spaceBetween: 10,
		pagination: false,
	});
}

function renderRelatedProducts() {
	const relatedProductsData = JSON.parse(relatedProducts.dataset.related);
	console.log("render_related_products", relatedProductsData);
	const relatedProductsCarousel = document.querySelector("#related-products-carousel");
	const carousel = createRelatedProductsCart(relatedProductsData);

	relatedProductsCarousel.appendChild(carousel);
}

productPageDetailForm.addEventListener("submit", handleAddToCart);

renderRelatedProducts();
initSwipper();
