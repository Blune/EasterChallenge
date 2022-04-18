dateAndHumidity = new Map();
dateAndTempetarure = new Map();
dateAndP1 = new Map();
dateAndP2 = new Map();

Chart.defaults.global.defaultFontColor = "#fff";
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
            drawChart("temperature", Array.from(dateAndTempetarure.keys()), Array.from(dateAndTempetarure.values()));

            addToPreviousData(dateAndHumidity, getDateAndValue(response, "humidity"));
            drawChart("humidity", Array.from(dateAndHumidity.keys()), Array.from(dateAndHumidity.values()));
        });

    obj = fetch('https://data.sensor.community/airrohr/v1/sensor/71550/')
        .then(r => r.json())
        .then(response => {
            addToPreviousData(dateAndP1, getDateAndValue(response, "P1"));
            drawChart("P1", Array.from(dateAndP1.keys()), Array.from(dateAndP1.values()));

            addToPreviousData(dateAndP2, getDateAndValue(response, "P2"));
            drawChart("P2", Array.from(dateAndP2.keys()), Array.from(dateAndP2.values()));
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

function drawChart(name, labels, data) {

    new Chart(document.getElementById(name), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: "#F39325",
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            legend: {
                display: false
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem) {
                        return tooltipItem.yLabel;
                    }
                }
            },
            title: {
                display: false
            }
        }
    });
}