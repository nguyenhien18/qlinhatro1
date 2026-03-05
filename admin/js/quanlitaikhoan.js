// admin/js/quanlitaikhoan.js

// ====== Demo data ======
let accounts = [
  { id: 1, fullname: "Administrator", username: "admin", email: "admin@example.com", phone: "0123456789", role: "ADMIN", status: "ACTIVE", password: "123" },
  { id: 2, fullname: "khách thuê 1", username: "khachthue1", email: "khachthue1@gmail.com", phone: "0999008000", role: "USER", status: "ACTIVE", password: "123" },
  { id: 3, fullname: "khách thuê 2", username: "khachthue2", email: "khachthue2@gmail.com", phone: "0233660543", role: "USER", status: "ACTIVE", password: "123" },
];

// ====== State ======
let pageSize = 10;
let page = 1;
let keyword = "";

// ====== DOM ======
const tbody = document.getElementById("tbodyAccounts");
const pageSizeEl = document.getElementById("pageSize");
const searchEl = document.getElementById("searchInput");
const infoEl = document.getElementById("tableInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const modal = document.getElementById("accountModal");
const openBtn = document.getElementById("btnAddAccount");
const closeBtn = document.getElementById("accountClose");
const backdrop = document.getElementById("accountBackdrop");
const cancelBtn = document.getElementById("btnCancel");

const form = document.getElementById("accountForm");
const titleEl = document.getElementById("accountTitle");

const accId = document.getElementById("accId");
const accFullname = document.getElementById("accFullname");
const accUsername = document.getElementById("accUsername");
const accEmail = document.getElementById("accEmail");
const accPhone = document.getElementById("accPhone");
const accRole = document.getElementById("accRole");
const accStatus = document.getElementById("accStatus");
const accPassword = document.getElementById("accPassword");
const pwHint = document.getElementById("pwHint");

// ====== Helpers ======
function openModal() { modal.classList.add("show"); }
function closeModal() { modal.classList.remove("show"); }

function roleText(role){
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "HOST") return "Chủ trọ";
  return "Người dùng";
}

function statusText(status){
  return status === "ACTIVE" ? "Hoạt động" : "Khóa";
}

function filterAccounts(){
  const k = keyword.trim().toLowerCase();
  if (!k) return accounts;

  return accounts.filter(a => {
    return (
      String(a.id).includes(k) ||
      a.fullname.toLowerCase().includes(k) ||
      a.username.toLowerCase().includes(k) ||
      a.email.toLowerCase().includes(k) ||
      a.phone.toLowerCase().includes(k) ||
      roleText(a.role).toLowerCase().includes(k) ||
      statusText(a.status).toLowerCase().includes(k)
    );
  });
}

function render(){
  const list = filterAccounts();
  const total = list.length;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;

  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = list.slice(start, end);

  tbody.innerHTML = "";

  pageItems.forEach(a => {
    const tr = document.createElement("tr");

    const isAdminRow = a.role === "ADMIN";

    tr.innerHTML = `
      <td>${a.id}</td>
      <td>${a.fullname}</td>
      <td>${a.username}</td>
      <td>${a.email}</td>
      <td>${a.phone}</td>
      <td>${roleText(a.role)}</td>
      <td><span class="pill ${a.status === "ACTIVE" ? "pill-green" : "pill-gray"}">${statusText(a.status)}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn icon-edit" data-action="edit" data-id="${a.id}" title="Sửa">✎</button>
          ${isAdminRow ? "" : `<button class="icon-btn icon-del" data-action="del" data-id="${a.id}" title="Xóa">🗑</button>`}
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  infoEl.textContent = `Showing ${total === 0 ? 0 : start + 1} to ${end} of ${total} entries`;

  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;
}

// ====== Events: paging/search ======
pageSizeEl.addEventListener("change", () => {
  pageSize = Number(pageSizeEl.value);
  page = 1;
  render();
});

searchEl.addEventListener("input", () => {
  keyword = searchEl.value;
  page = 1;
  render();
});

prevBtn.addEventListener("click", () => {
  page--;
  render();
});

nextBtn.addEventListener("click", () => {
  page++;
  render();
});

// ====== Modal open: ADD ======
openBtn.addEventListener("click", () => {
  titleEl.textContent = "Thêm tài khoản mới";
  accId.value = "";
  accFullname.value = "";
  accUsername.value = "";
  accEmail.value = "";
  accPhone.value = "";
  accPassword.value = "";
  accRole.value = "USER";
  accStatus.value = "ACTIVE";
  if (pwHint) pwHint.style.display = "none";
  openModal();
});

function fillForm(a){
  accId.value = a.id;
  accFullname.value = a.fullname;
  accUsername.value = a.username;
  accEmail.value = a.email;
  accPhone.value = a.phone;
  accRole.value = a.role;
  accStatus.value = a.status;
}

// ====== Table action buttons ======
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = Number(btn.dataset.id);
  const a = accounts.find(x => x.id === id);
  if (!a) return;

  if (action === "edit") {
    titleEl.textContent = "Cập nhật tài khoản";
    fillForm(a);
    accPassword.value = ""; // không show mật khẩu cũ
    if (pwHint) pwHint.style.display = "block";
    openModal();
  }

  if (action === "del") {
    if (!confirm(`Xóa tài khoản "${a.username}" ?`)) return;
    accounts = accounts.filter(x => x.id !== id);
    render();
  }
});

// ====== Modal close ======
closeBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
});

// ====== Save add/edit ======
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    fullname: accFullname.value.trim(),
    username: accUsername.value.trim(),
    email: accEmail.value.trim(),
    phone: accPhone.value.trim(),
    role: accRole.value,
    status: accStatus.value,
  };

  const newPw = (accPassword.value || "").trim();

  if (!data.fullname || !data.username || !data.email || !data.phone) return;

  // unique username
  const exists = accounts.some(x =>
    x.username.toLowerCase() === data.username.toLowerCase() &&
    String(x.id) !== String(accId.value)
  );
  if (exists) {
    alert("Tên đăng nhập đã tồn tại!");
    return;
  }

  if (accId.value) {
    // EDIT
    const id = Number(accId.value);
    accounts = accounts.map(x => {
      if (x.id !== id) return x;
      return { ...x, ...data, password: newPw ? newPw : x.password };
    });
  } else {
    // ADD
    if (!newPw) {
      alert("Vui lòng nhập mật khẩu!");
      return;
    }
    const newId = accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
    accounts.push({ id: newId, ...data, password: newPw });
  }

  closeModal();
  render();
});

// init
render();