// nguoithue/js/auth.js

// 1) Check đăng nhập (nếu muốn chặn truy cập)
const user = localStorage.getItem("logged_in_user");
if (!user) {
  window.location.href = "../dangnhap/login.html";
}

// 2) Set chữ "Xin chào, ..."
const hello = document.getElementById("helloUser");
if (hello && user) hello.textContent = user;

// 3) Logout (nếu trang có nút logout)
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("logged_in_user");
    window.location.href = "../dangnhap/login.html";
  });
}