// js/hoadon.js
document.addEventListener("DOMContentLoaded", () => {
  const LS_KEY = "admin_invoices_v1";

  const $ = (id) => document.getElementById(id);

  // ===== Helpers =====
  const pad2 = (n) => String(n).padStart(2, "0");

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function formatVND(n) {
    const v = Number(n) || 0;
    return v.toLocaleString("vi-VN") + " đ";
  }

  function parseNum(v) {
    return Number(String(v || "").replace(/[^\d]/g, "")) || 0;
  }

  function calcTotal(inv) {
    return (
      parseNum(inv.rent) +
      parseNum(inv.elec) +
      parseNum(inv.water) +
      parseNum(inv.service) +
      parseNum(inv.extra)
    );
  }

  function isPeriodValid(period) {
    return /^\d{4}-\d{2}$/.test(period);
  }

  function saveInvoices(arr) {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }

  function seedData() {
    const demo = [
      {
        id: "INV_1",
        room: "Phòng 1",
        period: "2024-01",
        date: "2024-02-01",
        rent: 3000000,
        elec: 105000,
        water: 105000,
        service: 50000,
        extra: 0,
        status: "UNPAID",
      },
      {
        id: "INV_2",
        room: "Phòng 2",
        period: "2024-01",
        date: "2024-02-01",
        rent: 2800000,
        elec: 90000,
        water: 120000,
        service: 50000,
        extra: 0,
        status: "PAID",
      },
    ];
    saveInvoices(demo);
    return demo;
  }

  function loadInvoices() {
    const raw = localStorage.getItem(LS_KEY);

    // Chưa có => seed
    if (!raw) return seedData();

    try {
      const arr = JSON.parse(raw);

      // Nếu bị rỗng [] => seed lại (vì bạn bảo "mất dữ liệu")
      if (!Array.isArray(arr) || arr.length === 0) return seedData();

      return arr;
    } catch {
      return seedData();
    }
  }

  function newId() {
    return "INV_" + Date.now();
  }

  function formatDateVN(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
  }

  // ===== DOM =====
  const listEl = $("invoiceList");
  const emptyEl = $("emptyState");

  // filter ids (nếu HTML của bạn có)
  const fStatus = $("fStatus");
  const fRoom = $("fRoom");
  const fPeriod = $("fPeriod");
  const btnReset = $("btnResetFilter");

  // Nút tạo hóa đơn: ưu tiên id, không có thì bắt theo class .btn-add
  const btnCreate =
    $("btnCreateInvoice") ||
    document.querySelector("#btnCreateInvoice") ||
    document.querySelector(".page-header .btn-add") ||
    document.querySelector(".page-header button");

  // Modal create/edit
  const invoiceModal = $("invoiceModal");
  const invoiceBackdrop = $("invoiceBackdrop");
  const invoiceClose = $("invoiceClose");
  const invoiceCancel = $("invoiceCancel");
  const invoiceSave = $("invoiceSave");

  const invTitle = $("invoiceTitle");
  const invId = $("invId");
  const invRoom = $("invRoom");
  const invPeriod = $("invPeriod");
  const invDate = $("invDate");
  const invStatus = $("invStatus");
  const invRent = $("invRent");
  const invElec = $("invElec");
  const invWater = $("invWater");
  const invService = $("invService");
  const invExtra = $("invExtra");
  const invTotal = $("invTotal");

  // Detail modal
  const detailModal = $("detailModal");
  const detailBackdrop = $("detailBackdrop");
  const detailClose = $("detailClose");
  const detailOk = $("detailOk");
  const detailBody = $("detailBody");

  // Nếu thiếu các phần modal trong HTML -> báo luôn để bạn biết
  const REQUIRED = [
    ["invoiceModal", invoiceModal],
    ["invoiceSave", invoiceSave],
    ["invRoom", invRoom],
    ["invPeriod", invPeriod],
    ["invDate", invDate],
  ];
  const missing = REQUIRED.filter((x) => !x[1]).map((x) => x[0]);
  if (missing.length) {
    console.error("Thiếu các element trong HTML:", missing.join(", "));
    alert(
      "Trang hoadon.html của bạn đang thiếu phần MODAL (invoiceModal...) nên bấm không hiện.\n" +
      "Hãy copy đúng file hoadon.html có modal mình gửi, hoặc đảm bảo các id sau có tồn tại:\n" +
      missing.join(", ")
    );
    return;
  }

  if (!btnCreate) {
    console.error("Không tìm thấy nút Tạo hóa đơn (btnCreateInvoice hoặc .btn-add).");
    alert("Không tìm thấy nút 'Tạo hóa đơn' trong HTML. Kiểm tra lại id/class của nút.");
    return;
  }

  // ===== State =====
  let invoices = loadInvoices();

  // ===== Modal helpers =====
  function openModal(modal) {
    modal.classList.add("show");
  }
  function closeModal(modal) {
    modal.classList.remove("show");
  }

  // ===== Render =====
  function invoiceCard(inv) {
    const total = calcTotal(inv);
    const badge =
      inv.status === "PAID"
        ? `<span class="badge badge-paid">Đã thanh toán</span>`
        : `<span class="badge badge-wait">Chưa thanh toán</span>`;

    return `
      <div class="room-card" data-id="${inv.id}" style="margin-bottom:14px;">
        <h3>Hóa đơn – ${inv.room}</h3>

        <p><b>Kỳ hóa đơn:</b> ${inv.period}</p>
        <p><b>Ngày lập:</b> ${formatDateVN(inv.date)}</p>

        <p><b>Tiền phòng:</b> ${formatVND(inv.rent)}</p>
        <p><b>Tiền điện:</b> ${formatVND(inv.elec)}</p>
        <p><b>Tiền nước:</b> ${formatVND(inv.water)}</p>
        <p><b>Tiền dịch vụ:</b> ${formatVND(inv.service)}</p>
        <p><b>Phát sinh:</b> ${formatVND(inv.extra)}</p>

        <p><b>Tổng tiền:</b> <b>${formatVND(total)}</b></p>

        <p><b>Trạng thái:</b> ${badge}</p>

        <div class="actions">
          <button class="btn-edit" type="button" data-action="detail">Xem chi tiết</button>
          <button class="btn-edit" type="button" data-action="edit">Sửa</button>
          <button class="btn-delete" type="button" data-action="delete">Xóa</button>
        </div>
      </div>
    `;
  }

  function renderList(arr) {
    if (!listEl) return;
    if (!arr.length) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.style.display = "";
      return;
    }
    if (emptyEl) emptyEl.style.display = "none";
    listEl.innerHTML = arr.map(invoiceCard).join("");
  }

  function applyFilter() {
    let filtered = invoices.slice();

    const s = fStatus ? fStatus.value : "";
    const r = fRoom ? fRoom.value : "";
    const p = fPeriod ? fPeriod.value.trim() : "";

    if (s) filtered = filtered.filter((x) => x.status === s);
    if (r) filtered = filtered.filter((x) => x.room === r);
    if (p) filtered = filtered.filter((x) => x.period === p);

    renderList(filtered);
  }

  // ===== Form total live =====
  function updateTotalPreview() {
    const inv = {
      rent: invRent.value,
      elec: invElec.value,
      water: invWater.value,
      service: invService.value,
      extra: invExtra.value,
    };
    invTotal.value = formatVND(calcTotal(inv));
  }

  [invRent, invElec, invWater, invService, invExtra].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", updateTotalPreview);
  });

  // ===== Actions =====
  function openCreate() {
    invTitle.textContent = "Tạo hóa đơn";
    invId.value = "";
    invRoom.value = "";
    invPeriod.value = "";
    invDate.value = todayISO();
    invStatus.value = "UNPAID";
    invRent.value = "";
    invElec.value = "";
    invWater.value = "";
    invService.value = "";
    invExtra.value = "0";
    updateTotalPreview();
    openModal(invoiceModal);
  }

  function openEdit(inv) {
    invTitle.textContent = "Sửa hóa đơn";
    invId.value = inv.id;
    invRoom.value = inv.room;
    invPeriod.value = inv.period;
    invDate.value = inv.date;
    invStatus.value = inv.status;

    invRent.value = parseNum(inv.rent);
    invElec.value = parseNum(inv.elec);
    invWater.value = parseNum(inv.water);
    invService.value = parseNum(inv.service);
    invExtra.value = parseNum(inv.extra);

    updateTotalPreview();
    openModal(invoiceModal);
  }

  function openDetail(inv) {
    const total = calcTotal(inv);
    detailBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
        <div>
          <div style="font-size:18px; font-weight:900;">Hóa đơn – ${inv.room}</div>
          <div style="color:#6b7280; margin-top:4px;">Kỳ ${inv.period} • Ngày lập ${formatDateVN(inv.date)}</div>
        </div>
        <div>
          ${
            inv.status === "PAID"
              ? `<span class="badge badge-paid">Đã thanh toán</span>`
              : `<span class="badge badge-wait">Chưa thanh toán</span>`
          }
        </div>
      </div>

      <hr style="margin:14px 0; border:none; border-top:1px solid #eee;">

      <div style="display:flex; flex-direction:column; gap:8px;">
        <div><b>Tiền phòng:</b> ${formatVND(inv.rent)}</div>
        <div><b>Tiền điện:</b> ${formatVND(inv.elec)}</div>
        <div><b>Tiền nước:</b> ${formatVND(inv.water)}</div>
        <div><b>Tiền dịch vụ:</b> ${formatVND(inv.service)}</div>
        <div><b>Phát sinh:</b> ${formatVND(inv.extra)}</div>
      </div>

      <hr style="margin:14px 0; border:none; border-top:1px solid #eee;">

      <div style="font-size:18px; font-weight:900;">Tổng tiền: ${formatVND(total)}</div>
    `;
    openModal(detailModal);
  }

  function handleSave() {
    const data = {
      id: invId.value || newId(),
      room: invRoom.value.trim(),
      period: invPeriod.value.trim(),
      date: invDate.value,
      status: invStatus.value,

      rent: parseNum(invRent.value),
      elec: parseNum(invElec.value),
      water: parseNum(invWater.value),
      service: parseNum(invService.value),
      extra: parseNum(invExtra.value),
    };

    if (!data.room) return alert("Vui lòng chọn Phòng.");
    if (!isPeriodValid(data.period)) return alert("Kỳ hóa đơn sai định dạng. VD: 2025-06");
    if (!data.date) return alert("Vui lòng chọn Ngày lập.");

    const exists = invoices.some(
      (x) => x.id !== data.id && x.room === data.room && x.period === data.period
    );
    if (exists) return alert("Đã có hóa đơn của phòng này trong kỳ này rồi!");

    const idx = invoices.findIndex((x) => x.id === data.id);
    if (idx >= 0) invoices[idx] = data;
    else invoices.unshift(data);

    saveInvoices(invoices);
    closeModal(invoiceModal);
    applyFilter();
  }

  function handleDelete(id) {
    const inv = invoices.find((x) => x.id === id);
    if (!inv) return;

    if (!confirm(`Xóa hóa đơn ${inv.room} kỳ ${inv.period} ?`)) return;

    invoices = invoices.filter((x) => x.id !== id);
    saveInvoices(invoices);
    applyFilter();
  }

  // ===== Events =====
  btnCreate.addEventListener("click", openCreate);

  invoiceClose.addEventListener("click", () => closeModal(invoiceModal));
  invoiceCancel.addEventListener("click", () => closeModal(invoiceModal));
  invoiceBackdrop.addEventListener("click", () => closeModal(invoiceModal));
  invoiceSave.addEventListener("click", handleSave);

  detailClose.addEventListener("click", () => closeModal(detailModal));
  detailOk.addEventListener("click", () => closeModal(detailModal));
  detailBackdrop.addEventListener("click", () => closeModal(detailModal));

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (invoiceModal.classList.contains("show")) closeModal(invoiceModal);
    if (detailModal.classList.contains("show")) closeModal(detailModal);
  });

  if (fStatus) fStatus.addEventListener("change", applyFilter);
  if (fRoom) fRoom.addEventListener("change", applyFilter);
  if (fPeriod) fPeriod.addEventListener("input", applyFilter);

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (fStatus) fStatus.value = "";
      if (fRoom) fRoom.value = "";
      if (fPeriod) fPeriod.value = "";
      applyFilter();
    });
  }

  if (listEl) {
    listEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const card = e.target.closest("[data-id]");
      if (!card) return;

      const id = card.getAttribute("data-id");
      const inv = invoices.find((x) => x.id === id);
      if (!inv) return;

      const action = btn.getAttribute("data-action");
      if (action === "detail") openDetail(inv);
      if (action === "edit") openEdit(inv);
      if (action === "delete") handleDelete(id);
    });
  }

  // ===== Init =====
  applyFilter();
});