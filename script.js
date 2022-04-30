dateAndHumidity = new Map();
dateAndTemperature = new Map();
dateAndP1 = new Map();
dateAndP2 = new Map();

chartTemperature = null;
chartHumidity = null;
chartP1 = null;
chartP2 = null;

refreshEvery65Seconds();

async function refreshEvery65Seconds() {
    await fetchData();
    chartTemperature == null ? drawCharts() : updateCharts();
    setTimeout(refreshEvery65Seconds, 65000);
}

async function fetchData() {
    await fetchSensor1Data();
    await fetchSensor2Data();
}

async function fetchSensor1Data() {
    return new Promise(resolve => {
        fetch('https://data.sensor.community/airrohr/v1/sensor/71551/')
            .then(r => r.json())
            .then(response => {
                addToPreviousData(dateAndTemperature, getDateAndValue(response, "temperature"));
                addToPreviousData(dateAndHumidity, getDateAndValue(response, "humidity"));
            }).then(() => resolve('resolved'));
    });
}

async function fetchSensor2Data() {
    return new Promise(resolve => {
        fetch('https://data.sensor.community/airrohr/v1/sensor/71550/')
            .then(r => r.json())
            .then(response => {
                addToPreviousData(dateAndP1, getDateAndValue(response, "P1"));
                addToPreviousData(dateAndP2, getDateAndValue(response, "P2"));
            })
            .then(() => resolve('resolved'));
    });
}

function updateCharts() {
    updateChart(chartTemperature, [...dateAndTemperature].pop());
    updateChart(chartHumidity, [...dateAndHumidity].pop());
    updateChart(chartP1, [...dateAndP1].pop());
    updateChart(chartP2, [...dateAndP2].pop());
}

function drawCharts() {
    removeLoadingScreen();
    chartTemperature = drawChart("temperature", dateAndTemperature, 0, 25);
    chartHumidity = drawChart("humidity", dateAndHumidity, 40, 80);
    chartP1 = drawChart("P1", dateAndP1, 5, 25);
    chartP2 = drawChart("P2", dateAndP2, 5, 25);
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

function updateChart(chart, [key, value]) {
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
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function removeLoadingScreen() {
    var loadingOverlay = document.getElementById("loading");
    loadingOverlay.classList.remove("loading");
    var loadingWheel = document.getElementById("loadingWheel");
    loadingWheel.classList.remove("loading-wheel");
}