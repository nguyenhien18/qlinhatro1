// js/chiso.js
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "admin_meters";

  // ===== DOM =====
  const listEl = document.getElementById("meterList");
  const emptyEl = document.getElementById("emptyState");

  const addBtn = document.getElementById("addMeterBtn");

  const fType = document.getElementById("filterType");
  const fRoom = document.getElementById("filterRoom");
  const fPeriod = document.getElementById("filterPeriod");
  const resetBtn = document.getElementById("resetFilterBtn");

  const modal = document.getElementById("meterModal");
  const backdrop = document.getElementById("meterBackdrop");
  const closeBtn = document.getElementById("meterClose");
  const cancelBtn = document.getElementById("meterCancel");
  const saveBtn = document.getElementById("meterSave");

  const titleEl = document.getElementById("meterTitle");
  const form = document.getElementById("meterForm");

  const idEl = document.getElementById("meterId");
  const typeEl = document.getElementById("meterType");
  const roomEl = document.getElementById("meterRoom");
  const periodEl = document.getElementById("meterPeriod");
  const dateEl = document.getElementById("meterDate");
  const oldEl = document.getElementById("meterOld");
  const newEl = document.getElementById("meterNew");
  const priceEl = document.getElementById("meterUnitPrice");

  if (!listEl || !addBtn || !modal) {
    console.error("Thiếu element. Kiểm tra id trong chiso.html.");
    return;
  }

  // ===== Helpers =====
  const pad2 = (n) => String(n).padStart(2, "0");

  function formatVND(n) {
    return (Number(n) || 0).toLocaleString("vi-VN");
  }

  function formatDMY(isoDate) {
    // "2024-01-31" -> "31/01/2024"
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  }

  function defaultMeters() {
    return [
      {
        id: "m1",
        type: "DIEN",
        room: "Phòng 1",
        period: "2024-01",
        date: "2024-01-31",
        oldIndex: 120,
        newIndex: 150,
        unitPrice: 3500
      },
      {
        id: "m2",
        type: "NUOC",
        room: "Phòng 1",
        period: "2024-01",
        date: "2024-01-31",
        oldIndex: 20,
        newIndex: 28,
        unitPrice: 15000
      }
    ];
  }

  function loadMeters() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = defaultMeters();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    try {
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  }

  function saveMeters(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function calcConsumption(item) {
    return Math.max(0, Number(item.newIndex) - Number(item.oldIndex));
  }

  function calcAmount(item) {
    return calcConsumption(item) * (Number(item.unitPrice) || 0);
  }

  function badgeClass(type) {
    return type === "DIEN" ? "badge badge-electric" : "badge badge-water";
  }

  function badgeText(type) {
    return type === "DIEN" ? "Điện" : "Nước";
  }

  function unitText(type) {
    return type === "DIEN" ? "kWh" : "m³";
  }

  // ===== Modal =====
  function openModal() {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => periodEl?.focus(), 0);
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  function resetForm() {
    idEl.value = "";
    form.reset();
    // set mặc định
    typeEl.value = "DIEN";
    roomEl.value = "Phòng 1";
    // set ngày hôm nay
    const today = new Date();
    const iso = `${today.getFullYear()}-${pad2(today.getMonth()+1)}-${pad2(today.getDate())}`;
    dateEl.value = iso;
    // kỳ gợi ý theo tháng hiện tại
    periodEl.value = `${today.getFullYear()}-${pad2(today.getMonth()+1)}`;
  }

  // ===== Filter =====
  function applyFilter(list) {
    const t = (fType.value || "").trim();
    const r = (fRoom.value || "").trim();
    const p = (fPeriod.value || "").trim();

    return list.filter(x => {
      const okT = !t || x.type === t;
      const okR = !r || x.room === r;
      const okP = !p || x.period === p;
      return okT && okR && okP;
    });
  }

  // ===== Render =====
  function render() {
    const all = loadMeters();

    // sort: period desc, date desc
    all.sort((a, b) => {
      if (a.period !== b.period) return (b.period || "").localeCompare(a.period || "");
      return (b.date || "").localeCompare(a.date || "");
    });

    const filtered = applyFilter(all);

    if (filtered.length === 0) {
      listEl.innerHTML = "";
      emptyEl.style.display = "";
      return;
    }
    emptyEl.style.display = "none";

    listEl.innerHTML = filtered.map(item => {
      const cons = calcConsumption(item);
      const amount = calcAmount(item);

      return `
        <div class="meter-card" data-id="${item.id}">
          <div class="meter-head">
            <h3>${item.room}</h3>
            <span class="${badgeClass(item.type)}">${badgeText(item.type)}</span>
          </div>

          <div class="meter-body">
            <p><b>Kỳ:</b> ${item.period}</p>
            <p><b>Thời điểm ghi:</b> ${formatDMY(item.date)}</p>

            <p><b>Chỉ số cũ:</b> ${item.oldIndex}</p>
            <p><b>Chỉ số mới:</b> ${item.newIndex}</p>
            <p><b>Lượng tiêu thụ:</b> ${cons} ${unitText(item.type)}</p>

            <p><b>Đơn giá:</b> ${formatVND(item.unitPrice)} đ / ${unitText(item.type)}</p>
            <p class="total"><b>Thành tiền:</b> ${formatVND(amount)} đ</p>
          </div>

          <div class="meter-actions">
            <button class="btn-edit" type="button" data-action="edit">Sửa</button>
            <button class="btn-delete" type="button" data-action="delete">Xóa</button>
          </div>
        </div>
      `;
    }).join("");
  }

  // ===== Add =====
  addBtn.addEventListener("click", () => {
    resetForm();
    titleEl.textContent = "Thêm chỉ số";
    openModal();
  });

  // ===== Edit / Delete (delegation) =====
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const card = e.target.closest(".meter-card");
    if (!card) return;

    const id = card.getAttribute("data-id");
    const all = loadMeters();
    const found = all.find(x => x.id === id);
    if (!found) return;

    const action = btn.getAttribute("data-action");

    if (action === "edit") {
      titleEl.textContent = "Cập nhật chỉ số";
      idEl.value = found.id;
      typeEl.value = found.type;
      roomEl.value = found.room;
      periodEl.value = found.period;
      dateEl.value = found.date;
      oldEl.value = found.oldIndex;
      newEl.value = found.newIndex;
      priceEl.value = found.unitPrice;
      openModal();
      return;
    }

    if (action === "delete") {
      const ok = confirm(`Xóa chỉ số ${badgeText(found.type)} - ${found.room} (kỳ ${found.period}) ?`);
      if (!ok) return;
      const next = all.filter(x => x.id !== id);
      saveMeters(next);
      render();
    }
  });

  // ===== Save =====
  saveBtn.addEventListener("click", () => {
    const type = typeEl.value;
    const room = roomEl.value;
    const period = periodEl.value.trim();
    const date = dateEl.value;

    const oldIndex = Number(oldEl.value);
    const newIndex = Number(newEl.value);
    const unitPrice = Number(priceEl.value);

    if (!period) {
      alert("Vui lòng nhập kỳ (YYYY-MM).");
      periodEl.focus();
      return;
    }
    // validate YYYY-MM đơn giản
    if (!/^\d{4}-\d{2}$/.test(period)) {
      alert("Kỳ không đúng định dạng YYYY-MM (VD: 2025-06).");
      periodEl.focus();
      return;
    }

    if (!date) {
      alert("Vui lòng chọn thời điểm ghi.");
      dateEl.focus();
      return;
    }
    if (Number.isNaN(oldIndex) || oldIndex < 0) {
      alert("Chỉ số cũ không hợp lệ.");
      oldEl.focus();
      return;
    }
    if (Number.isNaN(newIndex) || newIndex < oldIndex) {
      alert("Chỉ số mới phải >= chỉ số cũ.");
      newEl.focus();
      return;
    }
    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      alert("Đơn giá không hợp lệ.");
      priceEl.focus();
      return;
    }

    const all = loadMeters();
    const editingId = idEl.value;

    if (editingId) {
      const idx = all.findIndex(x => x.id === editingId);
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          type, room, period, date,
          oldIndex, newIndex, unitPrice
        };
      }
      saveMeters(all);
    } else {
      const newItem = {
        id: "m" + Date.now(),
        type, room, period, date,
        oldIndex, newIndex, unitPrice
      };
      all.unshift(newItem);
      saveMeters(all);
    }

    closeModal();
    render();
  });

  // ===== Filters =====
  function resetFilters() {
    fType.value = "";
    fRoom.value = "";
    fPeriod.value = "";
    render();
  }
  fType.addEventListener("change", render);
  fRoom.addEventListener("change", render);
  fPeriod.addEventListener("input", render);
  resetBtn.addEventListener("click", resetFilters);

  // ===== Close modal =====
  backdrop.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
  });

  // ===== Init =====
  render();
});