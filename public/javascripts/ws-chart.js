function setupLineChart(scaleDataArr=[]) {
  let ctx = document.getElementById("scaleChart");
  let myChart = new Chart(ctx, {
    type: 'line',
    data: {
              labels: [...Array(scaleDataArr.length).keys()],
              datasets: [{
                label: 'Weight (AU)',
                data: scaleDataArr,
                backgroundColor: 'cornflowerblue',
                cubicInterpolationMode: 'monotone'
              }]
          },
    options: {
                animation: {
                  duration: 0
                }
             }
  });
  return myChart;
}

function setupBarChart(id, label, dataObj) {
  let ctx = document.getElementById(id);
  let myChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
              labels: Object.keys(dataObj),
              datasets: [{
                label: label,
                data: Object.values(dataObj),
                // backgroundColor: 'cornflowerblue',
                // cubicInterpolationMode: 'monotone'
              }],

          },
    options: {
                // animation: {
                //   duration: 0
                // },
                legend: {
                  display: false
                },
                scales: {
                        // xAxes: [{
                        //   stacked: true
                        // }],
                        // yAxes: [{
                        //   stacked: true
                        // }]
                }
             }
  });
  return myChart;
}

function updateLineChart(chartObj, dataArr) {
  // Add point to end and remove point from beginning
  chartObj.data.datasets[0].data = dataArr;
  chartObj.update();
}

function updateBarChart(chartObj, dataObj) {
  // console.log(dataObj);
  // console.log(Object.keys(dataObj));
  // console.log(Object.values(dataObj));
  chartObj.data.datasets[0].backgroundColor = [
    'rgba(255, 99, 132, 0.2)',
    // 'rgba(54, 162, 235, 0.2)',
    // 'rgba(255, 206, 86, 0.2)',
    // 'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)'
  ]
  // chartObj.data.datasets[0].hoverBackground = [
  //   'rgba(255, 220, 132, 1)',
  //   // 'rgba(54, 162, 235, 0.2)',
  //   // 'rgba(255, 206, 86, 0.2)',
  //   // 'rgba(75, 192, 192, 0.2)',
  //   'rgba(153, 220, 255, 1)',
  //   'rgba(255, 250, 255, 1)'
  // ]
  // chartObj.data.datasets[0].borderColor = [
  //     'rgba(255,99,132,1)',
  //     // 'rgba(54, 162, 235, 1)',
  //     // 'rgba(255, 206, 86, 1)',
  //     // 'rgba(75, 192, 192, 1)',
  //     'rgba(153, 102, 255, 1)',
  //     'rgba(255, 159, 64, 1)'
  // ]
  chartObj.data.labels = Object.keys(dataObj);
  chartObj.data.datasets[0].data = Object.values(dataObj);
  chartObj.update();
}
