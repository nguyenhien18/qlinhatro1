// dangnhap/login.js
const form = document.getElementById("loginForm");
const err = document.getElementById("loginError");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Demo tài khoản (bạn thêm tiếp nếu muốn)
  const DEMO_USERS = [
    { user: "admin", pass: "123", role: "ADMIN" },
    { user: "nguoithue1", pass: "123", role: "TENANT" },
  ];

  const found = DEMO_USERS.find(u => u.user === username && u.pass === password);

  if (!found) {
    if (err) err.style.display = "block";
    return;
  }

  if (err) err.style.display = "none";

  // lưu phiên đăng nhập
  localStorage.setItem("logged_in_user", found.user);
  localStorage.setItem("role", found.role);

  // chuyển trang theo role
  if (found.role === "ADMIN") {
    window.location.href = "../admin/trangchu.html";
  } else {
    window.location.href = "../nguoithue/trangcanhan.html";
  }
});