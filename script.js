window.onload = function() {
    const productContainer = document.getElementById('product-list'); // تأكد من وجود هذا ID في index
    const products = JSON.parse(localStorage.getItem('myProducts')) || [];

    if (products.length === 0) {
        productContainer.innerHTML = "<p style='text-align:center;'>لا توجد منتجات حالياً</p>";
        return;
    }

    productContainer.innerHTML = products.map(p => `
        <div class="product-card">
            ${p.timer ? `<div class="timer-box">ينتهي العرض خلال: ${p.timer} ساعة</div>` : ''}
            <img src="${p.image}" class="product-img">
            <div class="product-info">
                <h2 class="product-title">${p.name}</h2>
                <p class="product-desc">${p.desc}</p>
                <div class="price-section">
                    <span class="current-price">${p.price} دج</span>
                    ${p.oldPrice ? `<span class="old-price">${p.oldPrice} دج</span>` : ''}
                </div>
                <button class="submit-btn" onclick="openOrderForm('${p.name}')">اطلب الآن</button>
            </div>
        </div>
    `).join('');
};
