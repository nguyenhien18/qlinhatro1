// admin/js/auth.js

// Lấy user đang đăng nhập
const user = localStorage.getItem("logged_in_user");

// Nếu chưa login thì đá về trang login (đúng cấu trúc bạn đang có)
if (!user) {
  window.location.href = "../dangnhap/login.html";
}

// Hiện user lên sidebar
const hello = document.getElementById("helloUser");
if (hello && user) hello.textContent = user;

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("logged_in_user");
    window.location.href = "../dangnhap/login.html";
  });
}