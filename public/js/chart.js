window.onload = function() {
  fetchDataByYear();
  setTimeout(() => {
    fetchDataChart();
}, 1000);
};

async function fetchDataByYear() {
  const year = document.getElementById('yearDropdown').value
  try {
      const response = await fetch(`/dashboard/data/${year}`);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // updateTotalDisplay(data);
      // growthrateDisplay(data)
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

async function fetchDataChart() {
  const year = document.getElementById('yearDropdown').value
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
      createRadarChart(data.radarData);
      createLine2Chart(data.line2Data);

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
        label: 'จำนวนคนต่อสัญชาติ',
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

    const labels = data.map(item => item.preferred_foot); // ดึงชื่อประเทศ
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
                display: true,
                text: 'ความถนัดของเท้า'
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
          'rgb(102, 20, 0)',
          'rgb(179, 36, 0)',
          'rgb(255, 51, 0)',
          'rgb(255, 92, 51)',
          'rgb(204, 82, 0)',
          'rgb(255, 102, 0)',
          'rgb(255, 133, 51)',
          'rgb(255, 163, 102)',
          'rgb(255, 194, 153)',
          'rgb(255, 224, 204)'
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
              display: true,
              text: 'ตำแหน่งนิยม'
          }
      }
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
        label: 'เงินรายสัปดาห์เฉลี่ยของแต่ละค่าพลัง',
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

function createLine2Chart(data) {
  const ctx = document.getElementById('line2Chart');
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid or empty data for chart');
    return;
  }

  const labels = data.map(item => item.league_name); // ดึงชื่อประเทศ
  const data0 = data.map(item => item.avgweight); // ดึงชื่อประเทศ
  const data1 = data.map(item => item.avgheight); // ดึงชื่อประเทศ

  if (Chart.getChart("line2Chart")) {
    Chart.getChart("line2Chart").destroy();
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'น้ำหนักเฉลี่ย',
        data: data0,
        fill: true,
        borderColor: 'rgb(255, 26, 26)',
        tension: 0
      },{
        label: 'ส่วนสูงเฉลี่ย',
        data: data1,
        fill: true,
        borderColor: 'rgb(51, 153, 255)',
        tension: 0
      }]
    },
    options: {

    }
  });
}

function createRadarChart(data) {
  const ctx = document.getElementById('radarChart');
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid or empty data for chart');
    return;
  }

  const labels = ['avgpace', 'avgshooting', 'avgdribbling', 'avgphysic', 'avgpassing'];

  // ใช้ map และ destructuring เพื่อแยก preferred_foot ออก
  const preferredFeet = data.map(item => item.preferred_foot);
  const dataWithoutPreferredFoot = data.map(({ preferred_foot, ...rest }) => rest);

  const data0 = Object.values(dataWithoutPreferredFoot[0]);
  const data1 = Object.values(dataWithoutPreferredFoot[1]);

  if (Chart.getChart("radarChart")) {
    Chart.getChart("radarChart").destroy();
  }
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: `ค่าเฉลี่ยสมรรถภาพเท้า${preferredFeet[0]}`,
        data: data0,
        fill: true,
        backgroundColor: 'rgb(214, 245, 92 ,0.3)',
        borderColor: 'rgb(92, 214, 92)',
        pointBackgroundColor: 'rgb(92, 214, 92)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(92, 214, 92)'
      },{
        label: `ค่าเฉลี่ยสมรรถภาพเท้า${preferredFeet[1]}`,
        data: data1,
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
      }]
    },
    options: {
      elements: {
        line: {
          borderWidth: 1
        }
      }
    }
  });
}

document.getElementById('yearDropdown').addEventListener('change', fetchDataChart);