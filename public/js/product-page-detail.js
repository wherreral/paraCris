const reviewsWrapper = document.querySelector("#product-detail-page-reviews");
const reviewsRatingStars = document.querySelector("#reviews-rating-stars");
const reviewsRatingLength = document.querySelector("#reviews-rating-length");
const productPageDetailForm = document.querySelector("#product-page-detail-form");
const relatedProducts = document.querySelector("#related-products");
const relatedProductsCarousel = document.querySelector("#related-products-carousel");

function getAvgRating(reviews) {
	const total = reviews.reduce((acc, rating) => acc + rating, 0);
	const average = total / reviews.length;
	return average.toFixed(1);
}

function renderReviewsComponent() {
	const reviews = [5, 5, 5, 5, 5];
	const reviewLink = document.createElement("button");

	reviewsRatingStars.innerHTML = "";

	for (let idx = 0; idx < 5; idx++) {
		const star = document.createElement("i");
		star.classList.add("fa", "fa-star");
		if (idx < Math.round(getAvgRating(reviews))) {
			star.classList.add("filled-star");
		}
		reviewsRatingStars.appendChild(star);
	}

	reviewLink.type = "button";
	reviewLink.textContent = `(${getAvgRating(reviews)}/5.0)`;
	reviewLink.addEventListener("click", () => {
		console.log("open review modal");
	});
	reviewsRatingLength.appendChild(reviewLink);
}

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
	const swiperNextButton = document.createElement("div");
	swiperNextButton.classList.add("swiper-button-next");
	const swiperPreviousButton = document.createElement("div");
	swiperPreviousButton.classList.add("swiper-button-prev");
	const swipperWrapper = document.createElement("div");
	swipperWrapper.classList.add("swiper-wrapper");
	for (let idx = 0; idx < products.length; idx++) {
		const link = document.createElement("a");
		link.href = `${window.location.origin}/product/${products[idx].id}`;
		const swipperSlide = document.createElement("div");
		swipperSlide.classList.add("swiper-slide");
		const card = document.createElement("div");
		card.classList.add("related-products-swipper__card");
		const image = document.createElement("img");
		image.classList.add("related-products-swipper__image");
		image.src = products[idx].image;
		image.alt = "";
		image.width = 248;
		image.height = 480;
		const title = document.createElement("h4");
		title.classList.add("related-products-swipper__title");
		title.textContent = products[idx].name;
		const price = document.createElement("span");
		price.classList.add("related-products-swipper__price");
		price.textContent = formatPriceValue(Number(products[idx].price));
		const button = document.createElement("button");
		button.classList.add("related-products-swipper__add-to-cart");
		button.type = "button";
		button.textContent = "Agregar al Carro";
		button.addEventListener("click", (event) => {
			handleAddToCart(event, products[idx])
		});

		card.appendChild(image);
		card.appendChild(title);
		card.appendChild(price);
		card.appendChild(button);
		link.appendChild(card);
		swipperSlide.appendChild(link);
		swipperWrapper.appendChild(swipperSlide);
	}
	swiper.appendChild(swipperWrapper);
	swiper.appendChild(swiperNextButton);
	swiper.appendChild(swiperPreviousButton);

	return swiper;
}

function initSwipper() {
	// const swipper = document.querySelector(".related-products-swipper");
	new Swiper(".related-products-swipper", {
		slidesPerView: 2,
		spaceBetween: 10,
		navigation: {
			// nextEl: ".related-products-swiper__button-next",
			// prevEl: ".related-products-swiper__button-prev",
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev",
		},
		pagination: false,
		breakpoints: {
			640: {
				slidesPerView: 2,
				spaceBetween: 10,
			},
			768: {
				slidesPerView: 4,
				spaceBetween: 20,
			},
			1024: {
				slidesPerView: 4,
				spaceBetween: 20,
			},
		},
	});
}

function renderRelatedProducts() {
	const relatedProductsMainTitle = document.createElement("h2");
	relatedProductsMainTitle.classList.add("related-products-swipper__main-title");
	relatedProductsMainTitle.textContent = "Productos Recomendados";

	const relatedProductsData = JSON.parse(relatedProducts.dataset.related);
	const relatedProductsCarousel = document.querySelector("#related-products-carousel");
	const carousel = createRelatedProductsCart(relatedProductsData);

	relatedProductsCarousel.appendChild(relatedProductsMainTitle);
	relatedProductsCarousel.appendChild(carousel);
}

productPageDetailForm.addEventListener("submit", handleAddToCart);

renderRelatedProducts();
renderReviewsComponent();
initSwipper();
