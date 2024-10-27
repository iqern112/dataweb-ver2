async function fetchData() {
    try {
        const response = await fetch('/dashboard'); // ดึงข้อมูลจาก /data
        const data = await response.json(); // แปลงข้อมูลที่ได้เป็น JSON
        console.log(data); // แสดงข้อมูลใน console
        
        // คุณสามารถใช้ข้อมูลนี้เพื่อสร้าง chart หรือแสดงผลได้ตามต้องการ
        const labels = data.map(item => item.someLabel); // แทนที่ 'someLabel' ด้วยชื่อคอลัมน์ที่ต้องการใช้เป็น label
        const values = data.map(item => item.someValue); // แทนที่ 'someValue' ด้วยชื่อคอลัมน์ที่ต้องการใช้เป็น value

        // สร้าง chart
        const ctx = document.getElementById('myPieChart2').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ข้อมูลจากฐานข้อมูล',
                    data: values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// เรียกฟังก์ชันเพื่อดึงข้อมูล
fetchData();