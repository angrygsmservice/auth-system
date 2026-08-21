async function save() {
    const newUsername = document.getElementById("newUsername").value;

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/update-username", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ newUsername })
    });

    const data = await res.json();
    alert(data.message);
}