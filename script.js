dateAndHumidity = new Map();
dateAndTempetarure = new Map();
dateAndP1 = new Map();
dateAndP2 = new Map();

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
            drawChart("temperature", [...dateAndTempetarure.keys()], [...dateAndTempetarure.values()], 10, 20);

            addToPreviousData(dateAndHumidity, getDateAndValue(response, "humidity"));
            drawChart("humidity", [...dateAndHumidity.keys()], [...dateAndHumidity.values()], 60, 70);
        });

    obj = fetch('https://data.sensor.community/airrohr/v1/sensor/71550/')
        .then(r => r.json())
        .then(response => {
            addToPreviousData(dateAndP1, getDateAndValue(response, "P1"));
            drawChart("P1", [...dateAndP1.keys()], [...dateAndP1.values()], 2, 15);

            addToPreviousData(dateAndP2, getDateAndValue(response, "P2"));
            drawChart("P2", [...dateAndP2.keys()], [...dateAndP2.values()], 2, 15);
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

function drawChart(name, labels, data, min, max) {

    new Chart(document.getElementById(name), {
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