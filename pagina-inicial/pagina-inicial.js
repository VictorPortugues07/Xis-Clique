document.addEventListener("DOMContentLoaded", () => {
  // Elementos DOM
  const productGrid = document.getElementById("productGrid");
  const bannerContainer = document.getElementById("bannerContainer");
  const bannerIndicators = document.getElementById("bannerIndicators");
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartEmpty = document.getElementById("cartEmpty");
  const searchInput = document.getElementById("searchInput");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const navbar = document.getElementById("mainNavbar");

  // Modal elements
  const modalProductName = document.getElementById("modalProductName");
  const modalProductImage = document.getElementById("modalProductImage");
  const modalProductDescription = document.getElementById(
    "modalProductDescription"
  );
  const modalProductPrice = document.getElementById("modalProductPrice");
  const modalQuantity = document.getElementById("modalQuantity");
  const addToCartBtn = document.getElementById("addToCartBtn");
  const increaseQtyBtn = document.getElementById("increaseQty");
  const decreaseQtyBtn = document.getElementById("decreaseQty");

  // Toast
  const toastElement = document.getElementById("toastSuccess");
  const toastMessage = toastElement.querySelector(".toast-message");

  // State variables
  let cart = [];
  let products = [];
  let selectedProduct = null;
  let currentQuantity = 1;
  let currentFilter = "all";

  // Categorias de produtos
  const categories = {
    lanches: [
      "hambúrguer",
      "cheeseburger",
      "bacon",
      "cachorro-quente",
      "x-bacon",
      "pizza",
      "pastel",
      "wrap",
    ],
    bebidas: ["refrigerante", "suco", "milkshake"],
    doces: ["açaí", "brownie", "bolo", "churros"],
    saudaveis: ["salada", "wrap vegetariano"],
  };

  // Initialize app
  init();

  async function init() {
    showLoading();
    await loadProducts();
    setupEventListeners();
    updateCartUI();
    setupScrollEffects();
    hideLoading();
  }

  // Loading functions
  function showLoading() {
    loadingOverlay.classList.remove("hidden");
  }

  function hideLoading() {
    setTimeout(() => {
      loadingOverlay.classList.add("hidden");
    }, 800);
  }

  // Load products from JSON
  async function loadProducts() {
    try {
      const response = await fetch("produtos.json");
      if (!response.ok) throw new Error("Falha ao carregar produtos");

      products = await response.json();
      renderProducts(products);
      renderBanner(products);
      animateProductCards();
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      showToast("Erro ao carregar produtos", "error");
    }
  }

  // Render product cards
  function renderProducts(productList) {
    productGrid.innerHTML = "";

    productList.forEach((product, index) => {
      const col = document.createElement("div");
      col.className = "col-lg-3 col-md-4 col-sm-6 mb-4";

      col.innerHTML = `
                <div class="product-card" data-id="${
                  product.id
                }" style="animation-delay: ${index * 0.1}s">
                    <div class="product-image-container">
                        <img src="${product.img}" alt="${
        product.name
      }" loading="lazy">
                        <div class="product-price-badge">R$ ${product.price.toFixed(
                          2
                        )}</div>
                    </div>
                    <div class="product-card-body">
                        <h5 class="product-card-title">${product.name}</h5>
                        <p class="product-card-description">${
                          product.description
                        }</p>
                        <button class="btn btn-add-to-cart" data-id="${
                          product.id
                        }">
                            <i class="fas fa-plus me-2"></i>Adicionar
                        </button>
                    </div>
                </div>
            `;

      productGrid.appendChild(col);
    });

    setupProductCardEvents();
  }

  // Setup product card events
  function setupProductCardEvents() {
    // Click on card image/title to open modal
    document
      .querySelectorAll(".product-card img, .product-card-title")
      .forEach((element) => {
        element.addEventListener("click", (e) => {
          const productId = e.target.closest(".product-card").dataset.id;
          openProductModal(productId);
        });
      });

    // Add to cart buttons
    document.querySelectorAll(".btn-add-to-cart").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const productId = e.target.closest(".product-card").dataset.id;
        const product = products.find((p) => p.id == productId);
        addToCart(product, 1);
      });
    });
  }

  // Render banner carousel
  function renderBanner(productList) {
    bannerContainer.innerHTML = "";
    bannerIndicators.innerHTML = "";

    const featuredProducts = productList.slice(0, 5);

    featuredProducts.forEach((product, index) => {
      // Carousel item
      const carouselItem = document.createElement("div");
      carouselItem.className = `carousel-item ${index === 0 ? "active" : ""}`;
      carouselItem.innerHTML = `
                <img src="${product.img}" alt="${product.name}" data-id="${product.id}" style="cursor: pointer;">
            `;
      bannerContainer.appendChild(carouselItem);

      // Indicator
      const indicator = document.createElement("button");
      indicator.type = "button";
      indicator.setAttribute("data-bs-target", "#bannerCarousel");
      indicator.setAttribute("data-bs-slide-to", index);
      indicator.className = index === 0 ? "active" : "";
      indicator.setAttribute("aria-current", index === 0 ? "true" : "false");
      indicator.setAttribute("aria-label", `Slide ${index + 1}`);
      bannerIndicators.appendChild(indicator);
    });

    // Banner click events
    document.querySelectorAll("#bannerCarousel img").forEach((img) => {
      img.addEventListener("click", (e) => {
        const productId = e.target.dataset.id;
        openProductModal(productId);
      });
    });
  }

  // Open product modal
  function openProductModal(productId) {
    const product = products.find((p) => p.id == productId);
    if (!product) return;

    selectedProduct = product;
    currentQuantity = 1;

    modalProductName.textContent = product.name;
    modalProductImage.src = product.img;
    modalProductDescription.textContent = product.description;
    modalProductPrice.textContent = `R$ ${product.price.toFixed(2)}`;
    modalQuantity.textContent = currentQuantity;

    const modal = new bootstrap.Modal(document.getElementById("productModal"));
    modal.show();
  }

  // Category filtering
  function setupCategoryFilters() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category = e.target.dataset.category;
        setActiveFilter(e.target);
        filterProducts(category);
      });
    });
  }

  function setActiveFilter(activeBtn) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    activeBtn.classList.add("active");
  }

  function filterProducts(category) {
    currentFilter = category;
    let filteredProducts = products;

    if (category !== "all") {
      filteredProducts = products.filter((product) => {
        const productName = product.name.toLowerCase();
        return categories[category]?.some((keyword) =>
          productName.includes(keyword.toLowerCase())
        );
      });
    }

    renderProducts(filteredProducts);
    animateProductCards();
  }

  // Search functionality
  function setupSearch() {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase().trim();
        searchProducts(searchTerm);
      }, 300);
    });
  }

  function searchProducts(searchTerm) {
    let filteredProducts = products;

    if (searchTerm) {
      filteredProducts = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter if active
    if (currentFilter !== "all") {
      filteredProducts = filteredProducts.filter((product) => {
        const productName = product.name.toLowerCase();
        return categories[currentFilter]?.some((keyword) =>
          productName.includes(keyword.toLowerCase())
        );
      });
    }

    renderProducts(filteredProducts);
    animateProductCards();
  }

  // Cart functions
  function addToCart(product, quantity = 1) {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.qty += quantity;
    } else {
      cart.push({ ...product, qty: quantity });
    }

    updateCartUI();
    showToast(`${product.name} adicionado ao carrinho!`, "success");
    animateCartIcon();

    // Close modal if open
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("productModal")
    );
    if (modal) modal.hide();
  }

  function removeFromCart(productId) {
    cart = cart.filter((item) => item.id != productId);
    updateCartUI();
    showToast("Item removido do carrinho", "success");
  }

  function updateCartQuantity(productId, newQuantity) {
    const item = cart.find((item) => item.id == productId);
    if (item) {
      if (newQuantity <= 0) {
        removeFromCart(productId);
      } else {
        item.qty = newQuantity;
        updateCartUI();
      }
    }
  }

  function clearCart() {
    cart = [];
    updateCartUI();
    showToast("Carrinho limpo", "success");
  }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    cartCount.textContent = totalItems;
    cartTotal.textContent = totalPrice.toFixed(2);

    if (cart.length === 0) {
      cartItems.style.display = "none";
      cartEmpty.style.display = "block";
    } else {
      cartItems.style.display = "block";
      cartEmpty.style.display = "none";
      renderCartItems();
    }

    // Update cart badge visibility
    const cartBadge = document.querySelector(".cart-badge");
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }

  function renderCartItems() {
    cartItems.innerHTML = "";

    cart.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item d-flex align-items-center";
      cartItem.innerHTML = `
                <img src="${item.img}" alt="${
        item.name
      }" class="cart-item-image me-3">
                <div class="cart-item-info flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="cart-item-price">R$ ${(
                          item.price * item.qty
                        ).toFixed(2)}</span>
                        <div class="cart-item-controls">
                            <button class="btn btn-sm btn-outline-primary" onclick="updateCartQuantity(${
                              item.id
                            }, ${item.qty - 1})">-</button>
                            <span class="mx-2">${item.qty}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="updateCartQuantity(${
                              item.id
                            }, ${item.qty + 1})">+</button>
                            <button class="btn btn-sm btn-remove-item ms-2" onclick="removeFromCart(${
                              item.id
                            })">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
      cartItems.appendChild(cartItem);
    });
  }

  // Modal quantity controls
  function setupQuantityControls() {
    increaseQtyBtn.addEventListener("click", () => {
      currentQuantity++;
      modalQuantity.textContent = currentQuantity;
    });

    decreaseQtyBtn.addEventListener("click", () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        modalQuantity.textContent = currentQuantity;
      }
    });

    addToCartBtn.addEventListener("click", () => {
      if (selectedProduct) {
        addToCart(selectedProduct, currentQuantity);
      }
    });
  }

  // Toast notifications
  function showToast(message, type = "success") {
    toastMessage.textContent = message;

    // Update toast styling based on type
    toastElement.className = `toast toast-${type}`;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  // Animations
  function animateProductCards() {
    const cards = document.querySelectorAll(".product-card");
    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(30px)";
      card.style.animationDelay = `${index * 0.1}s`;

      setTimeout(() => {
        card.classList.add("fade-in");
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);
    });
  }

  function animateCartIcon() {
    const cartBtn = document.querySelector(".btn-cart");
    cartBtn.style.animation = "none";
    cartBtn.offsetHeight; // Trigger reflow
    cartBtn.style.animation = "cartPulse 0.6s ease-out";

    setTimeout(() => {
      cartBtn.style.animation = "";
    }, 600);
  }

  // Scroll effects
  function setupScrollEffects() {
    let lastScrollTop = 0;

    window.addEventListener("scroll", () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Navbar scroll effect
      if (scrollTop > 100) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }

      // Scroll to top button
      if (scrollTop > 300) {
        scrollTopBtn.classList.add("show");
      } else {
        scrollTopBtn.classList.remove("show");
      }

      lastScrollTop = scrollTop;
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Smooth scroll to products
  window.scrollToProducts = function () {
    document.getElementById("productsSection").scrollIntoView({
      behavior: "smooth",
    });
  };

  // Event listeners setup
  function setupEventListeners() {
    setupCategoryFilters();
    setupSearch();
    setupQuantityControls();

    // Clear cart button
    document.getElementById("clearCartBtn").addEventListener("click", () => {
      if (confirm("Tem certeza que deseja limpar o carrinho?")) {
        clearCart();
        bootstrap.Modal.getInstance(
          document.getElementById("cartModal")
        ).hide();
      }
    });

    // Checkout button
    document.getElementById("checkoutBtn").addEventListener("click", () => {
      if (cart.length === 0) {
        showToast("Adicione itens ao carrinho primeiro", "warning");
        return;
      }

      // Simulate checkout process
      showToast("Redirecionando para pagamento...", "success");
      setTimeout(() => {
        alert(
          "Pedido finalizado com sucesso! Em breve você receberá a confirmação."
        );
        clearCart();
        bootstrap.Modal.getInstance(
          document.getElementById("cartModal")
        ).hide();
      }, 1500);
    });
  }

  // Global functions for cart operations (needed for onclick handlers)
  window.updateCartQuantity = updateCartQuantity;
  window.removeFromCart = removeFromCart;

  // Performance optimizations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "50px",
  };

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          imageObserver.unobserve(img);
        }
      }
    });
  }, observerOptions);

  // Observe lazy loading images
  document.addEventListener("DOMContentLoaded", () => {
    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => imageObserver.observe(img));
  });

  // Preload critical images
  function preloadImages() {
    const criticalImages = products.slice(0, 8).map((product) => product.img);
    criticalImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  // Service Worker registration (for future PWA features)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
});
