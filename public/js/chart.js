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
  console.log(year)
  try {
      const response = await fetch(`/get-chart/${year}`);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();

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

  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid or empty data for chart');
    return;
  }

  const labels = data.map(item => item.nationality_name); // ดึงชื่อประเทศ
  const counts = data.map(item => parseInt(item.player_count, 10)); // ดึงจำนวนผู้เล่นในแต่ละประเทศ

  if (Chart.getChart("barChart")) {
    Chart.getChart("barChart").destroy();
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'จำนวน',
        data: counts,
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
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid or empty data for chart');
      return;
    }

    const labels = data.map(item => item.club_name); // ดึงชื่อประเทศ
    const counts = data.map(item => parseInt(item.player_count, 10)); // ดึงจำนวนผู้เล่นในแต่ละประเทศ

    if (Chart.getChart("pieChart")) {
      Chart.getChart("pieChart").destroy();
    }
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: "",
          data: counts,
          backgroundColor: [
            'rgb(0, 82, 204)',
            'rgb(0, 102, 255)',
            'rgb(51, 133, 255)',
            'rgb(102, 163, 255)',
            'rgb(153, 194, 255)'
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
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid or empty data for chart');
    return;
  }

  const labels = data.map(item => item.club_position); // ดึงชื่อประเทศ
  const counts = data.map(item => parseInt(item.counts, 10)); // ดึงจำนวนผู้เล่นในแต่ละประเทศ

  if (Chart.getChart("doughnutChart")) {
    Chart.getChart("doughnutChart").destroy();
  }

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'My First Dataset',
        data: counts,
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
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid or empty data for chart');
    return;
  }

  const labels = data.map(item => item.overall); // ดึงชื่อประเทศ
  const counts = data.map(item => parseInt(item.average_wage_eur, 10)); // ดึงจำนวนผู้เล่นในแต่ละประเทศ

  if (Chart.getChart("lineChart")) {
    Chart.getChart("lineChart").destroy();
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'เงินรายสัปดาห์',
        data: counts,
        fill: false,
        borderColor: 'rgb(255, 26, 26)',
        tension: 0
      }]
    },
    options: {
      
    }
  });
}

document.getElementById('yearSelect').addEventListener('change', fetchDataChart);