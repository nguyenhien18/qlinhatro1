// js/quanliphong.js (FIX + DEBUG)
console.log("[ROOM] quanliphong.js loaded ✅");

window.addEventListener("DOMContentLoaded", () => {
  console.log("[ROOM] DOMContentLoaded ✅");

  const KEY = "demo_rooms_v1";

  const $ = (id) => document.getElementById(id);

  const els = {
    list: $("roomList"),

    fName: $("fRoomName"),
    fType: $("fRoomType"),
    fStatus: $("fRoomStatus"),
    fReset: $("resetRoomFilter"),

    addBtn: $("addRoomBtn"),

    modal: $("roomModal"),
    backdrop: $("roomBackdrop"),
    close: $("roomClose"),
    cancel: $("roomCancel"),

    title: $("roomTitle"),
    save: $("roomSave"),

    id: $("roomId"),
    name: $("roomName"),
    type: $("roomType"),
    price: $("roomPrice"),
    status: $("roomStatus"),
    cap: $("roomCapacity"),
    cur: $("roomCurrent"),
  };

  // check thiếu id nào thì báo luôn
  const missing = Object.entries(els).filter(([k,v]) => !v).map(([k])=>k);
  if (missing.length) {
    console.error("[ROOM] Missing elements:", missing);
    alert("Thiếu element ID trong HTML: " + missing.join(", "));
    return;
  }

  function money(n){
    return Number(n || 0).toLocaleString("vi-VN") + " đ";
  }
  function typeLabel(t){ return t === "CO_GAC" ? "Có gác" : "Không gác"; }
  function statusLabel(s){
    if (s === "DA_CHO_THUE") return "Đã cho thuê";
    if (s === "DANG_SUA") return "Đang sửa";
    return "Phòng trống";
  }
  function statusBadge(s){
    // nếu bạn có css badge thì dùng, không có vẫn hiển thị text
    if (s === "DA_CHO_THUE") return `<span class="badge badge-green">Đã cho thuê</span>`;
    if (s === "DANG_SUA") return `<span class="badge badge-wait">Đang sửa</span>`;
    return `<span class="badge">Phòng trống</span>`;
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

    const id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());

    saveAll([{
      id,
      name: "Phòng 1",
      type: "CO_GAC",
      price: 3300000,
      status: "DA_CHO_THUE",
      capacity: 4,
      current: 4
    }]);
  }

  function matchFilters(x){
    const q = (els.fName.value || "").trim().toLowerCase();
    const t = els.fType.value;
    const s = els.fStatus.value;

    if (q && !x.name.toLowerCase().includes(q)) return false;
    if (t && x.type !== t) return false;
    if (s && x.status !== s) return false;
    return true;
  }

  function render(){
    const data = load().filter(matchFilters);

    if (!data.length){
      els.list.innerHTML = `<div class="room-card"><p style="color:#777">Không có phòng phù hợp</p></div>`;
      return;
    }

    els.list.innerHTML = data.map(x => `
      <div class="room-card" style="margin-bottom:14px">
        <h3>${x.name}</h3>
        <p><b>Loại phòng:</b> ${typeLabel(x.type)}</p>
        <p><b>Giá phòng:</b> ${money(x.price)}</p>
        <p><b>Trạng thái:</b> ${statusBadge(x.status)} <span style="color:#666">(${statusLabel(x.status)})</span></p>
        <p><b>Sức chứa:</b> ${x.capacity} người</p>
        <p><b>Số người hiện tại:</b> ${x.current} người</p>

        <div class="actions">
          <button class="btn-edit" data-act="edit" data-id="${x.id}" type="button">Sửa</button>
          <button class="btn-delete" data-act="del" data-id="${x.id}" type="button">Xóa</button>
        </div>
      </div>
    `).join("");
  }

  function openModal(mode, room){
    els.modal.classList.add("show");
    document.body.style.overflow = "hidden";

    if (mode === "add"){
      els.title.textContent = "Thêm phòng mới";
      els.id.value = "";
      els.name.value = "";
      els.type.value = "CO_GAC";
      els.price.value = "";
      els.status.value = "TRONG";
      els.cap.value = 1;
      els.cur.value = 0;
    } else {
      els.title.textContent = "Cập nhật phòng";
      els.id.value = room.id;
      els.name.value = room.name;
      els.type.value = room.type;
      els.price.value = room.price;
      els.status.value = room.status;
      els.cap.value = room.capacity;
      els.cur.value = room.current;
    }
  }

  function closeModal(){
    els.modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  function validate(){
    const name = els.name.value.trim();
    const price = Number(els.price.value);
    const cap = Number(els.cap.value);
    const cur = Number(els.cur.value);

    if (!name) return "Tên phòng không được trống";
    if (!Number.isFinite(price) || price < 0) return "Giá phòng không hợp lệ";
    if (!Number.isFinite(cap) || cap < 1) return "Sức chứa phải >= 1";
    if (!Number.isFinite(cur) || cur < 0) return "Số người hiện tại phải >= 0";
    if (cur > cap) return "Số người hiện tại không được lớn hơn sức chứa";
    return "";
  }

  function saveRoom(){
    const msg = validate();
    if (msg){ alert(msg); return; }

    const data = load();

    const payload = {
      id: els.id.value || ((crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())),
      name: els.name.value.trim(),
      type: els.type.value,
      price: Number(els.price.value),
      status: els.status.value,
      capacity: Number(els.cap.value),
      current: Number(els.cur.value),
    };

    const idx = data.findIndex(x => x.id === payload.id);
    if (idx >= 0) data[idx] = payload;
    else data.unshift(payload);

    saveAll(data);
    closeModal();
    render();
  }

  function deleteRoom(id){
    if (!confirm("Xóa phòng này?")) return;
    const data = load().filter(x => x.id !== id);
    saveAll(data);
    render();
  }

  // events
  els.addBtn.addEventListener("click", () => {
    console.log("[ROOM] click add");
    openModal("add");
  });

  els.save.addEventListener("click", () => {
    console.log("[ROOM] click save");
    saveRoom();
  });

  [els.backdrop, els.close, els.cancel].forEach(x => x.addEventListener("click", closeModal));

  els.list.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = btn.dataset.id;
    console.log("[ROOM] list click", act, id);

    const data = load();
    const room = data.find(x => x.id === id);

    if (act === "edit" && room) openModal("edit", room);
    if (act === "del") deleteRoom(id);
  });

  // filter
  [els.fName, els.fType, els.fStatus].forEach(x => x.addEventListener("input", render));
  els.fReset.addEventListener("click", () => {
    els.fName.value = "";
    els.fType.value = "";
    els.fStatus.value = "";
    render();
  });

  // init
  seedIfEmpty();
  render();
});