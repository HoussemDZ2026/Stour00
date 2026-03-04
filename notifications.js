// وظيفة تشغيل الرنة الجذابة
function playSaleSound() {
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3'); // يمكنك تغيير الرابط لصوت رنة نقود
    audio.play();
}

// طلب إذن الإشعارات من المتصفح
function requestNotificationPermission() {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

// إظهار إشعار المبيعة
function showSaleNotification(customerName, product) {
    if (Notification.permission === 'granted') {
        new Notification("✨ مبيعة جديدة!", {
            body: `قام ${customerName} بطلب ${product}`,
            icon: 'icon.png'
        });
        playSaleSound();
    }
}
