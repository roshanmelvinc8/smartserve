document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // stop page reload

    let email = document.getElementById("userId").value.trim();
    let password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Please enter email and password ❌");
        return;
    }

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
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
        if (data.user.role === "admin") {
            window.location.href = "admin.html";
        } else if (data.user.role === "staff") {
            window.location.href = "staff.html";
        } else if (data.user.role === "student") {
            window.location.href = "next.html";
        }
    } catch (error) {
        alert(`Error: ${error.message} ❌`);
    }
});