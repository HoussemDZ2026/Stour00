// وظيفة نسخ الرابط مع النافذة الجذابة
function copyStoreLink() {
    const link = "https://houssemdz2026.github.io/Stour00/";
    navigator.clipboard.writeText(link).then(() => {
        showCustomAlert("✨ تم نسخ رابط متجرك بنجاح!");
    });
}

// وظيفة التصفير التلقائي للزوار
function checkAutoReset() {
    const now = new Date().getTime();
    const lastReset = localStorage.getItem('lastResetTime') || now;

    // تصفير يومي (كل 24 ساعة)
    if (now - lastReset >= 24 * 60 * 60 * 1000) {
        document.getElementById('dailyVisitors').innerText = '0';
        localStorage.setItem('lastResetTime', now);
    }
}

// إظهار نافذة الحذف (نعم / لا)
function confirmDelete(type) {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
    // هنا نحدد إذا كان الحذف لمنتج أو طلبية
}
