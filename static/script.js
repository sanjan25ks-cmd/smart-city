const citySelect = document.getElementById("citySelect");

function setBar(id, percent, dangerAbove, invert) {
    const bar = document.getElementById(id);
    bar.style.width = percent + "%";
    const bad = invert ? percent < dangerAbove : percent > dangerAbove;
    bar.style.background = bad ? "#dc2626" : "#16a34a";
}

async function loadCityData() {
    const city = citySelect.value;
    try {
        const response = await fetch("/api/data/" + city);
        const data = await response.json();

        document.getElementById("time").textContent = data.time;
        document.getElementById("traffic").textContent = data.traffic + "%";
        document.getElementById("aqi").textContent = data.aqi;
        document.getElementById("aqiCategory").textContent = data.aqi_category;
        document.getElementById("binFill").textContent = data.bin_fill + "%";
        document.getElementById("water").textContent = data.water_level + "%";
        document.getElementById("lights").textContent = data.faulty_lights;

        setBar("trafficBar", data.traffic, 80, false);
        setBar("binBar", data.bin_fill, 85, false);
        setBar("waterBar", data.water_level, 25, true);

        const alertList = document.getElementById("alertList");
        alertList.innerHTML = "";
        if (data.alerts.length === 0) {
            const li = document.createElement("li");
            li.className = "ok";
            li.textContent = "All systems normal.";
            alertList.appendChild(li);
        } else {
            data.alerts.forEach(function (text) {
                const li = document.createElement("li");
                li.textContent = text;
                alertList.appendChild(li);
            });
        }
    } catch (error) {
        console.log("Error loading data:", error);
    }
}

async function loadComplaints() {
    const response = await fetch("/api/complaints");
    const items = await response.json();
    const list = document.getElementById("complaintList");
    list.innerHTML = "";

    if (items.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No complaints yet.";
        list.appendChild(li);
        return;
    }

    items.slice(0, 10).forEach(function (c) {
        const li = document.createElement("li");
        li.textContent = "#" + c.id + " [" + c.category + "] " + c.message +
            " - " + c.name + " (" + c.time + ") - " + c.status;
        list.appendChild(li);
    });
}

document.getElementById("submitBtn").addEventListener("click", async function () {
    const name = document.getElementById("name").value;
    const category = document.getElementById("category").value;
    const message = document.getElementById("message").value;
    const formMsg = document.getElementById("formMsg");

    const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, category: category, message: message })
    });

    if (response.ok) {
        formMsg.textContent = "Complaint submitted successfully!";
        formMsg.style.color = "green";
        document.getElementById("name").value = "";
        document.getElementById("message").value = "";
        loadComplaints();
    } else {
        formMsg.textContent = "Please enter your name and message.";
        formMsg.style.color = "red";
    }
});

citySelect.addEventListener("change", loadCityData);

loadCityData();
loadComplaints();
setInterval(loadCityData, 5000); // refresh every 5 seconds