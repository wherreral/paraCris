const searchButton = document.querySelector("#search-button");
// const cancelButton = document.querySelector("#cancel");
const searchResults = document.querySelector("#search-results");
const searchDialog = document.querySelector("#search-dialog");
const searchInput = document.querySelector("#search-input");

// Update button opens a modal dialog
searchButton.addEventListener("click", function () {

  searchDialog.showModal();
});

// Form cancel button closes the dialog box
// cancelButton.addEventListener("click", function () {
//   searchDialog.close();
// });

searchInput.addEventListener('input', async (event) => {
  const search = event.target.value;
  if (search.length >= 3) {
    try {
      const response = await fetch(`/search?search=${search}`);
      const results = await response.json();
      displaySearchResults(results);
    } catch (error) {
      console.log('error', error);
    }
  } else {
      displaySearchResults({
        result: false,
        items: [],
        message: '',
      });
      searchResults.classList.remove('search__dialog--results--show');
  }
});

function displaySearchResults(data) {
  console.log('data=', data);
  searchResults.innerHTML = '';

  if (data.result) {
    searchResults.classList.add('search__dialog--results--show');

    for (let idx = 0; idx < data.items.length; idx++) {
      const product = data.items[idx];
      const item = document.createElement('button');
      item.type = 'button';
      item.classList.add('search__dialog--results__item');
      item.addEventListener('click', () => {
        window.location.href = `/product/${product.id}`;
      });

      const header = document.createElement('header');
      header.classList.add('search__dialog--results__item--header');

      const image = document.createElement('img');
      image.classList.add("search__dialog--results__item--image");
      image.src = product.image;
      image.alt = product.descr;
      image.width = 60;
      image.height = 60;

      const content = document.createElement('div');
      content.classList.add("search__dialog--results__item--content");

      const title = document.createElement('h4');
      title.textContent = product.name;
      const description = document.createElement('p');
      description.textContent = product.descr;

      content.appendChild(title);
      content.appendChild(description);

      header.appendChild(image);
      header.appendChild(content);

      const action = document.createElement('footer');
      action.classList.add("search__dialog--results__item--action");

      const price = document.createElement('h5');
      price.textContent = formatPriceValue(Number(product.price));
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Lo Quiero';
      button.addEventListener("click", () => {
        addToShoppingCart({
          id: String(product.id),
          image: product.image,
          price: String(product.price),
          quantity: 1,
        });
      });

      action.appendChild(price);
      action.appendChild(button);

      item.appendChild(header);
      item.appendChild(action);

      searchResults.appendChild(item);
    }
  } else {
    const emptyText = document.createElement('span');
    emptyText.textContent = data.message;
    searchResults.classList.add('search__dialog--results--show');
    searchResults.appendChild(emptyText);
  }
}
