let cartCount = 0;
function searchProducts() {
    let searchText = document.getElementById('product-search').value.toLowerCase();

    let products = document.querySelectorAll('.product-card');
    let found = false;

    products.forEach(function(product) {
        let productName = product.innerText.toLowerCase();

        if (productName.includes(searchText)) {
            product.style.display = "";
            found = true;
        } else {
            product.style.display = "none";
        }
    });

    let noResults = document.getElementById('no-results');

    if (noResults) {
        noResults.style.display = found ? "none" : "block";
    }

}
function addToCart(productName, productPrice) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existingProduct = cart.find(function(product) {
        return product.name === productName;
    });

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    cartCount = cart.reduce(function(total, product) {
        return total + product.quantity;
    }, 0);

    let cartElement = document.getElementById("cart");

    if (cartElement) {
        cartElement.textContent = "🛒 Cart (" + cartCount + ")";
    }

    alert(productName + " added to cart!");
}
function displayCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let cartItems = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");

    if (!cartItems || !cartTotal) {
        return;
    }

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(function(product, index) {
        let itemTotal = product.price * product.quantity;
        total += itemTotal;

        cartItems.innerHTML += `
            <div class="cart-item">
                <h3>${product.name}</h3>
                <p>Price: ₹${product.price}</p>

                <button onclick="decreaseQuantity(${index})">−</button>

                <span> ${product.quantity} </span>

                <button onclick="increaseQuantity(${index})">+</button>

                <p>Item Total: ₹${itemTotal}</p>

                <button onclick="removeFromCart(${index})">
                    Remove
                </button>

                <hr>
            </div>
        `;
    });

    cartTotal.textContent = total;
}


function increaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart[index].quantity++;

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}


function decreaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}


function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}


function goHome() {
    window.location.href = "index.html";
}


function checkout() {
    alert("Checkout page coming next!");
}


displayCart();
function viewProduct(productName, productPrice) {
    window.location.href = "product-details.html";
}
function selectSize(button) {
    document.querySelectorAll('size.button').forEach(function(btn) {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');

}