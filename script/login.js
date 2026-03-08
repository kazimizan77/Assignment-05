document.getElementById("btn-login").addEventListener("click", function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "admin123") {
    alert('login successful')
    window.location.href = "home.html";
  } else {
    alert("Invalid Username or Password");
  }
});
