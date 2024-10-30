let isPopupVisible = false;
let isDragging = false;
// ฟังก์ชันเพื่อแสดง drill-down menu เมื่อสถานะเป็น Admin
function showDrillDown() {
    const userStatus = document.getElementById('statusBtn').textContent;
    const drillDownMenu = document.getElementById('drillDownMenu');
    
    if (userStatus === "Admin") {
        drillDownMenu.style.display = "block";
        isPopupVisible = true;
    }
}

function hideDrillDown() {
    document.getElementById('drillDownMenu').style.display = "none";
}

// ฟังก์ชันเพิ่มเติมเมื่อกดเลือกเมนู
function showMangePopup() {
    document.getElementById('showMange').style.display = 'block';
}

function closeMangePopup() {
    document.getElementById("showMange").style.display = "none";
}

// ติดตามการเคลื่อนที่ของเมาส์และเลื่อนตำแหน่ง popup ตาม
function startDragging(event) {
    isDragging = true;
}

function stopDragging() {
    isDragging = false;
}

// ติดตามการเคลื่อนที่ของเมาส์และเลื่อนตำแหน่ง popup เมื่อคลิกค้างบน popup
document.addEventListener("mousemove", function (event) {
    const showMange = document.getElementById('showMange');
    if (isDragging) {
        showMange.style.left = `${event.pageX + 10}px`; // ตำแหน่งซ้ายของ popup
        showMange.style.top = `${event.pageY + 10}px`;  // ตำแหน่งด้านบนของ popup
    }
});