const form = document.getElementById("forgotForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = form.email.value.trim();

  // check gmail đơn giản
  const isGmail = /^[^\s@]+@gmail\.com$/i.test(email);
  if (!isGmail) {
    showMsg("Vui lòng nhập đúng Gmail (đuôi @gmail.com).", false);
    return;
  }

  // Demo: giả lập gửi mail
  showMsg(`Đã gửi mật khẩu đến: ${email}. Vui lòng kiểm tra hộp thư!`, true);

  // Nếu muốn tự chuyển về login sau 2s:
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
});

function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = "msg " + (ok ? "ok" : "err");
}