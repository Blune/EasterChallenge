dateAndHumidity = new Map();
dateAndTempetarure = new Map();
dateAndP1 = new Map();
dateAndP2 = new Map();

chartTemperature = null;
chartHumidity = null;
chartP1 = null;
chartP2 = null;

refreshEvery65Seconds();

function refreshEvery65Seconds() {
    fetchAndDisplayData();
    setTimeout(refreshEvery65Seconds, 65000);
}

function fetchAndDisplayData() {
    fetch('https://data.sensor.community/airrohr/v1/sensor/71551/')
        .then(r => r.json())
        .then(response => {
            addToPreviousData(dateAndTempetarure, getDateAndValue(response, "temperature"));
            addToPreviousData(dateAndHumidity, getDateAndValue(response, "humidity"));
        }).then(() =>{
            chartTemperature == null 
            ? chartTemperature = drawChart("temperature", dateAndTempetarure, 15, 25)
            : updateChart(chartTemperature, [...dateAndTempetarure].pop())

            chartHumidity == null 
            ? chartHumidity = drawChart("humidity", dateAndHumidity, 60, 80) 
            : updateChart(chartHumidity, [...dateAndHumidity].pop())
        });

    fetch('https://data.sensor.community/airrohr/v1/sensor/71550/')
        .then(r => r.json())
        .then(response => {
            addToPreviousData(dateAndP1, getDateAndValue(response, "P1"));
            addToPreviousData(dateAndP2, getDateAndValue(response, "P2"));
        })
        .then(() => {
            chartP1 == null 
            ? chartP1 = drawChart("P1", dateAndP1, 2, 15)
            : updateChart(chartP1, [...dateAndP1].pop())

            chartP2 == null 
            ? chartP2 = drawChart("P2", dateAndP2, 2, 15)
            : updateChart(chartP2, [...dateAndP2].pop())
        });
}

function addToPreviousData(previousData, newData) {
    newData.forEach((value, key) => previousData.set(key, value));
}

function getDateAndValue(response, valueName) {
    map = new Map();
    dates = getDates(response);
    data = getSensorData(response, valueName);
    for (var i = 0; i < dates.length; i++) 
        map.set(dates[i], data[i]);
    return map;
}

function getDates(response) {
    return dates = response
        .map(x => new Date(x.timestamp))
        .map(x => String(x.getHours()).padStart(2, '0') + ":" + String(x.getMinutes()).padStart(2, '0'))
        .reverse();
}

function getSensorData(response, name) {
    return response
        .flatMap(data => data.sensordatavalues)
        .filter(x => x.value_type === name)
        .map(x => x.value)
        .reverse();
}

function updateChart(chart, [key, value]){
    chart.data.labels.push(key);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(value);
    });
    chart.update();
}

function drawChart(name, datesAndValues, min, max) {
    return new Chart(document.getElementById(name), {
        type: 'line',
        data: {
            labels: [...datesAndValues.keys()],
            datasets: [{
                data: [...datesAndValues.values()],
                borderColor: "#F39325",
                color: "#fff"
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    suggestedMin: min,
                    suggestedMax: max
                }
            },                
            plugins:{
                legend: {
                    display: false
                }
            }
        }
    });
}