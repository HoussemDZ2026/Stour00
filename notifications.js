// طلب الإذن لإرسال إشعارات النظام على الهاتف
document.addEventListener('DOMContentLoaded', () => {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("تم تفعيل نظام الإشعارات بنجاح!");
                }
            });
        }
    }
});

// دالة إرسال الإشعار مع الصوت
function sendOrderNotification(productName) {
    const audio = document.getElementById('notif-sound');
    
    // تشغيل الصوت
    if (audio) {
        audio.play().catch(e => console.log("خطأ في تشغيل الصوت: ", e));
    }

    // إظهار إشعار النظام (Push Notification)
    if (Notification.permission === "granted") {
        const notif = new Notification("مبروك! طلبية جديدة 🔥", {
            body: `وصلك طلب شراء لمنتج: ${productName}`,
            icon: "https://cdn-icons-png.flaticon.com/512/3081/3081840.png"
        });

        notif.onclick = () => {
            window.focus();
            toggleOrders(); // فتح قائمة الطلبات تلقائياً عند الضغط
        };
    }
}

// ربط هذه الدالة بنظام الفحص في ملف admin-logic.js
// ملاحظة: تأكد من استدعاء sendOrderNotification() داخل setInterval في ملف admin-logic
