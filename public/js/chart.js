window.onload = function() {
  fetchDataByYear();
  fetchDataChart(); // เรียกใช้ทันทีที่หน้าโหลด js sorting
};

async function fetchDataByYear() {
  const year = document.getElementById('yearSelect').value
  try {
      const response = await fetch(`/dashboard/data/${year}`);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();
      updateTotalDisplay(data);
      growthrateDisplay(data)
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

async function fetchDataChart() {
  const year = document.getElementById('yearSelect').value
  try {
      const response = await fetch(`/get-chart/${year}`);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data," bar.js");
      createBarChart(data.barData);
      createPieChart(data.pieData);
      createDoughnutChart(data.doughnutData);
      createLineChart(data.lineData);
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

function createBarChart(data) {
  const ctx = document.getElementById('barChart');

  if (Chart.getChart("barChart")) {
    Chart.getChart("barChart").destroy();
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: 'จำนวน',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function createPieChart(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
    // ดึงชื่อประเทศและจำนวนผู้เล่น
    // const labels = data.map(item => item.nationality_name);
    // const counts = data.map(item => item.count);

    // สร้างกราฟ Chart.js ด้วยข้อมูลที่ดึงมา

    if (Chart.getChart("pieChart")) {
      Chart.getChart("pieChart").destroy();
    }
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [
          'Red',
          'Blue',
          'Yellow'
        ],
        datasets: [{
          label: [],
          data: [300, 50, 100],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: ''
            }
        }
    }
    });
}


function createDoughnutChart(data) {
  const ctx = document.getElementById('doughnutChart');

  if (Chart.getChart("doughnutChart")) {
    Chart.getChart("doughnutChart").destroy();
  }

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [300, 50, 100],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    },
    options: {

    }
  });
}

function createLineChart(data) {
  const ctx = document.getElementById('lineChart');

  if (Chart.getChart("lineChart")) {
    Chart.getChart("lineChart").destroy();
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ["a","b","c","d","e","f","g"],
      datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      
    }
  });
}

document.getElementById('yearSelect').addEventListener('change', fetchDataChart);