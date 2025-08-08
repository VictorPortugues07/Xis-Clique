document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("productList");
  const bannerContainer = document.getElementById("bannerContainer");
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const toastFeedback = new bootstrap.Toast(
    document.getElementById("toastFeedback")
  );

  // Modal de produto
  const modalProductName = document.getElementById("modalProductName");
  const modalProductImage = document.getElementById("modalProductImage");
  const modalProductDescription = document.getElementById(
    "modalProductDescription"
  );
  const modalProductPrice = document.getElementById("modalProductPrice");
  const addToCartBtn = document.getElementById("addToCartBtn");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let products = [];
  let selectedProduct = null;

  // Carrega produtos do JSON
  fetch("produtos.json")
    .then((res) => res.json())
    .then((data) => {
      products = data;
      renderProducts(products);
      renderBanner(products);
    })
    .catch((err) => console.error("Erro ao carregar produtos:", err));

  // Renderiza cards de produtos
  function renderProducts(list) {
    productList.innerHTML = "";
    list.forEach((prod) => {
      let col = document.createElement("div");
      col.className = "col-md-3 mb-4";
      col.innerHTML = `
                <div class="card product-card" data-id="${prod.id}">
                    <img src="${prod.img}" class="card-img-top" alt="${
        prod.name
      }">
                    <div class="card-body">
                        <h5 class="card-title">${prod.name}</h5>
                        <p class="card-text">R$ ${prod.price.toFixed(2)}</p>
                        <button class="btn btn-primary add-to-cart">Adicionar</button>
                    </div>
                </div>
            `;
      productList.appendChild(col);
    });

    // Eventos de clique nos cards
    document
      .querySelectorAll(".product-card img, .product-card .card-title")
      .forEach((el) => {
        el.addEventListener("click", (e) => {
          const id = e.target.closest(".product-card").dataset.id;
          openProductModal(id);
        });
      });

    // Eventos "Adicionar" nos cards
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest(".product-card").dataset.id;
        const product = products.find((p) => p.id == id);
        addToCart(product);
      });
    });
  }

  // Renderiza banner
  function renderBanner(list) {
    bannerContainer.innerHTML = "";
    list.slice(0, 5).forEach((prod, index) => {
      let div = document.createElement("div");
      div.className = `carousel-item ${index === 0 ? "active" : ""}`;
      div.innerHTML = `<img src="${prod.img}" class="d-block w-100 banner-img" alt="${prod.name}" data-id="${prod.id}">`;
      bannerContainer.appendChild(div);
    });

    // Clique no banner abre modal
    document.querySelectorAll(".banner-img").forEach((img) => {
      img.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        openProductModal(id);
      });
    });
  }

  // Abre modal do produto
  function openProductModal(id) {
    const product = products.find((p) => p.id == id);
    selectedProduct = product;
    modalProductName.textContent = product.name;
    modalProductImage.src = product.img;
    modalProductDescription.textContent = product.description;
    modalProductPrice.textContent = `R$ ${product.price.toFixed(2)}`;
    const modal = new bootstrap.Modal(document.getElementById("productModal"));
    modal.show();
  }

  // Evento "Adicionar" no modal
  addToCartBtn.addEventListener("click", () => {
    if (selectedProduct) {
      addToCart(selectedProduct);
    }
  });

  // Atualiza UI do carrinho
  function updateCartUI() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    cartItems.innerHTML = "";
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.qty;
      let li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.textContent = `${item.name} x${item.qty}`;
      cartItems.appendChild(li);
    });
    cartTotal.textContent = total.toFixed(2);
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Adiciona item ao carrinho
  function addToCart(product) {
    let existing = cart.find((p) => p.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
    toastFeedback.show();
  }

  // Limpa carrinho
  document.getElementById("clearCartBtn").addEventListener("click", () => {
    cart = [];
    updateCartUI();
  });

  // Busca produtos
  document.getElementById("searchInput").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(term)
    );
    renderProducts(filtered);
  });

  // Inicializa interface
  updateCartUI();
});
