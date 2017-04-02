function setupChart(scaleDataArr=[]) {
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

function updateChart(chartObj, dataArr) {
  // Add point to end and remove point from beginning
  chartObj.data.datasets[0].data = dataArr;
  chartObj.update();
}
