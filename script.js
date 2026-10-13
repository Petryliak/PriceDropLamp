// script.js
const products = [
    { 
        id: 1, 
        name: 'LED лампочка з акумулятором', 
        price: 199, 
        oldPrice: 399, 
        images: ['prod22.PNG', 'prod1.jpg', 'prod222.PNG'], 
        badge: 'Хіт продажу', 
        desc: 'Потужність: 20W • Працює без світла • До 5 годин роботи.',
        types: ['battery']
    },
    { 
        id: 2, 
        name: 'Акумуляторний ліхтар лампа Almina 2606L', 
        price: 549, 
        oldPrice: 899, 
        images: ['prod2.jpg', 'prod22.jpg', 'prod4jpg.jpg'], 
        badge: 'Популярне', 
        desc: 'LED • POWER BANK • USB зарядка • До 12 годин роботи • ємністю - 4000 mAh.',
        types: ['battery', 'usb']
    },
    { 
        id: 3, 
        name: 'Прожектор-ліхтар на сонячній батареї з Powebank', 
        price: 499, 
        oldPrice: 699, 
        images: ['prod3.jpg', 'prod33.jpg', 'prod333.jpg'], 
        badge: 'Популярне', 
        desc: 'Ємність батареї - 12000 mAh • Powerbank • Зарядка від USB/сонця.',
        types: ['solar', 'usb']
    },
];

const generalReviews = [
    { name: 'Олександр Коваленко', stars: '★★★★★', text: 'Я брав цей товар, мені дуже сподобався, я замовляв у цього магазину, все відповідає і так дальше.' },
    { name: 'Анна Петрова', stars: '★★★★★', text: 'Заказала этот новый товар, мне очень понравилось, всё работает просто супер, спасибо!' },
    { name: 'Максим Шевченко', stars: '★★★★☆', text: 'Все прийшло вчасно, якість чудова, брав для дому на випадок відключень.' },
    { name: 'Ирина Смирнова', stars: '★★★★★', text: 'Отличный магазин, быстрая доставка, товар полностью соответствует описанию.' },
    { name: 'Андрій Мельник', stars: '★★★★★', text: 'Дуже задоволений покупкою, якість на висоті, рекомендую всім.' }
];

let cart = [];
let currentSlideIndex = 0;
let currentQty = 1;
let selectedProduct = products[0];

const TELEGRAM_BOT_TOKEN = '8851479797:AAF3sVNVpuU1hZA5CJqZFQEyxiBtzZvLs7c';
const TELEGRAM_CHAT_ID = '1374528287';

async function sendToTelegram(orderDetails) {
    let message = `🚨 <b>Нове замовлення Price Drop!</b>\n\n👤 ${orderDetails.name}\n📞 ${orderDetails.phone}\n📍 <b>Місто:</b> ${orderDetails.city}\n🏢 <b>Відділення:</b> ${orderDetails.warehouse}\n\n`;
    orderDetails.items.forEach(i => message += `- ${i.name} (${i.qty} шт.) — ${i.price * i.qty} грн\n`);
    message += `\n💰 <b>Сума:</b> ${orderDetails.total} грн`;

    // 1. Одразу фіксуємо покупку у Meta Pixel
    if (typeof fbq === 'function') {
        fbq('track', 'Purchase', {
            value: orderDetails.total,
            currency: 'UAH'
        });
    }

    // 2. Сповіщаємо користувача та очищуємо кошик
    alert('Замовлення успішно відправлено!');
    cart = [];
    updateCart();
    closeCart();

    // 3. Надсилаємо в Telegram фоном
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
        });
    } catch (e) {
        console.log('Помилка надсилання в Telegram');
    }
}

function submitQuickOrder(e) {
    e.preventDefault();
    sendToTelegram({
        name: document.getElementById('q-name').value,
        phone: document.getElementById('q-phone').value,
        city: document.getElementById('q-city').value,
        warehouse: document.getElementById('q-warehouse').value,
        items: [{ name: selectedProduct.name, price: selectedProduct.price, qty: 1 }],
        total: selectedProduct.price
    });
}

function submitCartOrder(e) {
    e.preventDefault();
    let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    sendToTelegram({
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        city: document.getElementById('c-city').value,
        warehouse: document.getElementById('c-warehouse').value,
        items: [...cart],
        total
    });
}

function renderPopularProducts() {
    const desktopContainer = document.getElementById('popular-desktop-container');
    if (desktopContainer) {
        desktopContainer.innerHTML = '';
        products.slice(0, 3).forEach(p => {
            desktopContainer.innerHTML += `
                <div class="product-card" onclick="openProductDetail(${p.id})">
                    ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
                    <img src="${p.images[0]}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/240x180?text=Фото'">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-desc">${p.desc}</p>
                    <div class="product-price">${p.price} грн</div>
                    <button class="product-btn" onclick="event.stopPropagation(); addToCart(${p.id}, 1)">Додати в кошик</button>
                </div>
            `;
        });
    }

    const track = document.getElementById('popular-products');
    if (track) {
        track.innerHTML = '';
        products.slice(0, 4).forEach(p => {
            track.innerHTML += `
                <div class="product-card" onclick="openProductDetail(${p.id})">
                    ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
                    <img src="${p.images[0]}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/240x180?text=Фото'">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-desc">${p.desc}</p>
                    <div class="product-price">${p.price} грн</div>
                    <button class="product-btn" onclick="event.stopPropagation(); addToCart(${p.id}, 1)">Додати в кошик</button>
                </div>
            `;
        });
    }
}

function moveSlide(direction) {
    const track = document.getElementById('popular-products');
    if (!track) return;
    const totalSlides = track.children.length;
    currentSlideIndex = (currentSlideIndex + direction + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
}

function renderProducts(containerId, data = products) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    data.forEach(p => {
        container.innerHTML += `
            <div class="product-card" onclick="renderSingleProduct(${p.id})">
                ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
                <img src="${p.images[0]}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/240x180?text=Фото'">
                <h3 class="product-title">${p.name}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="product-price">${p.price} грн</div>
                <button class="product-btn" onclick="event.stopPropagation(); addToCart(${p.id}, 1)">Додати в кошик</button>
            </div>
        `;
    });
}

function openProductDetail(id) {
    window.location.href = 'products.html?id=' + id;
}

function renderSingleProduct(id) {
    selectedProduct = products.find(x => x.id === id) || products[0];
    
    document.getElementById('sp-title').innerText = selectedProduct.name;
    document.getElementById('sp-price').innerText = selectedProduct.price + ' грн';
    document.getElementById('sp-old-price').innerText = selectedProduct.oldPrice + ' грн';
    document.getElementById('sp-desc').innerText = selectedProduct.desc;
    document.getElementById('sp-main-img').src = selectedProduct.images[0];
    
    const badge = document.getElementById('sp-badge');
    if (selectedProduct.badge) {
        badge.innerText = selectedProduct.badge;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }

    const thumbs = document.getElementById('sp-thumbs');
    thumbs.innerHTML = '';
    selectedProduct.images.slice(0, 3).forEach(img => {
        thumbs.innerHTML += `<img src="${img}" onclick="document.getElementById('sp-main-img').src=this.src" onerror="this.src='https://via.placeholder.com/70x70'">`;
    });

    currentQty = 1;
    document.getElementById('sp-qty').innerText = currentQty;

    document.getElementById('sp-qty-plus').onclick = () => {
        currentQty++;
        document.getElementById('sp-qty').innerText = currentQty;
    };
    document.getElementById('sp-qty-minus').onclick = () => {
        if (currentQty > 1) currentQty--;
        document.getElementById('sp-qty').innerText = currentQty;
    };

    document.getElementById('sp-add-btn').onclick = () => {
        addToCart(selectedProduct.id, currentQty);
    };

    const section = document.getElementById('product-detail-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
}

function renderReviews() {
    const container = document.getElementById('reviews-list-container');
    if (!container) return;
    container.innerHTML = '';
    
    let html = '';
    for (let i = 1; i <= 124; i++) {
        const rev = generalReviews[(i - 1) % generalReviews.length];
        html += `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-name">${rev.name} #${i}</span>
                    <span class="review-stars">${rev.stars}</span>
                </div>
                <div class="review-text">${rev.text}</div>
            </div>
        `;
    }
    container.innerHTML = html;
}

function openReviewsModal() {
    const modal = document.getElementById('reviews-modal');
    if (modal) modal.style.display = 'flex';
}

function closeReviewsModal() {
    const modal = document.getElementById('reviews-modal');
    if (modal) modal.style.display = 'none';
}

function applyFilters() {
    const maxPrice = document.getElementById('price-range').value;
    const checkboxes = document.querySelectorAll('.sidebar input[type="checkbox"]:checked');
    const selectedTypes = Array.from(checkboxes).map(cb => cb.value);

    let filtered = products.filter(p => p.price <= maxPrice);
    if (selectedTypes.length > 0) {
        filtered = filtered.filter(p => selectedTypes.some(t => p.types && p.types.includes(t)));
    }
    renderProducts('all-products', filtered);
}

function addToCart(id, qty = 1) {
    const p = products.find(x => x.id === id);
    if (p) {
        const existing = cart.find(x => x.id === id);
        if (existing) existing.qty += qty;
        else cart.push({...p, qty: qty});
        
        // Відстеження додавання в кошик у Meta Pixel
        if (typeof fbq === 'function') {
            fbq('track', 'AddToCart', {
                content_name: p.name,
                value: p.price * qty,
                currency: 'UAH'
            });
        }

        updateCart();
        openCart();
    }
}

function openCart() {
    document.getElementById('cart-modal').style.display = 'flex';
    updateCart();
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function updateCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    container.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        count += item.qty;
        container.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <span>${item.price} грн</span>
                </div>
                <div class="cart-qty-ctrl">
                    <button class="cart-qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="cart-qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
                <div>${item.price * item.qty} грн</div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `;
    });

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.innerText = 'Сума: ' + total + ' грн';
    document.querySelectorAll('.cart-count').forEach(el => el.innerText = count);
}

function updateQty(id, delta) {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) removeFromCart(id);
        else updateCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(x => x.id !== id);
    updateCart();
}

function toggleMenu() {
    document.getElementById('mobile-menu').classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('popular-products') || document.getElementById('popular-desktop-container')) {
        renderPopularProducts();
    }
    renderReviews();
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    if (idParam) {
        renderSingleProduct(parseInt(idParam));
    }
});
