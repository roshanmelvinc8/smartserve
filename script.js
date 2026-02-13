// ===== API Helper Functions =====
function getAuthToken() {
    return localStorage.getItem("access_token");
}

function getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/";
}

async function apiCall(endpoint, method = "GET", body = null) {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.msg || "API Error");
    }

    return data;
}

// ===== Original Queue Functions =====
let queue = [];
let tokenNumber = 1;

function addPatient() {
    const name = document.getElementById("patientName").value;

    if (name === "") {
        alert("Please enter your name");
        return;
    }

    const patient = {
        token: tokenNumber,
        name: name
    };

    queue.push(patient);
    document.getElementById("tokenDisplay").innerText =
        `Your Token Number is: ${tokenNumber}`;

    tokenNumber++;
    document.getElementById("patientName").value = "";
    updateQueue();
}

function updateQueue() {
    const list = document.getElementById("queueList");
    if (!list) return;

    list.innerHTML = "";
    queue.forEach(p => {
        const li = document.createElement("li");
        li.innerText = `Token ${p.token} - ${p.name}`;
        list.appendChild(li);
    });
}

function callNext() {
    if (queue.length === 0) {
        document.getElementById("currentPatient").innerText = "No patients";
        return;
    }

    const next = queue.shift();
    document.getElementById("currentPatient").innerText =
        `Token ${next.token} - ${next.name}`;
}