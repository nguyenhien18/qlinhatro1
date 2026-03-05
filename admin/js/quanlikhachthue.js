// js/quanlikhachthue.js (FIX + DEBUG)
console.log("[TENANT] quanlikhachthue.js loaded ✅");

window.addEventListener("DOMContentLoaded", () => {
  console.log("[TENANT] DOMContentLoaded ✅");

  const KEY = "demo_tenants_v1";
  const $ = (id) => document.getElementById(id);

  const els = {
    list: $("tenantList"),

    fRole: $("fTenantRole"),
    fReset: $("resetTenantFilter"),

    addBtn: $("addTenantBtn"),

    modal: $("tenantModal"),
    backdrop: $("tenantBackdrop"),
    close: $("tenantClose"),
    cancel: $("tenantCancel"),

    title: $("tenantTitle"),
    save: $("tenantSave"),

    id: $("tenantId"),
    name: $("tenantName"),
    role: $("tenantRole"),
    phone: $("tenantPhone"),
    cccd: $("tenantCccd"),
    room: $("tenantRoom"),
  };

  const missing = Object.entries(els).filter(([k,v]) => !v).map(([k])=>k);
  if (missing.length) {
    console.error("[TENANT] Missing elements:", missing);
    alert("Thiếu element ID trong HTML (khách thuê): " + missing.join(", "));
    return;
  }

  const roleLabel = (r) => {
    if (r === "DAI_DIEN") return "Đại diện";
    if (r === "O_CUNG") return "Ở cùng";
    return "Người thuê";
  };

  function badgeRole(r){
    if (r === "DAI_DIEN") return `<span class="badge badge-green">Đại diện</span>`;
    if (r === "O_CUNG") return `<span class="badge">Ở cùng</span>`;
    return `<span class="badge">Người thuê</span>`;
  }

  function load(){
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }
  function saveAll(arr){
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  function seedIfEmpty(){
    const cur = load();
    if (cur.length) return;

    const uuid = () => (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random());

    saveAll([
      { id: uuid(), name: "Nguyễn Văn A", role: "DAI_DIEN", phone: "0987654321", cccd: "012345678901", room: "Phòng 1" },
      { id: uuid(), name: "Trần Thị B", role: "O_CUNG", phone: "0909888777", cccd: "123456789012", room: "Phòng 1" },
    ]);
  }

  function matchFilters(x){
    const r = els.fRole.value;
    if (r && x.role !== r) return false;
    return true;
  }

  function render(){
    const data = load().filter(matchFilters);

    if (!data.length){
      els.list.innerHTML = `<div class="room-card"><p style="color:#777">Không có khách thuê phù hợp</p></div>`;
      return;
    }

    els.list.innerHTML = data.map(x => `
      <div class="room-card" style="margin-bottom:14px">
        <h3>${x.name}</h3>
        <p><b>Vai trò:</b> ${badgeRole(x.role)} <span style="color:#666">(${roleLabel(x.role)})</span></p>
        <p><b>SĐT:</b> ${x.phone || ""}</p>
        <p><b>CCCD:</b> ${x.cccd || ""}</p>
        <p><b>Phòng:</b> ${x.room || ""}</p>

        <div class="actions">
          <button class="btn-edit" data-act="edit" data-id="${x.id}" type="button">Sửa</button>
          <button class="btn-delete" data-act="del" data-id="${x.id}" type="button">Xóa</button>
        </div>
      </div>
    `).join("");
  }

  function openModal(mode, item){
    els.modal.classList.add("show");
    document.body.style.overflow = "hidden";

    if (mode === "add"){
      els.title.textContent = "Thêm thành viên";
      els.id.value = "";
      els.name.value = "";
      els.role.value = "O_CUNG";
      els.phone.value = "";
      els.cccd.value = "";
      els.room.value = "Phòng 1";
    } else {
      els.title.textContent = "Cập nhật khách thuê";
      els.id.value = item.id;
      els.name.value = item.name;
      els.role.value = item.role;
      els.phone.value = item.phone || "";
      els.cccd.value = item.cccd || "";
      els.room.value = item.room || "";
    }
  }

  function closeModal(){
    els.modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  function validate(){
    const name = els.name.value.trim();
    if (!name) return "Họ và tên không được trống";
    return "";
  }

  function saveTenant(){
    const msg = validate();
    if (msg){ alert(msg); return; }

    const data = load();
    const id = els.id.value || ((crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()));

    const payload = {
      id,
      name: els.name.value.trim(),
      role: els.role.value,
      phone: els.phone.value.trim(),
      cccd: els.cccd.value.trim(),
      room: els.room.value.trim(),
    };

    const idx = data.findIndex(x => x.id === id);
    if (idx >= 0) data[idx] = payload;
    else data.unshift(payload);

    saveAll(data);
    closeModal();
    render();
  }

  function deleteTenant(id){
    if (!confirm("Xóa thành viên này?")) return;
    const data = load().filter(x => x.id !== id);
    saveAll(data);
    render();
  }

  // events
  els.addBtn.addEventListener("click", () => openModal("add"));
  els.save.addEventListener("click", saveTenant);
  [els.backdrop, els.close, els.cancel].forEach(x => x.addEventListener("click", closeModal));

  els.list.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = btn.dataset.id;

    const data = load();
    const item = data.find(x => x.id === id);

    if (act === "edit" && item) openModal("edit", item);
    if (act === "del") deleteTenant(id);
  });

  els.fRole.addEventListener("change", render);
  els.fReset.addEventListener("click", () => {
    els.fRole.value = "";
    render();
  });

  seedIfEmpty();
  render();
});