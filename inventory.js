let inventory = [];

function addToInventory(name, specs, quantity) {
    const item = {
        name: name,
        specs: specs,
        quantity: quantity,
        status: (quantity > 0) ? 'متوفر' : 'نافذ'
    };
    inventory.push(item);
    showCustomAlert("تمت إضافة المنتج للمستودع بنجاح!");
}
