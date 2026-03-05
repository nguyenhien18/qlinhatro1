// js/thanhtoan.js
console.log("[PAY] thanhtoan.js loaded ✅");

window.addEventListener("DOMContentLoaded", () => {
  console.log("[PAY] DOMContentLoaded ✅");

  const KEY = "demo_payments_v1";
  const $ = (id) => document.getElementById(id);

  const els = {
    list: $("payList"),
    fRoom: $("fPayRoom"),
    fStatus: $("fPayStatus"),
    reset: $("resetPayFilter"),

    modal: $("payModal"),
    backdrop: $("payBackdrop"),
    close: $("payClose"),
    cancel: $("payCancel"),

    title: $("payTitle"),
    detail: $("payDetail"),
    goInvoice: $("payGoInvoice"),
  };

  const missing = Object.entries(els).filter(([k,v]) => !v).map(([k])=>k);
  if (missing.length) {
    console.error("[PAY] Missing elements:", missing);
    alert("Thiếu element ID trong HTML (thanh toán): " + missing.join(", "));
    return;
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
      { id: uuid(), room: "Phòng 1", period: "2025-03", total: 3165000, status: "CHUA_TT", invoiceId: "HD-2025-03-P1" },
      { id: uuid(), room: "Phòng 2", period: "2025-03", total: 2850000, status: "DA_TT",   invoiceId: "HD-2025-03-P2" },
    ]);
  }

  function money(n){
    return Number(n || 0).toLocaleString("vi-VN") + " đ";
  }

  function badgeStatus(s){
    if (s === "DA_TT") return `<span class="badge badge-green">Đã thanh toán</span>`;
    return `<span class="badge badge-wait">Chưa thanh toán</span>`;
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
      els.list.innerHTML = `<div class="room-card"><p style="color:#777">Không có dữ liệu thanh toán</p></div>`;
      return;
    }

    els.list.innerHTML = data.map(x => `
      <div class="room-card" style="margin-bottom:14px">
        <h3>${x.room}</h3>
        <p><b>Kỳ hóa đơn:</b> ${formatPeriodVN(x.period)}</p>
        <p><b>Tổng tiền:</b> ${money(x.total)}</p>
        <p><b>Trạng thái:</b> ${badgeStatus(x.status)}</p>

        <div class="actions">
          <button class="btn-edit" type="button" data-act="detail" data-id="${x.id}">
            Xem chi tiết
          </button>
          <button class="btn btn-outline" type="button" data-act="invoice" data-id="${x.id}">
            Xem hóa đơn
          </button>
        </div>
      </div>
    `).join("");
  }

  function formatPeriodVN(p){
    // "2025-03" -> "03/2025"
    if (!p) return "";
    const [y,m] = p.split("-");
    return `${m}/${y}`;
  }

  let currentId = null;

  function openModal(item){
    currentId = item.id;

    els.title.textContent = `Chi tiết thanh toán - ${item.room}`;
    els.detail.innerHTML = `
      <div style="line-height:1.9">
        <p><b>Phòng:</b> ${item.room}</p>
        <p><b>Kỳ:</b> ${formatPeriodVN(item.period)}</p>
        <p><b>Tổng tiền:</b> ${money(item.total)}</p>
        <p><b>Trạng thái:</b> ${badgeStatus(item.status)}</p>
        <hr/>
        <p style="color:#6b7280">
          (Demo) Bạn có thể bổ sung chi tiết tiền phòng/điện/nước/dịch vụ ở đây,
          hoặc lấy từ trang hóa đơn.
        </p>
      </div>
    `;

    els.modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModal(){
    els.modal.classList.remove("show");
    document.body.style.overflow = "";
    currentId = null;
  }

  function goInvoice(){
    if (!currentId) return;
    const item = load().find(x => x.id === currentId);
    if (!item) return;

    // lưu để trang hoadon đọc
    localStorage.setItem("selected_invoice_id", item.invoiceId);
    window.location.href = "hoadon.html";
  }

  function goInvoiceDirect(id){
    const item = load().find(x => x.id === id);
    if (!item) return;
    localStorage.setItem("selected_invoice_id", item.invoiceId);
    window.location.href = "hoadon.html";
  }

  // events
  els.list.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = btn.dataset.id;

    const item = load().find(x => x.id === id);
    if (!item) return;

    if (act === "detail") openModal(item);
    if (act === "invoice") goInvoiceDirect(id);
  });

  [els.backdrop, els.close, els.cancel].forEach(x => x.addEventListener("click", closeModal));
  els.goInvoice.addEventListener("click", goInvoice);

  [els.fRoom, els.fStatus].forEach(x => x.addEventListener("change", render));
  els.reset.addEventListener("click", () => {
    els.fRoom.value = "";
    els.fStatus.value = "";
    render();
  });

  seedIfEmpty();
  render();
});