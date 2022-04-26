dateAndHumidity = new Map();
dateAndTempetarure = new Map();
dateAndP1 = new Map();
dateAndP2 = new Map();

chartTemperature = null;
chartHumidity = null;
chartP1 = null;
chartP2 = null;

Chart.defaults.defaultFontColor = "#fff";
refreshEvery65Seconds();

function refreshEvery65Seconds() {
    fetchAndDisplayData();
    setTimeout(refreshEvery65Seconds, 65000);
}

function fetchAndDisplayData() {
    obj = fetch('https://data.sensor.community/airrohr/v1/sensor/71551/')
        .then(r => r.json())
        .then(response => {
            addToPreviousData(dateAndTempetarure, getDateAndValue(response, "temperature"));
            if(!chartTemperature) chartTemperature = drawChart("temperature", [...dateAndTempetarure.keys()], [...dateAndTempetarure.values()], 15, 25);
            else updateChart(chartTemperature, [...dateAndTempetarure].pop())

            addToPreviousData(dateAndHumidity, getDateAndValue(response, "humidity"));
            if(!chartHumidity) chartHumidity = drawChart("humidity", [...dateAndHumidity.keys()], [...dateAndHumidity.values()], 60, 80);
            else updateChart(chartHumidity, [...dateAndHumidity].pop())
        });

    obj = fetch('https://data.sensor.community/airrohr/v1/sensor/71550/')
        .then(r => r.json())
        .then(response => {
            addToPreviousData(dateAndP1, getDateAndValue(response, "P1"));
            if(!chartP1) chartP1 = drawChart("P1", [...dateAndP1.keys()], [...dateAndP1.values()], 2, 15);
            else updateChart(chartP1, [...dateAndP1].pop())

            addToPreviousData(dateAndP2, getDateAndValue(response, "P2"));
            if(!chartP2) chartP1 = drawChart("P2", [...dateAndP2.keys()], [...dateAndP2.values()], 2, 15);
            else updateChart(chartP2, [...dateAndP2].pop())
        });
}

function addToPreviousData(previousData, newData) {
    newData.forEach((value, key) => previousData.set(key, value));
}

function getDateAndValue(response, valueName) {
    dict = new Map();
    dates = getDates(response);
    data = getSensorData(response, valueName);
    for (var i = 0; i < dates.length; i++) {
        dict.set(dates[i], data[i]);
    }
    return dict;
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

function drawChart(name, labels, data, min, max) {
    return new Chart(document.getElementById(name), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: "#F39325",
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    stacked: true,
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