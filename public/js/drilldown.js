// ฟังก์ชันเพื่อแสดง drill-down menu เมื่อสถานะเป็น Admin
function showDrillDown() {
    const userStatus = document.getElementById('statusBtn').textContent;
    const drillDownMenu = document.getElementById('drillDownMenu');
    
    if (userStatus === "Admin") {
        drillDownMenu.style.display = "block";
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