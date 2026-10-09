(function () {
  // BAGIAN: KONFIGURASI DAN UTILITAS | Menentukan key LocalStorage, format Rupiah, serta fungsi baca/tulis cart yang juga menyinkronkan pilihan ke Trip Planner.
  const cartKey = "eksploreSumbaCart";
  const cartInitKey = "eksploreSumbaCartInitialized";
  const planKey = "eksploreSumbaPlan";
  const rp = value => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);

  const getCart = () => JSON.parse(localStorage.getItem(cartKey) || "[]");
  const setCart = value => {
    localStorage.setItem(cartKey, JSON.stringify(value));
    localStorage.setItem(cartInitKey, "1");
    const supported = new Set(["walakiri", "waingapu", "lambanapu", "londa", "wairinding"]);
    const selected = value
      .map(entry => entry.id === "horse" ? "wairinding" : entry.id)
      .filter(id => supported.has(id));
    if (selected.length) {
      const saved = JSON.parse(localStorage.getItem("exploreSumbaTripPlan") || "{}");
      saved.selectedDestinations = [...new Set([...(saved.selectedDestinations || []), ...selected])];
      localStorage.setItem("exploreSumbaTripPlan", JSON.stringify(saved));
    }
  };
  const detailProducts = Object.values(detailDestinations).flatMap(item => item.products || []);
  const allItems = [...destinations, ...homePopular, ...umkmProducts, ...detailProducts];

  // BAGIAN: PENCARIAN DATA | Mencari item berdasarkan ID dari detailDestinations atau gabungan seluruh array produk.
  function findItem(id) {
    const detail = detailDestinations[id];
    if (detail) return detail;
    return allItems.find(item => item.id === id) || detailDestinations.londa;
  }

  // BAGIAN: BACA DAN SIMPAN RENCANA | Menggabungkan data LocalStorage dengan tripDefaults agar field yang belum ada tetap memiliki nilai awal.
  function getPlan() {
    const saved = JSON.parse(localStorage.getItem(planKey) || "null");
    return {
      ...tripDefaults,
      status: "Draft",
      note: "",
      budget: "Menengah",
      payment: "Transfer Bank",
      ...saved
    };
  }

  function savePlan(plan) {
    localStorage.setItem(planKey, JSON.stringify(plan));
  }

  // BAGIAN: NOTIFIKASI DAN CART AWAL | Menampilkan toast dan menyediakan cart contoh hanya jika pengguna belum pernah menginisialisasi cart.
  function showToast(message) {
    const el = document.querySelector("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => el.classList.remove("show"), 1900);
  }

  function ensureCart() {
    const current = getCart();
    if (current.length || localStorage.getItem(cartInitKey)) return current;
    const initial = [
      { id: "londa", qty: 2 },
      { id: "lambanapu", qty: 2 },
      { id: "wairinding", qty: 2 },
      { id: "walakiri", qty: 2 }
    ];
    setCart(initial);
    return initial;
  }

  // BAGIAN: PERHITUNGAN BIAYA | Menghitung aktivitas, transportasi, penginapan, makan, biaya layanan, dan total perjalanan.
  function activitySubtotal(cart) {
    return cart.reduce((sum, entry) => sum + findItem(entry.id).price * entry.qty, 0);
  }

  function costs(cart, plan) {
    if (!cart.length) {
      return { activities: 0, transport: 0, accommodation: 0, meals: 0, service: 0, total: 0 };
    }
    const activities = activitySubtotal(cart);
    const transport = plan.transport === "Mobil pribadi" ? 350000 : 900000;
    const accommodation = plan.accommodationPerNight * plan.nights;
    const meals = plan.mealPerPersonPerDay * plan.adults * plan.days;
    const subtotal = activities + transport + accommodation + meals;
    const service = Math.round(subtotal * plan.serviceRate);
    return { activities, transport, accommodation, meals, service, total: subtotal + service };
  }

  // BAGIAN: HELPER ASSET DAN CARD | Menentukan path gambar/icon serta membuat card kecil yang digunakan ulang pada halaman detail.
  function detailImage(item) {
    return `assets/${item.img}`;
  }

  function asset(path) {
    return `assets/${path}`;
  }

  function iconAsset(folder, name) {
    return `assets/icons/${folder}/${name}`;
  }

  function sectionIcon(folder, name, alt = "") {
    return `<img class="section-icon" src="${iconAsset(folder, name)}" alt="${alt}">`;
  }

  function simpleCard(item) {
    return `<article class="item-card">
      <a href="detail.html?id=${encodeURIComponent(item.id)}"><img src="${detailImage(item)}" alt="${item.name}"></a>
      <div class="item-body"><h3>${item.name}</h3><p>${item.subtitle || item.location || ""}</p>
      ${item.rating ? `<p><span class="star">★</span> ${item.rating} (${item.reviews})</p>` : ""}
      <div class="price">${rp(item.price)} <small>/ ${item.unit || "orang"}</small></div>
      <div class="card-actions"><a class="mini-btn" href="detail.html?id=${encodeURIComponent(item.id)}">Detail</a><button class="mini-btn orange" type="button" data-simple-add="${item.id}">Tambah Trip</button></div></div>
    </article>`;
  }

  // BAGIAN: HALAMAN DETAIL | Membaca parameter URL, mengambil object destinasi dari data.js, merender informasi lengkap, lalu mengaktifkan galeri, cart, dan peta.
  function renderDetail() {
    const root = document.querySelector("#detailContent");
    if (!root) return;
    const requestedId = new URLSearchParams(location.search).get("id") || "londa";
    const aliases = { horse: "wairinding", dig: "lambanapu" };
    const id = aliases[requestedId] || requestedId;
    const source = detailDestinations[id] || findItem(id);
    const item = {
      category: source.category || source.type || "Pengalaman Lokal",
      location: source.location || source.subtitle || "Sumba Timur",
      description: source.description || `${source.name} merupakan salah satu pilihan pengalaman perjalanan di Sumba Timur yang dapat ditambahkan ke rencana Anda.`,
      tags: source.tags || [source.type || source.category || "Lokal", "Pilihan Traveler", "Sumba Timur"],
      hours: source.hours || "Konfirmasi dengan pengelola",
      duration: source.duration || "Menyesuaikan aktivitas",
      access: source.access || "Informasi tersedia saat pemesanan",
      facilities: source.facilities || "Menyesuaikan lokasi",
      guide: source.guide || "Dapat diminta",
      weather: source.weather || "Periksa sebelum berangkat",
      distance: source.distance || "Menyesuaikan titik keberangkatan",
      rating: source.rating || "Baru",
      reviews: source.reviews || 0,
      ...source
    };
    document.title = `${item.name} - Explore Sumba Timur`;
    const gallery = item.gallery || [item.img, item.img, item.img, item.img];
    const mainImage = gallery[0];
    const thumbs = gallery.slice(1, 4);
    const products = item.products || umkmProducts;
    const experienceIcons = item.experienceIcons || ["Map.svg", "Star.svg", "Camera.svg", "User Male.svg"];
    const reviewNames = ["Rina M", "Dedi K", "Intan S"];
    const similarItems = Object.values(detailDestinations).filter(value => value.id !== item.id).slice(0, 4).map((value, index) => ({
      ...value,
      img: item.similarImages?.[index] || value.img
    }));
    root.innerHTML = `
      <section class="detail-top">
        <div class="detail-gallery">
          <img class="detail-main-img" src="${asset(mainImage)}" alt="${item.name}">
          <div>${thumbs.map((src, index) => `<button class="gallery-thumb${index === 0 ? " active" : ""}" type="button" data-gallery-src="${asset(src)}"><img src="${asset(src)}" alt="${item.name} foto ${index + 2}"></button>`).join("")}</div>
        </div>
        <article class="detail-panel">
          <span class="outline-badge">${item.category}</span>
          <h1>${item.name}</h1>
          <h3><i class="ui-icon pin active"></i>${item.location}, Sumba Timur</h3>
          <p class="rating"><b>★</b> <strong>${item.rating}</strong> (${item.reviews} ulasan)</p>
          <h2>${rp(item.price)} <small>/ orang</small></h2>
          <p>${item.description}</p>
          <div class="chips">${item.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
          <div class="detail-actions">
            <button class="btn primary" type="button" data-detail-add="${item.id}">Tambah ke Rencana</button>
            <a class="btn secondary" href="explore.html">Kembali ke Explore</a>
          </div>
        </article>
      </section>

      <section class="detail-info-grid">
        <article><h2>Tentang Destinasi</h2><p>${item.description} Informasi disusun agar pengunjung dapat merencanakan perjalanan secara jelas dan bertanggung jawab.</p></article>
        <article><h2>Highlight Pengalaman</h2><div class="highlight-list">${item.tags.slice(0,4).map((tag,index) => `<span><img src="${iconAsset(item.iconFolder || "detail prailiu", experienceIcons[index] || experienceIcons[0])}" alt=""><b>${tag}</b></span>`).join("")}</div></article>
        <article><h2>Informasi Penting</h2><div class="facts">
          <span>Jam terbaik<br><b>${item.hours}</b></span>
          <span>Durasi kunjungan<br><b>${item.duration}</b></span>
          <span>Akses jalan<br><b>${item.access}</b></span>
          <span>Fasilitas<br><b>${item.facilities}</b></span>
          <span>Guide tersedia<br><b>${item.guide}</b></span>
          <span>Estimasi cuaca<br><b>${item.weather}</b></span>
        </div></article>
        <article><h2>Lokasi & Akses</h2><div class="map-card">
          ${item.mapImage ? `<img class="detail-map-image" src="${asset(item.mapImage)}" alt="Peta lokasi ${item.name}">` : `<div class="map-placeholder"><strong>${item.name}</strong><span>${item.location}</span></div>`}
          <p>Dari Waingapu: ${item.distance}, menggunakan kendaraan pribadi.</p>
          <button class="btn secondary" type="button" data-map>Buka Google Maps</button>
        </div></article>
      </section>

      <section class="white-section"><div class="section-head"><h2>Produk UMKM & Aksesori Lokal</h2><a href="explore.html">Lihat Semua Produk ›</a></div><div class="card-grid four">${products.map(simpleCard).join("")}</div></section>
      <section class="white-section split-review">
        <article><h2>Yang termasuk</h2><p>✓ Tiket masuk destinasi</p><p>✓ Akses area wisata</p><p>✓ Parkir kendaraan</p></article>
        <article><h2>Tidak termasuk</h2><p>⊗ Transportasi menuju lokasi</p><p>⊗ Makan dan minuman</p><p>⊗ Pengeluaran pribadi</p></article>
        <article><div class="section-head"><h2>Ulasan Pengunjung</h2><a href="contact.html">Lihat Semua Ulasan ›</a></div><div class="review-row">${reviewNames.map((name,index) => `<span>${item.reviewAvatars?.[index] ? `<img src="${asset(item.reviewAvatars[index])}" alt="${name}">` : ""}<b>${name}</b><small>★★★★★</small><p>Pengalaman yang nyaman, informatif, dan layak dikunjungi kembali.</p></span>`).join("")}</div></article>
      </section>
      <section class="white-section"><div class="section-head"><h2>Destinasi Serupa</h2><a href="explore.html">Lihat Semua Destinasi ›</a></div><div class="card-grid four">${similarItems.map(simpleCard).join("")}</div></section>`;

    document.querySelector("[data-detail-add]").addEventListener("click", () => {
      const cart = getCart();
      const existing = cart.find(entry => entry.id === item.id);
      if (existing) existing.qty += 1;
      else cart.push({ id: item.id, qty: 1 });
      setCart(cart);
      showToast(`${item.name} ditambahkan ke Trip Planner`);
    });
    document.querySelectorAll("[data-simple-add]").forEach(button => button.addEventListener("click", () => {
      const cart = getCart();
      const existing = cart.find(entry => entry.id === button.dataset.simpleAdd);
      if (existing) existing.qty += 1;
      else cart.push({ id: button.dataset.simpleAdd, qty: 1 });
      setCart(cart);
      showToast("Item ditambahkan ke rencana.");
    }));
    document.querySelectorAll("[data-gallery-src]").forEach(button => button.addEventListener("click", () => {
      document.querySelector(".detail-main-img").src = button.dataset.gallerySrc;
      document.querySelectorAll(".gallery-thumb").forEach(thumb => thumb.classList.toggle("active", thumb === button));
    }));
    document.querySelector("[data-map]").addEventListener("click", () => {
      const query = encodeURIComponent(`${item.name}, ${item.location}, Sumba Timur`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener");
    });
  }

  // BAGIAN: KOMPONEN QUANTITY DAN BARIS PLANNER | Membuat tombol jumlah, daftar item, dan rincian biaya untuk planner versi extended.
  function quantity(entry) {
    return `<div class="quantity-control">
      <button type="button" data-quantity="${entry.id}" data-change="-1" aria-label="Kurangi jumlah">−</button>
      <span>${entry.qty}</span>
      <button type="button" data-quantity="${entry.id}" data-change="1" aria-label="Tambah jumlah">+</button>
    </div>`;
  }

  function plannerRows(cart) {
    return cart.map(entry => {
      const item = findItem(entry.id);
      return `<article class="planner-item">
        <img src="${detailImage(item)}" alt="${item.name}">
        <div><h3>${item.name}</h3><p>${item.category || item.type || "Destinasi"}</p></div>
        <strong>${rp(item.price)} <small>/ orang</small></strong>
        ${quantity(entry)}
      </article>`;
    }).join("");
  }

  function costRows(cost, plan) {
    return `
      <div class="summary-row"><span>Aktivitas</span><strong>${rp(cost.activities)}</strong></div>
      <div class="summary-row"><span>Transportasi</span><strong>${rp(cost.transport)}</strong></div>
      <div class="summary-row"><span>Akomodasi (${plan.nights} malam)</span><strong>${rp(cost.accommodation)}</strong></div>
      <div class="summary-row"><span>Makan (${plan.days} hari)</span><strong>${rp(cost.meals)}</strong></div>
      <div class="summary-row"><span>Biaya layanan ${Math.round(plan.serviceRate * 100)}%</span><strong>${rp(cost.service)}</strong></div>`;
  }

  function bindQuantity(render) {
    document.querySelectorAll("[data-quantity]").forEach(button => {
      button.addEventListener("click", () => {
        const cart = getCart();
        const entry = cart.find(item => item.id === button.dataset.quantity);
        if (!entry) return;
        entry.qty = Math.max(1, entry.qty + Number(button.dataset.change));
        setCart(cart);
        render();
      });
    });
  }

  // BAGIAN: TRIP PLANNER LEGACY | Membuat planner lama dari cart dan plan. Pada planner.html hasil ini kemudian dapat digantikan planner-v2.js.
  function renderPlanner() {
    const root = document.querySelector("#plannerContent");
    if (!root) return;
    if (window.ExplorePlannerV2) return;
    const cart = ensureCart();
    const plan = getPlan();
    const cost = costs(cart, plan);
    root.innerHTML = `
      <section class="planner-steps white-section">
        ${["Pilih Kategori", "Pilih Item", "Jadwal & Traveler", "Konfirmasi"].map((label, index) => `<div class="${index === 0 ? "active" : ""}"><b>${index + 1}</b><span>${label}</span></div>`).join("")}
      </section>
      <section class="planner-workspace">
        <article class="planner-form white-section">
          <h2>${sectionIcon("trip planner","Activity.svg")}1. Item yang Dipilih</h2>
          <div>${plannerRows(cart)}</div>
          <a class="planner-add" href="explore.html">+ Tambah Item Lain</a>
          <h2>${sectionIcon("trip planner","Calendar.svg")}2. Jadwal Perjalanan</h2>
          <div class="planner-fields two">
            <label>Tanggal mulai<input type="date" id="planStart" value="${plan.startDate}"></label>
            <label>Tanggal selesai<input type="date" id="planEnd" value="${plan.endDate}"></label>
          </div>
          <h2>${sectionIcon("trip planner","Person.svg")}3. Traveler</h2>
          <div class="traveler-fields">
            <label>Dewasa<input type="number" id="planAdults" min="1" value="${plan.adults}"></label>
            <label>Anak<input type="number" id="planChildren" min="0" value="${plan.children || 0}"></label>
            <label>Balita<input type="number" id="planInfants" min="0" value="${plan.infants || 0}"></label>
            <label>Senior<input type="number" id="planSeniors" min="0" value="${plan.seniors || 0}"></label>
          </div>
          <h2>${sectionIcon("trip planner","Transportation.svg")}4. Preferensi Transportasi</h2>
          <select id="planTransport"><option ${plan.transport === "Mobil pribadi" ? "selected" : ""}>Mobil pribadi</option><option ${plan.transport === "Mobil sewa + sopir" ? "selected" : ""}>Mobil sewa + sopir</option></select>
          <h2>${sectionIcon("trip planner","Bookmark.svg")}5. Preferensi Budget</h2>
          <div class="budget-options">${["Hemat", "Menengah", "Nyaman", "Premium"].map(value => `<button type="button" class="${plan.budget === value ? "active" : ""}" data-budget="${value}">${value}</button>`).join("")}</div>
          <h2>${sectionIcon("trip planner","Timeline Week.svg")}6. Catatan</h2>
          <textarea id="planNote" maxlength="300" placeholder="Tuliskan catatan atau permintaan khusus">${plan.note}</textarea>
        </article>
        <aside class="planner-summary white-section">
          <h2>Ringkasan Trip Plan</h2>
          <p><strong>${cart.length} item terpilih</strong></p>
          ${cart.map(entry => { const item = findItem(entry.id); return `<div class="summary-item"><img src="${detailImage(item)}" alt=""><span><strong>${item.name}</strong><small>${entry.qty} orang</small></span><b>${rp(item.price * entry.qty)}</b></div>`; }).join("")}
          <h3>Estimasi Biaya</h3>${costRows(cost, plan)}
          <div class="planner-total"><span>Total estimasi</span><strong>${rp(cost.total)}</strong></div>
          <button class="btn primary full" type="button" id="confirmPlan">Lanjutkan ke Konfirmasi</button>
          <button class="btn secondary full" type="button" id="savePlan">Simpan Trip Plan</button>
        </aside>
      </section>`;

    bindQuantity(renderPlanner);
    const updatePlan = () => {
      const next = getPlan();
      next.startDate = document.querySelector("#planStart").value;
      next.endDate = document.querySelector("#planEnd").value;
      const start = new Date(`${next.startDate}T00:00:00`);
      const end = new Date(`${next.endDate}T00:00:00`);
      if (!next.startDate || !next.endDate || end < start) {
        showToast("Tanggal selesai harus sama dengan atau setelah tanggal mulai.");
        return null;
      }
      next.days = Math.max(1, Math.round((end - start) / 86400000) + 1);
      next.nights = Math.max(0, next.days - 1);
      next.adults = Math.max(1, Number(document.querySelector("#planAdults").value));
      next.children = Math.max(0, Number(document.querySelector("#planChildren").value));
      next.infants = Math.max(0, Number(document.querySelector("#planInfants").value));
      next.seniors = Math.max(0, Number(document.querySelector("#planSeniors").value));
      next.transport = document.querySelector("#planTransport").value;
      next.note = document.querySelector("#planNote").value;
      return next;
    };
    document.querySelectorAll("[data-budget]").forEach(button => button.addEventListener("click", () => {
      const next = updatePlan();
      if (!next) return;
      next.budget = button.dataset.budget;
      savePlan(next);
      renderPlanner();
    }));
    document.querySelector("#savePlan").addEventListener("click", () => {
      const next = updatePlan();
      if (!next) return;
      next.status = "Draft";
      savePlan(next);
      showToast("Trip Plan berhasil disimpan sebagai draft.");
    });
    document.querySelector("#confirmPlan").addEventListener("click", () => {
      if (!getCart().length) {
        showToast("Tambahkan setidaknya satu item sebelum melanjutkan.");
        return;
      }
      const next = updatePlan();
      if (!next) return;
      next.status = "Siap dipesan";
      savePlan(next);
      location.href = "my-trip.html";
    });
    document.querySelectorAll("#planStart, #planEnd, #planAdults, #planChildren, #planInfants, #planSeniors, #planTransport").forEach(field => {
      field.addEventListener("change", () => {
        const next = updatePlan();
        if (!next) return;
        savePlan(next);
        renderPlanner();
      });
    });
  }

  // BAGIAN: HALAMAN MY TRIP | Membaca data yang sama dari LocalStorage dan menyajikan itinerary, ringkasan booking, catatan, serta metode pembayaran.
  function renderMyTrip() {
    const root = document.querySelector("#myTripContent");
    if (!root) return;
    const cart = getCart();
    const plan = getPlan();
    const cost = costs(cart, plan);
    const startDate = new Date(`${plan.startDate}T00:00:00`);
    const endDate = new Date(`${plan.endDate}T00:00:00`);
    const formatDate = value => new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(value);
    const tripDate = index => {
      const value = new Date(startDate);
      value.setDate(value.getDate() + Math.min(index, Math.max(0, plan.days - 1)));
      return formatDate(value);
    };
    if (!cart.length) {
      root.innerHTML = `<section class="empty-state white-section"><h1>My Trip masih kosong</h1><p>Pilih destinasi di halaman Explore dan tambahkan ke Trip Planner.</p><a class="btn primary" href="explore.html">Cari Destinasi</a></section>`;
      return;
    }
    root.innerHTML = `
      <div class="planner-title"><div><p>Rencana tersimpan</p><h1>My Trip</h1><span>Kelola itinerary dan rincian perjalanan Anda di Sumba Timur.</span></div><a class="btn primary" href="explore.html">+ Tambah Item</a></div>
      <section class="planner-workspace">
        <article class="planner-form white-section"><h2>${sectionIcon("my trip","Installment Plan.svg")}Rencana Perjalanan Saya</h2>
          ${cart.map((entry, index) => { const item = findItem(entry.id); return `<article class="my-trip-item"><img src="${detailImage(item)}" alt="${item.name}"><div><span class="day-badge">Hari ${Math.min(index + 1, plan.days)}</span><h3>${item.name}</h3><p>${item.location || item.subtitle}<br>${tripDate(index)} · ${entry.qty} orang</p></div><strong>${rp(item.price)}<small>/ orang</small></strong>${quantity(entry)}</article>`; }).join("")}
          <div class="planner-total"><span>Total aktivitas</span><strong>${rp(cost.activities)}</strong></div>
        </article>
        <aside class="planner-summary white-section"><h2>Ringkasan Booking</h2>
          <div class="summary-row"><span>Total item</span><strong>${cart.length} aktivitas</strong></div>
          <div class="summary-row"><span>Status</span><b class="status-badge">${plan.status}</b></div>
          <h3>${sectionIcon("my trip","Location.svg")}Rute Perjalanan</h3><ol>${cart.map((entry,index) => `<li><strong>Hari ${index + 1}</strong><p>${findItem(entry.id).name}</p></li>`).join("")}</ol>
          <h3>Detail Traveler</h3><p>${plan.adults} dewasa${plan.children ? `, ${plan.children} anak` : ""}${plan.infants ? `, ${plan.infants} balita` : ""}${plan.seniors ? `, ${plan.seniors} senior` : ""}</p><h3>Tanggal Perjalanan</h3><p>${formatDate(startDate)} - ${formatDate(endDate)}</p>
          <div class="planner-total"><span>Total estimasi</span><strong>${rp(cost.total)}</strong></div>
          <a class="btn secondary full" href="planner.html">${sectionIcon("my trip","Edit.svg")}Edit Plan</a>
          <button class="btn primary full" type="button" id="bookTrip">Lanjutkan Booking</button>
          <button class="clear-plan" type="button" id="clearPlan">Kosongkan Rencana</button>
        </aside>
      </section>
      <section class="planner-bottom">
        <article class="white-section"><h2>${sectionIcon("my trip","Edit-1.svg")}Catatan Perjalanan</h2><textarea id="tripNote" maxlength="500" placeholder="Tuliskan catatan perjalanan">${plan.note}</textarea><button class="btn primary" type="button" id="saveTripNote">Simpan Catatan</button></article>
        <article class="white-section"><h2>${sectionIcon("my trip","Handle With Care.svg")}Metode Pembayaran</h2>${["Transfer Bank", "Kartu Kredit / Debit", "E-Wallet"].map((value,index) => `<label class="payment-option"><input type="radio" name="payment" value="${value}" ${plan.payment === value || (!plan.payment && index === 0) ? "checked" : ""}><span><strong>${value}</strong><small>${index === 0 ? "Transfer ke rekening resmi" : "Pembayaran aman dan terverifikasi"}</small></span></label>`).join("")}</article>
      </section>`;
    bindQuantity(renderMyTrip);
    document.querySelector("#saveTripNote").addEventListener("click", () => {
      const next = getPlan();
      next.note = document.querySelector("#tripNote").value;
      savePlan(next);
      showToast("Catatan perjalanan berhasil disimpan.");
    });
    document.querySelector("#bookTrip").addEventListener("click", () => {
      const next = getPlan();
      next.status = "Menunggu pembayaran";
      next.payment = document.querySelector('input[name="payment"]:checked').value;
      savePlan(next);
      renderMyTrip();
      showToast("Status booking diperbarui: menunggu pembayaran.");
    });
    document.querySelector("#clearPlan").addEventListener("click", () => {
      if (!window.confirm("Kosongkan seluruh rencana perjalanan?")) return;
      setCart([]);
      renderMyTrip();
      showToast("Rencana perjalanan dikosongkan.");
    });
  }

  // BAGIAN: HALAMAN ABOUT | Membuat profil platform, nilai utama, anggota tim, testimoni, dan ajakan perjalanan secara dinamis.
  function renderAbout() {
    const root = document.querySelector("#aboutContent");
    if (!root) return;
    const team = [
      ["Putri","Marketing Lead","about/Ellipse 101.png"],["Ocaa","Marketing Lead","about/Ellipse 102.png"],
      ["Santi","Marketing Lead","about/Ellipse 104.png"],["Nina","Marketing Lead","about/Ellipse 105.png"],
      ["Agnes","Marketing Lead","about/Ellipse 106.png"],["Satria","Marketing Lead","about/Ellipse 107.png"],
      ["Anas","Marketing Lead","about/Ellipse 108.png"],["Yudho","Founder & CEO","about/Ellipse 109.png"]
    ];
    const values = [
      ["Protect.svg","Aman & Terpercaya","Keamanan dan kenyamanan Anda adalah prioritas kami."],
      ["People.svg","Lokal & Autentik","Kami mendukung dan mengangkat potensi lokal."],
      ["Handmade.svg","Berdampak Nyata","Perjalanan Anda memberi manfaat bagi komunitas."],
      ["Price Tag.svg","Harga Transparan","Informasi dan harga yang jelas tanpa biaya tersembunyi."],
      ["Headset.svg","Dukungan 24/7","Kami siap membantu Anda kapan pun dibutuhkan."]
    ];
    const testimonials = [
      ["about/Ellipse 110.png","Valkyrie Sinclair","Skotlandia","The best experience exploring East Sumba! Everything was well organized and very authentic."],
      ["about/Ellipse 111.png","Liam Rider","Amerika Serikat","The people are friendly, the guides are amazing, and the place is absolutely amazing."],
      ["about/Ellipse 112.png","Sierra Fletcher","Afrika","The ikat weaving is beautiful and the story behind it is very meaningful. I will definitely be back!"]
    ];
    root.innerHTML = `
      <section class="about-hero">
        <div class="about-intro"><h1>Tentang Explore Sumba Timur</h1><p>Explore Sumba Timur adalah platform perjalanan yang menghubungkan Anda dengan keindahan, budaya, dan masyarakat lokal Sumba Timur secara autentik dan bertanggung jawab.</p><p>Kami percaya bahwa setiap perjalanan dapat memberikan pengalaman bermakna, mendukung ekonomi lokal, serta menjaga kelestarian alam dan budaya.</p></div>
        <article class="about-sumba-card"><img src="assets/about/image 6.png" alt="Tim Explore bersama masyarakat Sumba Timur"><div><h2>Sumba Timur</h2><p>Tanah tradisi dan keindahan alami yang masih terjaga. Rumah bagi budaya Marapu, kain tenun ikat yang mendunia, dan keramahan masyarakat yang tulus.</p><div class="about-tags"><span>Budaya Marapu</span><span>Tenun Ikat</span><span>Alam Lestari</span></div></div></article>
      </section>
      <section class="about-values">${[["People.svg","Lokal & Autentik","Pengalaman asli bersama masyarakat lokal"],["Protect.svg","Aman & Terpercaya","Mitra terverifikasi dan dukungan perjalanan"],["Handmade.svg","Berdampak Nyata","Perjalanan memberi manfaat bagi komunitas"]].map(value => `<article class="white-section">${sectionIcon("about",value[0])}<div><h3>${value[1]}</h3><p>${value[2]}</p></div></article>`).join("")}</section>
      <section class="about-columns">
        <article class="white-section about-story"><h2>Cerita Kami</h2><p>Berawal dari kecintaan kami pada Sumba Timur, kami melihat potensi besar pariwisata yang belum terkelola dengan baik dan belum memberikan dampak maksimal bagi masyarakat lokal.</p><p>Melalui Explore Sumba Timur, kami ingin menjadi jembatan antara wisatawan dan komunitas lokal untuk menciptakan perjalanan yang bermakna, bertanggung jawab, dan berkelanjutan.</p><p>Terima kasih telah menjadi bagian dari perjalanan ini. Mari bersama menjaga dan merayakan keindahan Sumba Timur.</p></article>
        <article class="white-section">${sectionIcon("about","Eye.svg")}<h2>Visi</h2><p>Menjadi platform perjalanan terdepan yang menghadirkan pengalaman autentik di Sumba Timur dan memberikan dampak positif bagi masyarakat lokal serta kelestarian budaya.</p></article>
        <article class="white-section">${sectionIcon("about","Goal.svg")}<h2>Misi</h2><ul><li>Menghubungkan wisatawan dengan pengalaman lokal yang autentik.</li><li>Mendorong pertumbuhan ekonomi masyarakat lokal.</li><li>Menjaga kelestarian alam dan budaya Sumba Timur.</li><li>Memberikan layanan perjalanan yang aman, mudah, dan terpercaya.</li></ul></article>
      </section>
      <section class="about-section"><h2>Nilai-Nilai Kami</h2><div class="about-value-grid">${values.map(value => `<article>${sectionIcon("about",value[0])}<div><h3>${value[1]}</h3><p>${value[2]}</p></div></article>`).join("")}</div></section>
      <section class="about-stats white-section">${[["50+","Destinasi & Aktivitas"],["120+","Partner Lokal"],["8.000+","Wisatawan Puas"],["150+","Pengalaman Unik"],["★ 4.0/5","Rata-rata Ulasan"]].map(value => `<div><strong>${value[0]}</strong><span>${value[1]}</span></div>`).join("")}</section>
      <section class="about-section"><h2>Tim Kami</h2><div class="team-grid">${team.map(value => `<article class="team-card white-section"><img src="${asset(value[2])}" alt="${value[0]}"><h3>${value[0]}</h3><p>${value[1]}</p><div class="team-social">${sectionIcon("about","instagram logo.svg")}${sectionIcon("about","WhatsApp_logo-color-vertical logo.svg")}${sectionIcon("about","gmail logo.svg")}</div></article>`).join("")}</div></section>
      <section class="about-section about-culture"><h2>Budaya & Produk Lokal</h2><div class="culture-layout"><div class="culture-gallery"><img class="culture-main" src="assets/eksplore/market-tenun.jpg.jpg" alt="Kain tenun Sumba"><img src="assets/detailprailiu/umkm-mamuli.jpg.jpg" alt="Kerajinan lokal"><img src="assets/detail bukit wairinding/Rectangle 481.png" alt="Madu Sumba"><img src="assets/home/card-prailiu.jpg.jpg" alt="Rumah adat Sumba"><img src="assets/detail bukit wairinding/Rectangle 483.png" alt="Aksesori lokal"></div><div class="culture-points">${[["People-2.svg","Lestarikan Budaya","Kami mendukung pelestarian tenun ikat, tradisi Marapu, dan kearifan lokal."],["Product.svg","Dukung Produk Lokal","Setiap pembelian produk lokal membantu pengrajin dan UMKM di desa-desa Sumba Timur."],["Police Badge.svg","Pariwisata Bertanggung Jawab","Kami berkomitmen menjaga lingkungan dan menghargai budaya setiap tempat."]].map(value => `<article>${sectionIcon("about",value[0])}<div><h3>${value[1]}</h3><p>${value[2]}</p></div></article>`).join("")}</div></div></section>
      <section class="about-section"><h2>Apa Kata Mereka?</h2><div class="testimonial-grid">${testimonials.map(value => `<article><div class="testimonial-stars">★★★★★</div><p>“${value[3]}”</p><div class="testimonial-person"><img src="${asset(value[0])}" alt="${value[1]}"><span><b>${value[1]}</b><small>${value[2]}</small></span></div></article>`).join("")}</div></section>
      <section class="about-cta">${sectionIcon("contact","Location.svg")}<div><h2>Siap Menjelajahi Sumba Timur?</h2><p>Temukan pengalaman autentik dan ciptakan kenangan tak terlupakan bersama kami.</p></div><a class="btn primary" href="planner.html">Rencanakan Perjalanan Anda</a></section>
      <section class="service-strip about-trust"><article>${sectionIcon("about","Protect.svg")}<div><h3>Aman & Terpercaya</h3><p>Pemesanan nyaman dengan ulasan yang baik.</p></div></article><article>${sectionIcon("about","Price Tag.svg")}<div><h3>Harga terbaik</h3><p>Dapatkan penawaran harga transparan.</p></div></article><article>${sectionIcon("trip planner","Calendar.svg")}<div><h3>Mudah & fleksibel</h3><p>Atur rencana perjalanan dengan lebih fleksibel.</p></div></article><article>${sectionIcon("about","People.svg")}<div><h3>Dukungan Lokal</h3><p>Bangga mendukung UMKM Sumba Timur.</p></div></article></section>`;
  }

  // BAGIAN: HALAMAN CONTACT | Membuat informasi kontak dan form; submit divalidasi lalu disimpan sebagai draft simulasi di LocalStorage.
  function renderContact() {
    const root = document.querySelector("#contactContent");
    if (!root) return;
    root.innerHTML = `
      <div class="planner-title"><div><h1>Hubungi Kami</h1><p>Kami siap membantu. Kirim pesan atau hubungi kami melalui informasi berikut.</p></div></div>
      <section class="contact-grid">
        <form class="white-section contact-form" id="contactForm"><h2>Kirim Pesan kepada Kami</h2>
          <label>Nama Lengkap<input name="nama" required placeholder="Masukkan nama lengkap Anda"></label>
          <div class="planner-fields two"><label>Email<input name="email" required type="email" placeholder="nama@email.com"></label><label>WhatsApp<input name="whatsapp" required inputmode="tel" placeholder="08xxxxxxxxxx"></label></div>
          <label>Subjek<input name="subjek" required placeholder="Pilih atau tulis subjek"></label>
          <label>Pesan<textarea name="pesan" required placeholder="Tulis pesan Anda di sini"></textarea></label>
          <button class="btn primary" type="submit">Kirim Pesan</button>
        </form>
        <aside class="white-section contact-info"><h2>Informasi Kontak</h2>
          <div>${sectionIcon("contact","Location.svg")}<span><strong>Alamat</strong><p>Jl. Pendidikan No. 1, Waingapu, Kabupaten Sumba Timur 87111</p></span></div>
          <div>${sectionIcon("contact","Phone.svg")}<span><strong>Telepon / WhatsApp</strong><p>+62 812-3456-7890</p></span></div>
          <div>${sectionIcon("contact","Email.svg")}<span><strong>Email</strong><p>info@exploresumbatimur.id</p></span></div>
          <div>${sectionIcon("contact","Pocket Watch.svg")}<span><strong>Jam Operasional</strong><p>Senin - Jumat 08.00 - 17.00 WITA<br>Sabtu 08.00 - 13.00 WITA</p></span></div>
        </aside>
      </section>
      <section class="contact-grid"><article class="white-section"><h2>Lokasi Kami</h2><div class="map-placeholder large"><strong>Kantor Explore Sumba Timur</strong><span>Waingapu</span></div><button class="btn secondary full" type="button" data-map>Buka di Google Maps</button></article>
      <article class="white-section faq-list"><h2>Pertanyaan yang Sering Diajukan</h2>${["Bagaimana cara memesan paket wisata?","Metode pembayaran apa saja yang tersedia?","Apakah bisa membuat itinerary khusus?","Apakah paket sudah termasuk akomodasi?"].map((question,index) => `<details ${index === 0 ? "open" : ""}><summary>${question}</summary><p>${index === 0 ? "Pilih destinasi di halaman Explore, tambahkan ke Trip Planner, atur jadwal dan traveler, lalu lanjutkan booking." : "Tim kami akan membantu menyesuaikan kebutuhan perjalanan Anda."}</p></details>`).join("")}</article></section>`;
    document.querySelector("#contactForm").addEventListener("submit", event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      localStorage.setItem("exploreSumbaContactDraft", JSON.stringify({
        ...data,
        savedAt: new Date().toISOString()
      }));
      event.currentTarget.reset();
      showToast("Pesan tersimpan. Hubungkan backend untuk pengiriman langsung.");
    });
    document.querySelector("[data-map]").addEventListener("click", () => {
      window.open("https://www.google.com/maps/search/?api=1&query=Waingapu%2C%20Sumba%20Timur", "_blank", "noopener");
    });
  }

  // BAGIAN: TITIK MULAI EXTENDED | Setiap fungsi memeriksa keberadaan root element, sehingga hanya halaman yang sesuai yang akan dirender.
  document.addEventListener("DOMContentLoaded", () => {
    renderDetail();
    renderPlanner();
    renderMyTrip();
    renderAbout();
    renderContact();
  });
})();
