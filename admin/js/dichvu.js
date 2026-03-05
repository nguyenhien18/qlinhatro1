// js/dichvu.js
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "admin_services";

  // ===== DOM =====
  const serviceList = document.getElementById("serviceList");
  const addBtn = document.getElementById("addServiceBtn");

  const modal = document.getElementById("serviceModal");
  const backdrop = document.getElementById("serviceBackdrop");
  const closeBtn = document.getElementById("serviceClose");
  const cancelBtn = document.getElementById("serviceCancel");
  const saveBtn = document.getElementById("serviceSave");

  const titleEl = document.getElementById("serviceTitle");
  const form = document.getElementById("serviceForm");

  const idEl = document.getElementById("serviceId");
  const nameEl = document.getElementById("serviceName");
  const priceEl = document.getElementById("servicePrice");
  const unitEl = document.getElementById("serviceUnit");

  // ===== Safe check =====
  if (!serviceList || !addBtn || !modal) {
    console.error("Thiếu element. Kiểm tra id trong HTML (serviceList/addServiceBtn/serviceModal).");
    return;
  }

  // ===== Data =====
  function defaultServices() {
    return [
      { id: "s1", name: "Điện", price: 3500, unit: "/ kWh" },
      { id: "s2", name: "Nước", price: 15000, unit: "/ m³" },
      { id: "s3", name: "Wifi", price: 50000, unit: "/ tháng" },
    ];
  }

  function loadServices() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = defaultServices();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    try {
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  }

  function saveServices(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function formatVND(n) {
    return (Number(n) || 0).toLocaleString("vi-VN");
  }

  // ===== Render =====
  function render() {
    const services = loadServices();

    if (services.length === 0) {
      serviceList.innerHTML = `<div class="card">Chưa có dịch vụ nào.</div>`;
      return;
    }

    serviceList.innerHTML = services
      .map(
        (s) => `
        <div class="service-card" data-id="${s.id}">
          <h3>${s.name}</h3>
          <p><b>Giá dịch vụ:</b> ${formatVND(s.price)} đ ${s.unit ? s.unit : ""}</p>
          <div class="service-actions">
            <button class="btn-edit" type="button" data-action="edit">Sửa</button>
            <button class="btn-delete" type="button" data-action="delete">Xóa</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  // ===== Modal helpers =====
  function openModal() {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    // focus input đầu
    setTimeout(() => nameEl?.focus(), 0);
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  function resetForm() {
    idEl.value = "";
    form.reset();
  }

  // ===== Add =====
  addBtn.addEventListener("click", () => {
    resetForm();
    titleEl.textContent = "Thêm dịch vụ mới";
    openModal();
  });

  // ===== Edit / Delete (event delegation) =====
  serviceList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const card = e.target.closest(".service-card");
    if (!card) return;

    const id = card.getAttribute("data-id");
    const services = loadServices();
    const found = services.find((x) => x.id === id);
    if (!found) return;

    const action = btn.getAttribute("data-action");

    if (action === "edit") {
      titleEl.textContent = "Cập nhật dịch vụ";
      idEl.value = found.id;
      nameEl.value = found.name;
      priceEl.value = found.price;
      unitEl.value = found.unit || "";
      openModal();
      return;
    }

    if (action === "delete") {
      const ok = confirm(`Xóa dịch vụ "${found.name}" ?`);
      if (!ok) return;

      const next = services.filter((x) => x.id !== id);
      saveServices(next);
      render();
      return;
    }
  });

  // ===== Save (add/update) =====
  saveBtn.addEventListener("click", () => {
    // validate nhanh
    const name = nameEl.value.trim();
    const price = Number(priceEl.value);
    const unit = unitEl.value.trim();

    if (!name) {
      alert("Vui lòng nhập tên dịch vụ.");
      nameEl.focus();
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      alert("Giá không hợp lệ.");
      priceEl.focus();
      return;
    }

    const services = loadServices();
    const editingId = idEl.value;

    if (editingId) {
      // update
      const idx = services.findIndex((x) => x.id === editingId);
      if (idx >= 0) {
        services[idx] = { ...services[idx], name, price, unit };
      }
      saveServices(services);
    } else {
      // add new
      const newItem = {
        id: "s" + Date.now(),
        name,
        price,
        unit,
      };
      services.unshift(newItem);
      saveServices(services);
    }

    closeModal();
    render();
  });

  // ===== Close events =====
  backdrop.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
  });

  // ===== Init =====
  render();
});