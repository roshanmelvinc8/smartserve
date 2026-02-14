document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let username = document.getElementById("userId").value.trim();
    let userId = document.getElementById("password").value.trim();
    let role = document.getElementById("role").value.trim();
    let service = null;

    if (username === "" || userId === "" || role === "") {
        alert("Please fill all fields ❌");
        return;
    }

    // For staff, include service selection
    if (role === "staff") {
        service = document.getElementById("service").value;
    }

    try {
        const body = { username, userId, role };
        if (service) body.service = service;

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Login Failed: ${data.msg} ❌`);
            return;
        }

        // Store token and user data
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login Successfully ✅");

        // Redirect based on role
        if (role === "admin") {
            window.location.href = "admin.html";
        } else if (role === "staff") {
            window.location.href = "staff.html";
        } else if (role === "student") {
            window.location.href = "next.html";
        }
    } catch (error) {
        alert(`Error: ${error.message} ❌`);
    }
});