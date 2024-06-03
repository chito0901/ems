var dc_ID;
function loadMainPage() 
    {
    const username = $("#txt_username input").val().trim();
    const password = $("#txt_password input").val().trim();
    
    if (username === "" || password === "") {
        alert("Please enter both username and password.");
        return;
    }

    $.ajax({
        type: "POST",
        url: "login.php",
        data: { username: username, password: password },
        success: function(response) {
            const result = JSON.parse(response);
            if (result.status === "success") {
                var log = document.getElementById("login");
                log.style.display = "none";
                var mpage = document.getElementById("mainPage");
                mpage.style.display = "block";
                loadDashboard();
                if (result.role === "user") {
                    $("#mainPage .main_header ul li:contains('Reports')").hide();
                }
            } else {
                alert(result.message);
            }
        }
    });
    }

$(window).on("load", function() 
    {
        $.ajax({
            type: "GET",
            url: "session.php",
            success: function(response) {
                const result = JSON.parse(response);
                if (result.status === "logged_in") {
                    $("#login").hide();
                    $("#mainPage").show();
                    loadDashboard();
                    if (result.role === "user") {
                        $("#mainPage .main_header ul li:contains('Reports')").hide();
                    }
                } else {
                    $("#login").show();
                    $("#mainPage").hide();
                }
            }
        });
    });

function loadDashboard()
    {
    $("#mainBody").load("./pages/dashboard.html");
    const sensorEndpoints = [
        './sensor1/sensor_data1.php',
        './sensor2/sensor_data2.php',
        './sensor3/sensor_data3.php'
    ];
    
    Promise.all(sensorEndpoints.map(endpoint => fetch(endpoint)))
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(dataList => {
            dataList.forEach((data, index) => {
                const dataCenterIndex = index + 1;
                const dataCenterId = `db_item_label_status${dataCenterIndex}`;
                const temperatureId = `temp_dc_${dataCenterIndex}`;
                const humidityId = `hmd_dc_${dataCenterIndex}`;
                const waterId = `water_dc_${dataCenterIndex}`;
                const smokeId = `smoke_dc_${dataCenterIndex}`;
                
                if (data.error) {
                    console.error(`Error fetching data from data center ${dataCenterIndex}:`, data.error);
                    return;
                }

                document.getElementById(dataCenterId).textContent = "Online";
                document.getElementById(temperatureId).textContent = data.temperature + "°C";
                document.getElementById(humidityId).textContent = data.humidity + "%";
                document.getElementById(waterId).textContent = data.waterLevel;
                document.getElementById(smokeId).textContent = data.mq2Value;
                
                let waterDisplay;
                let waterElement = document.getElementById(waterId);
                let waterLevel = Number(data.waterLevel);
                
                if (waterElement) {
                    if (waterLevel === 0) {
                        waterDisplay = "Dry";
                    } else if (waterLevel >= 1 && waterLevel <= 350) {
                        waterDisplay = "Partially Immersed";
                    } else if (waterLevel >= 351 && waterLevel <= 400) {
                        waterDisplay = "Partially Submerged";
                    } else if (waterLevel > 400) {
                        waterDisplay = "Fully Submerged";
                    } else {
                        waterDisplay = "Unknown";
                    }
                    
                    waterElement.textContent = waterDisplay;
                    
                    let waterParentDiv = waterElement.parentNode.querySelector('.greenStat');
                    if (waterParentDiv) {
                        switch (waterDisplay) {
                            case "Dry":
                                waterParentDiv.className = "dryStat";
                                break;
                                case "Partially Immersed":
                                    waterParentDiv.className = "partiallyImmersedStat";
                                break;
                                case "Partially Submerged":
                                    waterParentDiv.className = "partiallySubmergedStat";
                                break;
                            case "Fully Submerged":
                                waterParentDiv.className = "fullySubmergedStat";
                                break;
                            default:
                                waterParentDiv.className = "";
                            }
                    } else {
                        console.error(`Parent div with class 'greenStat' not found for data center ${dataCenterIndex}.`);
                    }
                } else {
                    console.error(`Element with ID '${waterId}' not found for data center ${dataCenterIndex}.`);
                }

                let smokeDisplay = data.mq2Value < 400 ? "Clean" : "Smoke detected!";
                let smokeElement = document.getElementById(smokeId);
                smokeElement.textContent = smokeDisplay;
                
                let smokeDivElement = smokeElement.parentNode.querySelector('.greenStat');
                if (smokeDivElement) {
                    smokeDivElement.className = data.mq2Value < 400 ? "greenStat" : "redStat";
                }
            });
        });
    }
function loadReports()
    {
        $("#mainBody").load("./pages/reports.html");
    }
function loadAbout()
    {
        $("#mainBody").load("./pages/about.html");
    }
function loadSettings()
    {
        $("#mainBody").load("./pages/settings.html");
    }
function toggleChangePasswordForm()
    {
        $('#changePasswordForm').show();
        $('#settingsContent').hide();
        clearPasswordFields();
    }
function clearPasswordFields()
    {
        $("#currentPassword").val('');
        $("#newPassword").val('');
        $("#confirmPassword").val('');
    }
function goBackToSettingsContent()
    {
        $('#changePasswordForm').hide();
        $('#settingsContent').show();
        clearPasswordFields();
    }
function submitPasswordChange() {
    var currentPassword = $("#currentPassword").val().trim();
    var newPassword = $("#newPassword").val().trim();
    var confirmPassword = $("#confirmPassword").val().trim();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("All fields are required!");
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
    }

    $.ajax({
        type: "POST",
        url: "change_password.php",
        data: {
            currentPassword: currentPassword,
            newPassword: newPassword
        },
        success: function(response) {
            console.log(response);
            var result = JSON.parse(response);
            if (result.status === "success") {
                alert("Password changed successfully!");
                clearPasswordFields();
                goBackToSettingsContent();
            } else {
                alert("Error: " + result.message);
            }
        },
        error: function(xhr, status, error) {
            console.error(xhr.responseText);
            alert("An error occurred while changing the password.");
        }
    });
}
function logout() 
    {
    $.ajax({
        type: "POST",
        url: "logout.php",
        success: function(response) {
            window.location.href = "index.html";
        },
        error: function(xhr, status, error) {
            console.error(xhr.responseText);
        }
    });
    }
function showDataCenter(dc_ID) 
    {
        console.log(dc_ID)
        var dash = document.getElementById("db_Container");
        dash.style.display = "none";
        var dbTarget = document.getElementById("db_details");
        dbTarget.style.display = "flex";
        var lblId = document.getElementById("lblNxtPage");
        lblId.innerHTML = " > Data Center " + dc_ID;
        lblId.style.display = "inline-block";

        async function fetchData(dc_ID) {
            const url = `./sensor${dc_ID}/graph${dc_ID}.php`;
            const response = await fetch(url);
            const data = await response.json();
            return data.reverse();
        }

        async function createCharts() {
            const data = await fetchData(dc_ID);
            const labels = [...Array(8).keys()].map(i => `${i} hrs`);
            const temperatureData = data.map(item => item.temperature).reverse();
            const humidityData = data.map(item => item.humidity).reverse();
            const smokeData = data.map(item => item.mq2Value).reverse();
            const waterLevelData = data.map(item => item.waterLevel).reverse();

            const ctxTemperature = document.getElementById('temperatureChart').getContext('2d');
            if (Chart.getChart(ctxTemperature)) {
                Chart.getChart(ctxTemperature).destroy();
            }
            const temperatureChart = new Chart(ctxTemperature, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temperatureData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Temperature (°C)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Time (hrs)'
                            }
                        }
                    }
                }
            });

            const ctxHumidity = document.getElementById('humidityChart').getContext('2d');
            if (Chart.getChart(ctxHumidity)) {
                Chart.getChart(ctxHumidity).destroy();
            }
            const humidityChart = new Chart(ctxHumidity, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Humidity (%)',
                        data: humidityData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 60,
                            title: {
                                display: true,
                                text: 'Humidity (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Time (hrs)'
                            }
                        }
                    }
                }
            });

            const ctxSmoke = document.getElementById('smokeChart').getContext('2d');
            if (Chart.getChart(ctxSmoke)) {
                Chart.getChart(ctxSmoke).destroy();
            }
            const smokeChart = new Chart(ctxSmoke, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Smoke Level',
                        data: smokeData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 400,
                            title: {
                                display: true,
                                text: 'Smoke Level'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Time (hrs)'
                            }
                        }
                    }
                }
            });

            const ctxWaterLevel = document.getElementById('waterLevelChart').getContext('2d');
            if (Chart.getChart(ctxWaterLevel)) {
                Chart.getChart(ctxWaterLevel).destroy();
            }
            const waterLevelChart = new Chart(ctxWaterLevel, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Water Level',
                        data: waterLevelData,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 420,
                            title: {
                                display: true,
                                text: 'Water Level'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Time (hrs)'
                            }
                        }
                    }
                }
            });
        }
        createCharts();
    }
function hideDataCenter()
    {
        var dash = document.getElementById("db_Container");
        dash.style.display = "flex";
        var dbTarget = document.getElementById("db_details");
        dbTarget.style.display = "none";
        var lblId = document.getElementById("lblNxtPage");
        lblId.style.display = "none";
    }

function loadData()
    {
        var dcValue = document.getElementById("dcOptions").value;
        document.getElementById("data_header").innerHTML = "DATA CENTER " + dcValue;
        console.log(dcValue);
    }
