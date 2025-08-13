// Estado da aplicação
let appState = {
  isLoggedIn: false,
  currentUser: null,
  currentCategory: "all",
  searchTerm: "",
  cart: [],
  products: [],
  categories: [],
};

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  bindEvents();
});

function initializeApp() {
  // Carrega carrinho do localStorage, se existir
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    appState.cart = JSON.parse(savedCart);
  }
  loadData();
  checkLoginStatus();
}

// Carregar dados do JSON
async function loadData() {
  try {
    const response = await fetch("./elementos.json");
    const data = await response.json();

    appState.products = data.products;
    appState.categories = data.categories;

    renderCategories();
    renderProducts();
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
}

// Verificar status de login
function checkLoginStatus() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    appState.currentUser = JSON.parse(savedUser);
    appState.isLoggedIn = true;
    showMainContent();
  } else {
    showLoginScreen();
  }
}

// Eventos
function bindEvents() {
  // Tabs de login
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tab = this.dataset.tab;
      switchTab(tab);
    });
  });

  // Busca de produtos
  document.getElementById("searchInput").addEventListener("input", function () {
    appState.searchTerm = this.value.toLowerCase();
    renderProducts();
  });

  // Máscara para CPF
  const cpfInputs = document.querySelectorAll("#loginCpf, #registerCpf");
  cpfInputs.forEach((input) => {
    input.addEventListener("input", maskCPF);
  });

  // Máscara para telefone
  document.getElementById("registerPhone").addEventListener("input", maskPhone);
}

// Login e Cadastro
function switchTab(tab) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".login-form")
    .forEach((form) => form.classList.remove("active"));

  document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
  document.getElementById(`${tab}Form`).classList.add("active");
}

function handleLogin(event) {
  event.preventDefault();

  const cpf = document.getElementById("loginCpf").value;
  const password = document.getElementById("loginPassword").value;

  // Buscar usuário no localStorage
  const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
  const user = savedUsers.find((u) => u.cpf === cpf && u.password === password);

  if (user) {
    appState.currentUser = user;
    appState.isLoggedIn = true;
    localStorage.setItem("currentUser", JSON.stringify(user));
    showMainContent();
  } else {
    alert("CPF ou senha incorretos!");
  }
}

function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById("registerName").value;
  const cpf = document.getElementById("registerCpf").value;
  const phone = document.getElementById("registerPhone").value;
  const password = document.getElementById("registerPassword").value;

  // Validar CPF
  if (!isValidCPF(cpf)) {
    alert("CPF inválido!");
    return;
  }

  // Verificar se CPF já existe
  const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
  if (savedUsers.find((u) => u.cpf === cpf)) {
    alert("CPF já cadastrado!");
    return;
  }

  // Criar novo usuário
  const newUser = { name, cpf, phone, password };
  savedUsers.push(newUser);
  localStorage.setItem("users", JSON.stringify(savedUsers));

  // Fazer login automaticamente
  appState.currentUser = newUser;
  appState.isLoggedIn = true;
  localStorage.setItem("currentUser", JSON.stringify(newUser));
  showMainContent();
}

function logout() {
  appState.isLoggedIn = false;
  appState.currentUser = null;
  appState.cart = [];
  localStorage.removeItem("currentUser");
  showLoginScreen();
}

// Interface
function showLoginScreen() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("mainContent").style.display = "none";
}

function showMainContent() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainContent").style.display = "flex";

  // Atualizar info do usuário
  document.getElementById("userName").textContent = appState.currentUser.name;
  document.getElementById("userInfo").style.display = "block";

  updateCartDisplay();
}

// Renderização
function renderCategories() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;

  const allCategory = `
        <button class="category-item active" onclick="selectCategory('all')">
            <i class="bi bi-grid"></i> Todos os Produtos
        </button>
    `;

  const categoryHTML = appState.categories
    .map(
      (category) => `
        <button class="category-item" onclick="selectCategory('${category.id}')">
            <i class="${category.icon}"></i> ${category.name}
        </button>
    `
    )
    .join("");

  categoryList.innerHTML = allCategory + categoryHTML;
}

function selectCategory(categoryId) {
  appState.currentCategory = categoryId;
  renderCategories();
  renderProducts();
}

function renderCategories() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;

  const allActive = appState.currentCategory === "all" ? "active" : "";
  const allCategory = `
        <button class="category-item ${allActive}" onclick="selectCategory('all')">
            <i class="bi bi-grid"></i> Todos os Produtos
        </button>
    `;

  const categoryHTML = appState.categories
    .map((category) => {
      const isActive = appState.currentCategory === category.id ? "active" : "";
      return `
            <button class="category-item ${isActive}" onclick="selectCategory('${category.id}')">
                <i class="${category.icon}"></i> ${category.name}
            </button>
        `;
    })
    .join("");

  categoryList.innerHTML = allCategory + categoryHTML;
}
function renderProducts() {
  const productsGrid = document.getElementById("productsGrid");
  const emptyState = document.getElementById("emptyState");
  const categoryTitle = document.getElementById("categoryTitle");

  if (!productsGrid) return;

  // Filtrar produtos pela categoria e busca
  let filtered = appState.products;
  if (appState.currentCategory !== "all") {
    filtered = filtered.filter((p) => p.category === appState.currentCategory);
    // Atualiza o título da categoria
    const cat = appState.categories.find(
      (c) => c.id === appState.currentCategory
    );
    categoryTitle.textContent = cat ? cat.name : "Produtos";
  } else {
    categoryTitle.textContent = "Todos os Produtos";
  }

  if (appState.searchTerm) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(appState.searchTerm)
    );
  }

  // Renderizar produtos
  if (filtered.length === 0) {
    productsGrid.innerHTML = "";
    emptyState.style.display = "block";
    return;
  } else {
    emptyState.style.display = "none";
  }

  productsGrid.innerHTML = filtered
    .map(
      (product) => `
      <div class="product-card">
        <img src="${product.image}" alt="${
        product.name
      }" class="product-image" />
        <div class="product-info">
          <h5 class="product-name">${product.name}</h5>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <span class="product-price">R$ ${product.price.toFixed(2)}</span>
            <button class="btn btn-add" onclick="openProductModal(${
              product.id
            })">
              <i class="bi bi-cart-plus"></i> Adicionar
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}
function addToCart(productId, quantity = 1, observations = "") {
  const product = appState.products.find((p) => p.id === productId);
  if (!product) return;

  // Verifica se já existe no carrinho
  const cartItem = appState.cart.find(
    (item) =>
      item.product.id === productId && item.observations === observations
  );
  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    appState.cart.push({
      product,
      quantity,
      observations,
    });
  }
  updateCartDisplay();
}
function updateCartDisplay() {
  const cartItemsDiv = document.getElementById("cartItems");
  const cartFooter = document.getElementById("cartFooter");
  const cartCount = document.getElementById("cartCount");

  if (appState.cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div class="cart-empty">
        <i class="bi bi-cart-x"></i>
        <p>Seu carrinho está vazio</p>
        <span>Adicione produtos para continuar</span>
      </div>
    `;
    cartFooter.style.display = "none";
    cartCount.textContent = "0 itens";
    return;
  }

  cartItemsDiv.innerHTML = appState.cart
    .map(
      (item, idx) => `
    <div class="cart-item">
      <img src="${item.product.image}" alt="${
        item.product.name
      }" class="cart-item-image" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.product.name}</div>
        <div class="cart-item-price">R$ ${(
          item.product.price * item.quantity
        ).toFixed(2)}</div>
        ${
          item.observations
            ? `<div class="cart-item-observations"><strong>Obs:</strong> ${item.observations}</div>`
            : ""
        }
        <div class="cart-item-controls">
          <span>Qtd:</span>
          <input type="number" min="1" value="${
            item.quantity
          }" onchange="changeCartQuantity(${idx}, this.value)">
          <button class="btn btn-remove btn-sm" onclick="removeFromCart(${idx})"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  cartFooter.style.display = "block";
  cartCount.textContent = `${appState.cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  )} itens`;

  // Atualiza valores do carrinho
  const subtotal = appState.cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  document.getElementById("subtotal").textContent = `R$ ${subtotal.toFixed(2)}`;
  const deliveryFee = 5.0;
  document.getElementById(
    "deliveryFee"
  ).textContent = `R$ ${deliveryFee.toFixed(2)}`;
  document.getElementById("totalAmount").textContent = `R$ ${(
    subtotal + deliveryFee
  ).toFixed(2)}`;
  localStorage.setItem("cart", JSON.stringify(appState.cart));
}
function changeCartQuantity(idx, value) {
  const quantity = parseInt(value);
  if (quantity > 0) {
    appState.cart[idx].quantity = quantity;
    updateCartDisplay();
  }
}

function removeFromCart(idx) {
  appState.cart.splice(idx, 1);
  updateCartDisplay();
}
function openProductModal(productId) {
  const product = appState.products.find((p) => p.id === productId);
  if (!product) return;

  appState.modalProductId = productId;

  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalImage").src = product.image;
  document.getElementById("modalDescription").textContent = product.description;
  document.getElementById(
    "modalPrice"
  ).textContent = `R$ ${product.price.toFixed(2)}`;
  document.getElementById("modalQuantity").value = 1;
  document.getElementById("modalObservations").value = "";

  const modal = new bootstrap.Modal(document.getElementById("productModal"));
  modal.show();
}

function addToCartFromModal() {
  const productId = appState.modalProductId;
  const quantity =
    parseInt(document.getElementById("modalQuantity").value) || 1;
  const observations = document.getElementById("modalObservations").value || "";
  addToCart(productId, quantity, observations);

  // Fechar o modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("productModal")
  );
  modal.hide();
}
function isValidCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0,
    rest;
  for (let i = 1; i <= 9; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}
