const PRODUCTS = window.PRODUCTS || [];
const CART_STORAGE_KEY = "ghori-cart";
const PRODUCT_STORAGE_KEY = "ghori-selected-product";

function getProductById(productId) {
    return PRODUCTS.find(function(product) {
        return product.id === productId;
    }) || PRODUCTS[0];
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
}

function formatCurrency(amount) {
    return amount.toLocaleString("en-IN");
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce(function(total, item) {
        return total + item.quantity;
    }, 0);
    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = count;
    }
}

function searchProducts() {
    const searchField = document.getElementById("product-search");

    if (!searchField) {
        return;
    }

    const searchText = searchField.value.trim().toLowerCase();
    const products = document.querySelectorAll(".product-card");
    const noResults = document.getElementById("no-results");
    let visibleCount = 0;

    products.forEach(function(productCard) {
        const productName = (productCard.dataset.name || "").toLowerCase();
        const matches = !searchText || productName.includes(searchText);

        productCard.hidden = !matches;

        if (matches) {
            visibleCount += 1;
        }
    });

    if (noResults) {
        noResults.hidden = visibleCount !== 0;
    }
}

function addToCartById(productId) {
    const product = getProductById(productId);

    if (!product) {
        return;
    }

    addItemToCart(product);
}

function addItemToCart(product, size) {
    const cart = getCart();
    const existingProduct = cart.find(function(item) {
        return item.id === product.id && item.size === (size || "");
    });

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            size: size || "",
            quantity: 1
        });
    }

    saveCart(cart);
    alert(product.name + " added to cart.");
}

function renderCartItem(item, index) {
    const sizeLabel = item.size ? "<p>Size: " + item.size + "</p>" : "";
    const itemTotal = item.price * item.quantity;

    return `
        <article class="cart-item">
            <div class="cart-item-copy">
                <h3>${item.name}</h3>
                <p>Price: Rs. ${formatCurrency(item.price)}</p>
                ${sizeLabel}
                <p>Item total: Rs. ${formatCurrency(itemTotal)}</p>
            </div>
            <div class="cart-item-controls">
                <button type="button" onclick="decreaseQuantity(${index})">-</button>
                <span>${item.quantity}</span>
                <button type="button" onclick="increaseQuantity(${index})">+</button>
                <button type="button" class="danger-button" onclick="removeFromCart(${index})">Remove</button>
            </div>
        </article>
    `;
}

function displayCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const emptyCartMessage = document.getElementById("empty-cart-message");
    const checkoutPanel = document.getElementById("checkout-panel");

    if (!cartItems || !cartTotal) {
        return;
    }

    const cart = getCart();
    const total = cart.reduce(function(sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    cartItems.innerHTML = cart.map(renderCartItem).join("");
    cartTotal.textContent = formatCurrency(total);

    if (emptyCartMessage) {
        emptyCartMessage.hidden = cart.length !== 0;
    }

    if (checkoutPanel && cart.length === 0) {
        checkoutPanel.hidden = true;
    }
}

function increaseQuantity(index) {
    const cart = getCart();

    if (!cart[index]) {
        return;
    }

    cart[index].quantity += 1;
    saveCart(cart);
    displayCart();
}

function decreaseQuantity(index) {
    const cart = getCart();

    if (!cart[index]) {
        return;
    }

    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }

    saveCart(cart);
    displayCart();
}

function removeFromCart(index) {
    const cart = getCart();

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
}

function viewProductById(productId) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, productId);
    window.location.href = "product-details.html";
}

function populateProductDetails() {
    if (document.body.dataset.page !== "details") {
        return;
    }

    const productId = localStorage.getItem(PRODUCT_STORAGE_KEY) || (PRODUCTS[0] && PRODUCTS[0].id);
    const product = getProductById(productId);

    if (!product) {
        return;
    }

    const nameElement = document.getElementById("product-name");
    const priceElement = document.getElementById("product-price");
    const descriptionElement = document.getElementById("product-description");
    const categoryElement = document.getElementById("product-category");
    const visualElement = document.getElementById("product-visual");
    const sizePicker = document.getElementById("size-picker");
    const sizeOptions = sizePicker ? sizePicker.querySelector(".size-options") : null;

    if (nameElement) {
        nameElement.textContent = product.name;
    }

    if (priceElement) {
        priceElement.textContent = formatCurrency(product.price);
    }

    if (descriptionElement) {
        descriptionElement.textContent = product.description;
    }

    if (categoryElement) {
        categoryElement.textContent = product.category;
    }

    if (visualElement) {
        visualElement.textContent = product.visual;
    }

    if (sizePicker && sizeOptions) {
        if (product.sizes.length === 0) {
            sizePicker.hidden = true;
        } else {
            sizePicker.hidden = false;
            sizeOptions.innerHTML = product.sizes.map(function(size) {
                return '<button class="size-button" type="button" onclick="selectSize(this)">' + size + "</button>";
            }).join("");
        }
    }
}

function selectSize(button) {
    document.querySelectorAll(".size-button").forEach(function(sizeButton) {
        sizeButton.classList.remove("selected");
    });

    button.classList.add("selected");
}

function addSelectedProductToCart() {
    const productId = localStorage.getItem(PRODUCT_STORAGE_KEY) || (PRODUCTS[0] && PRODUCTS[0].id);
    const product = getProductById(productId);
    let selectedSize = "";

    if (!product) {
        return;
    }

    if (product.sizes.length > 0) {
        const selectedButton = document.querySelector(".size-button.selected");

        if (!selectedButton) {
            alert("Please select a size.");
            return;
        }

        selectedSize = selectedButton.textContent;
    }

    addItemToCart(product, selectedSize);
}

function toggleCheckoutForm() {
    const checkoutPanel = document.getElementById("checkout-panel");
    const orderConfirmation = document.getElementById("order-confirmation");
    const checkoutMessage = document.getElementById("checkout-message");

    if (!checkoutPanel) {
        return;
    }

    if (getCart().length === 0) {
        alert("Your cart is empty.");
        return;
    }

    checkoutPanel.hidden = !checkoutPanel.hidden;

    if (orderConfirmation) {
        orderConfirmation.hidden = true;
    }

    if (checkoutMessage) {
        checkoutMessage.textContent = "";
    }
}

function buildOrderSummary(cart, customerName, paymentMethod) {
    const totalItems = cart.reduce(function(sum, item) {
        return sum + item.quantity;
    }, 0);
    const totalAmount = cart.reduce(function(sum, item) {
        return sum + (item.quantity * item.price);
    }, 0);

    return customerName + ", your order for " + totalItems + " item(s) has been placed. Payment method: " + paymentMethod + ". Total: Rs. " + formatCurrency(totalAmount) + ".";
}

function handleCheckoutSubmit(event) {
    event.preventDefault();

    const cart = getCart();
    const checkoutMessage = document.getElementById("checkout-message");
    const orderConfirmation = document.getElementById("order-confirmation");
    const orderSummary = document.getElementById("order-summary");
    const checkoutPanel = document.getElementById("checkout-panel");
    const form = event.target;
    const customerName = document.getElementById("customer-name").value.trim();
    const customerEmail = document.getElementById("customer-email").value.trim();
    const customerPhone = document.getElementById("customer-phone").value.trim();
    const customerAddress = document.getElementById("customer-address").value.trim();
    const paymentMethod = document.getElementById("payment-method").value;

    if (cart.length === 0) {
        if (checkoutMessage) {
            checkoutMessage.textContent = "Add items to your cart before checkout.";
        }
        return;
    }

    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !paymentMethod) {
        if (checkoutMessage) {
            checkoutMessage.textContent = "Complete all checkout fields before placing the order.";
        }
        return;
    }

    if (!/^\d{10}$/.test(customerPhone)) {
        if (checkoutMessage) {
            checkoutMessage.textContent = "Enter a valid 10-digit phone number.";
        }
        return;
    }

    if (checkoutMessage) {
        checkoutMessage.textContent = "";
    }

    if (orderConfirmation && orderSummary) {
        orderSummary.textContent = buildOrderSummary(cart, customerName, paymentMethod);
        orderConfirmation.hidden = false;
    }

    if (checkoutPanel) {
        checkoutPanel.hidden = true;
    }

    saveCart([]);
    displayCart();
    form.reset();
}

function bindCheckoutForm() {
    const checkoutForm = document.getElementById("checkout-form");

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", handleCheckoutSubmit);
    }
}

function goHome() {
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function() {
    updateCartCount();
    populateProductDetails();
    displayCart();
    bindCheckoutForm();
});
