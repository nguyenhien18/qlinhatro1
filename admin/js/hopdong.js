// js/hopdong.js (FIX + DEBUG)
console.log("[CONTRACT] hopdong.js loaded ✅");

window.addEventListener("DOMContentLoaded", () => {
  console.log("[CONTRACT] DOMContentLoaded ✅");

  const KEY = "demo_contracts_v1";
  const $ = (id) => document.getElementById(id);

  const els = {
    list: $("contractList"),

    fRoom: $("fContractRoom"),
    fStatus: $("fContractStatus"),
    fReset: $("resetContractFilter"),

    addBtn: $("addContractBtn"),

    modal: $("contractModal"),
    backdrop: $("contractBackdrop"),
    close: $("contractClose"),
    cancel: $("contractCancel"),

    title: $("contractTitle"),
    save: $("contractSave"),

    id: $("contractId"),
    code: $("contractCode"),
    room: $("contractRoom"),
    rep: $("contractRep"),
    start: $("contractStart"),
    end: $("contractEnd"),
    deposit: $("contractDeposit"),
    status: $("contractStatus"),
  };

  const missing = Object.entries(els).filter(([k,v]) => !v).map(([k])=>k);
  if (missing.length) {
    console.error("[CONTRACT] Missing elements:", missing);
    alert("Thiếu element ID trong HTML (hợp đồng): " + missing.join(", "));
    return;
  }

  function money(n){
    return Number(n || 0).toLocaleString("vi-VN") + " đ";
  }
  function badgeStatus(s){
    if (s === "CON_HIEU_LUC") return `<span class="badge badge-green">Còn hiệu lực</span>`;
    if (s === "HET_HAN") return `<span class="badge badge-wait">Hết hạn</span>`;
    return `<span class="badge">Đã hủy</span>`;
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

    saveAll([{
      id: uuid(),
      code: "HD001",
      room: "Phòng 1",
      rep: "Nguyễn Văn A",
      start: "2024-01-01",
      end: "2025-01-01",
      deposit: 3000000,
      status: "CON_HIEU_LUC"
    }]);
  }

  function matchFilters(x){
    const r = els.fRoom.value;
    const s = els.fStatus.value;
    if (r && x.room !== r) return false;
    if (s && x.status !== s) return false;
    return true;
  }

  function render(){
    const data = load().filter(matchFilters);

    if (!data.length){
      els.list.innerHTML = `<div class="room-card"><p style="color:#777">Không có hợp đồng phù hợp</p></div>`;
      return;
    }

    els.list.innerHTML = data.map(x => `
      <div class="room-card" style="margin-bottom:14px">
        <h3>Hợp đồng #${x.code}</h3>
        <p><b>Phòng:</b> ${x.room}</p>
        <p><b>Người đại diện:</b> ${x.rep}</p>
        <p><b>Ngày bắt đầu:</b> ${formatDateVN(x.start)}</p>
        <p><b>Ngày kết thúc:</b> ${formatDateVN(x.end)}</p>
        <p><b>Tiền cọc:</b> ${money(x.deposit)}</p>
        <p><b>Trạng thái:</b> ${badgeStatus(x.status)}</p>

        <div class="actions">
          <button class="btn-edit" data-act="extend" data-id="${x.id}" type="button">Gia hạn</button>
          <button class="btn-delete" data-act="del" data-id="${x.id}" type="button">Hủy</button>
        </div>
      </div>
    `).join("");
  }

  function formatDateVN(iso){
    if (!iso) return "";
    const [y,m,d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function openModal(mode, item){
    els.modal.classList.add("show");
    document.body.style.overflow = "hidden";

    if (mode === "add"){
      els.title.textContent = "Tạo hợp đồng";
      els.id.value = "";
      els.code.value = "";
      els.room.value = "Phòng 1";
      els.rep.value = "";
      els.start.value = "";
      els.end.value = "";
      els.deposit.value = "";
      els.status.value = "CON_HIEU_LUC";
    } else if (mode === "extend"){
      els.title.textContent = "Gia hạn hợp đồng";
      els.id.value = item.id;
      els.code.value = item.code;
      els.room.value = item.room;
      els.rep.value = item.rep;
      els.start.value = item.start;
      els.end.value = item.end; // user sửa end
      els.deposit.value = item.deposit;
      els.status.value = item.status;
    }
  }

  function closeModal(){
    els.modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  function validate(){
    const code = els.code.value.trim();
    const rep = els.rep.value.trim();
    const start = els.start.value;
    const end = els.end.value;

    if (!code) return "Mã hợp đồng không được trống";
    if (!rep) return "Người đại diện không được trống";
    if (!start) return "Ngày bắt đầu không được trống";
    if (!end) return "Ngày kết thúc không được trống";
    if (end < start) return "Ngày kết thúc phải sau ngày bắt đầu";
    return "";
  }

  function saveContract(){
    const msg = validate();
    if (msg){ alert(msg); return; }

    const data = load();
    const id = els.id.value || ((crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()));

    const payload = {
      id,
      code: els.code.value.trim(),
      room: els.room.value,
      rep: els.rep.value.trim(),
      start: els.start.value,
      end: els.end.value,
      deposit: Number(els.deposit.value || 0),
      status: els.status.value
    };

    const idx = data.findIndex(x => x.id === id);
    if (idx >= 0) data[idx] = payload;
    else data.unshift(payload);

    saveAll(data);
    closeModal();
    render();
  }

  function cancelContract(id){
    if (!confirm("Hủy hợp đồng này?")) return;
    const data = load().map(x => x.id === id ? { ...x, status: "DA_HUY" } : x);
    saveAll(data);
    render();
  }

  // events
  els.addBtn.addEventListener("click", () => openModal("add"));
  els.save.addEventListener("click", saveContract);
  [els.backdrop, els.close, els.cancel].forEach(x => x.addEventListener("click", closeModal));

  els.list.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = btn.dataset.id;

    const data = load();
    const item = data.find(x => x.id === id);

    if (act === "extend" && item) openModal("extend", item);
    if (act === "del") cancelContract(id);
  });

  [els.fRoom, els.fStatus].forEach(x => x.addEventListener("change", render));
  els.fReset.addEventListener("click", () => {
    els.fRoom.value = "";
    els.fStatus.value = "";
    render();
  });

  seedIfEmpty();
  render();
});