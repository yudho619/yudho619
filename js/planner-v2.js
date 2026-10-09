(function () {
  "use strict";

  // BAGIAN: IDENTITAS MODUL DAN KONEKSI HALAMAN | Flag menandai planner versi 2. Script berhenti jika #plannerContent tidak ada, sehingga aman dimuat hanya pada planner.html.
  window.ExplorePlannerV2 = true;

  const STORAGE_KEY = "exploreSumbaTripPlan";
  const LEGACY_CART_KEY = "eksploreSumbaCart";
  const ADMIN_WHATSAPP = "6281234567890";
  const root = document.querySelector("#plannerContent");
  if (!root) return;

  // BAGIAN: UTILITAS FORMAT DAN KEAMANAN | rp memformat Rupiah; esc mencegah teks pengguna dibaca sebagai tag HTML.
  const rp = value => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);

  // BAGIAN: MASTER DATA PLANNER | Destinasi, kendaraan, hotel, guide, dan mitra menjadi pilihan yang dirender pada langkah-langkah planner.
  const baseDestinations = [
    { id: "walakiri", name: "Pantai Walakiri", category: "Pantai", location: "Desa Watumbaka", price: 125000, rating: "4.8", distance: "24 km", duration: "2-3 jam", image: "home/card-walakiri.jpg.jpg", description: "Pantai ikonik dengan pohon bakau dan panorama senja." },
    { id: "waingapu", name: "Kampung Raja Prailiu", category: "Budaya", location: "Prailiu, Kambera", price: 120000, rating: "4.8", distance: "3 km", duration: "2 jam", image: "home/card-prailiu.jpg.jpg", description: "Kampung adat dengan rumah tradisional dan tenun ikat." },
    { id: "lambanapu", name: "Situs Lambanapu", category: "Sejarah", location: "Kelurahan Lambanapu", price: 100000, rating: "4.8", distance: "7 km", duration: "1-2 jam", image: "home/card-dig.jpg.jpg", description: "Situs budaya dan arkeologi penting di Sumba Timur." },
    { id: "londa", name: "Pantai Londa Lima", category: "Pantai", location: "Desa Kuta", price: 100000, rating: "4.6", distance: "15 km", duration: "2-3 jam", image: "home/card.londa.jpg.jpg", description: "Pantai tenang untuk bersantai dan menikmati pesisir." },
    { id: "wairinding", name: "Bukit Wairinding", category: "Alam", location: "Desa Pambotanjara", price: 120000, rating: "4.7", distance: "25 km", duration: "2-3 jam", image: "eksplore/market-wairinding.jpg.jpg", description: "Perbukitan savana dengan lanskap luas dan dramatis." },
    { id: "tanggedu", name: "Air Terjun Tanggedu", category: "Air Terjun", location: "Kecamatan Kanatang", price: 135000, rating: "4.8", distance: "46 km", duration: "4-5 jam", image: "eksplore/market-lapopu.jpg.jpg", description: "Air terjun berundak dengan kolam alami dan lanskap batu yang khas." },
    { id: "puru-kambera", name: "Savana Puru Kambera", category: "Alam", location: "Kecamatan Kanatang", price: 90000, rating: "4.7", distance: "26 km", duration: "2-3 jam", image: "eksplore/market-rekomendasi-savana.jpg.jpg", description: "Hamparan savana pesisir yang dikenal sebagai habitat kuda Sumba." },
    { id: "tarimbang", name: "Pantai Tarimbang", category: "Pantai", location: "Kecamatan Tabundung", price: 150000, rating: "4.9", distance: "87 km", duration: "Sehari", image: "eksplore/market-weekuri.jpg.jpg", description: "Pantai berpasir putih dengan teluk luas dan ombak yang memikat." },
    { id: "rende", name: "Kampung Adat Rende", category: "Budaya", location: "Kecamatan Umalulu", price: 110000, rating: "4.8", distance: "62 km", duration: "3-4 jam", image: "eksplore/market-praijing.jpg.jpg", description: "Kampung adat dengan rumah tradisional, makam batu, dan tenun ikat." },
    { id: "tanarara", name: "Bukit Tanarara", category: "Alam", location: "Kecamatan Matawai La Pawu", price: 100000, rating: "4.7", distance: "68 km", duration: "3-4 jam", image: "eksplore/market-tour.jpg.jpg", description: "Bukit berlapis dengan warna savana yang berubah mengikuti musim." }
  ];

  const detailData = typeof detailDestinations !== "undefined" ? detailDestinations : {};
  const destinations = baseDestinations.map(item => {
    const detail = detailData[item.id];
    return detail ? {
      ...item,
      category: detail.category || item.category,
      location: detail.location || item.location,
      price: detail.price || item.price,
      rating: detail.rating || item.rating,
      distance: detail.distance || item.distance,
      duration: detail.duration || item.duration,
      image: detail.img || item.image,
      description: detail.description || item.description
    } : item;
  });

  const vehicles = [
    { id: "motor", name: "Motor", capacity: "Cocok untuk 1-2 orang", price: 150000 },
    { id: "car", name: "Mobil 4 roda", capacity: "Cocok untuk 2-5 orang", price: 800000 },
    { id: "mpv", name: "Mobil keluarga / MPV", capacity: "Cocok untuk 4-6 orang", price: 1000000 },
    { id: "hiace", name: "Hiace / Minibus", capacity: "Cocok untuk rombongan", price: 1500000 }
  ];

  const hotels = [
    { id: "waingapu-center", name: "Hotel Waingapu Center", location: "Pusat Kota Waingapu", price: 350000, rating: "4.5" },
    { id: "walakiri-homestay", name: "Walakiri Beach Homestay", location: "Sekitar Pantai Walakiri", price: 450000, rating: "4.6" },
    { id: "uma-kapu", name: "Uma Kapu Eco Lodge", location: "Kawasan alam Sumba Timur", price: 950000, rating: "4.8" },
    { id: "budget-sumba", name: "Penginapan Budget Sumba", location: "Waingapu", price: 250000, rating: "4.2" }
  ];

  const guides = [
    { id: "umbu-raka", name: "Umbu Raka", specialty: "Budaya & Adat", language: "Indonesia", price: 200000, rating: "4.8" },
    { id: "maria-lede", name: "Maria Lede", specialty: "Pantai & Foto", language: "Indonesia, Inggris dasar", price: 250000, rating: "4.9" },
    { id: "andi-wulla", name: "Andi Wulla", specialty: "Alam & Savana", language: "Indonesia", price: 200000, rating: "4.7" }
  ];

  const partners = [
    { id: "partner-rental", name: "Sahabat Rental Waingapu", type: "Rental Mobil Lokal", rating: "4.8", price: 150000 },
    { id: "partner-stay", name: "Uma Lokal Stay", type: "Penginapan Mitra", rating: "4.7", price: 100000 },
    { id: "partner-guide", name: "Komunitas Guide Marapu", type: "Tour Guide Budaya", rating: "4.9", price: 200000 },
    { id: "partner-food", name: "Dapur Sumba", type: "Paket Kuliner Lokal", rating: "4.8", price: 175000 },
    { id: "partner-umkm", name: "Galeri Tenun Timur", type: "Produk UMKM", rating: "4.9", price: 125000 }
  ];

  // BAGIAN: STRUKTUR RENCANA AWAL | Menentukan semua field yang wajib dimiliki satu Trip Plan sebelum data LocalStorage digabungkan.
  const defaultPlan = {
    step: 1,
    traveler: { name: "", phone: "", province: "", city: "", district: "", address: "", postalCode: "" },
    locationStatus: "outside",
    origin: { city: "", mode: "plane", cost: 1800000 },
    selectedDestinations: [],
    startDate: "2026-06-20",
    endDate: "2026-06-22",
    vehicleId: "",
    hotelId: "",
    guideId: "",
    budget: "Menengah",
    participants: { adults: 1, teens: 0, children: 0 },
    selectedPartners: [],
    otherCost: 0,
    notes: "",
    payment: { method: "bank", payerName: "", reference: "", status: "Belum dibayar" },
    status: "Draft"
  };

  // BAGIAN: MEMUAT DATA TERSIMPAN | deepMerge menjaga object bertingkat tetap lengkap; loadTripPlan juga mengimpor cart lama jika belum ada plan versi 2.
  function deepMerge(base, saved) {
    return {
      ...base,
      ...saved,
      traveler: { ...base.traveler, ...(saved?.traveler || {}) },
      origin: { ...base.origin, ...(saved?.origin || {}) },
      participants: { ...base.participants, ...(saved?.participants || {}) },
      payment: { ...base.payment, ...(saved?.payment || {}) },
      selectedDestinations: Array.isArray(saved?.selectedDestinations) ? saved.selectedDestinations : base.selectedDestinations,
      selectedPartners: Array.isArray(saved?.selectedPartners) ? saved.selectedPartners : base.selectedPartners
    };
  }

  function loadTripPlan() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const plan = deepMerge(defaultPlan, saved || {});
      if (!saved) {
        const legacyCart = JSON.parse(localStorage.getItem(LEGACY_CART_KEY) || "[]");
        plan.selectedDestinations = legacyCart.map(entry => entry.id === "horse" ? "wairinding" : entry.id)
          .filter(id => destinations.some(destination => destination.id === id));
      }
      return plan;
    } catch {
      return deepMerge(defaultPlan, {});
    }
  }

  let plan = loadTripPlan();

  // BAGIAN: SIMPAN DAN RESET | Seluruh object plan disimpan sebagai JSON pada key exploreSumbaTripPlan.
  function saveTripPlan() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }

  function resetTripPlan() {
    localStorage.removeItem(STORAGE_KEY);
    plan = deepMerge(defaultPlan, {});
    renderPlanner();
    showMessage("Trip Plan berhasil direset.", "success");
  }

  // BAGIAN: JADWAL, PESERTA, DAN TOTAL | Mengubah tanggal menjadi jumlah hari/malam lalu menjumlahkan semua komponen biaya yang dipilih.
  function getSchedule() {
    const start = new Date(`${plan.startDate}T00:00:00`);
    const end = new Date(`${plan.endDate}T00:00:00`);
    const valid = plan.startDate && plan.endDate && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start;
    const days = valid ? Math.max(1, Math.round((end - start) / 86400000) + 1) : 1;
    return { valid, days, nights: Math.max(0, days - 1) };
  }

  function participantTotal() {
    return Math.max(0, Number(plan.participants.adults) + Number(plan.participants.teens) + Number(plan.participants.children));
  }

  function calculateTotal() {
    const people = participantTotal();
    const schedule = getSchedule();
    const ticketPerPerson = plan.selectedDestinations.reduce((sum, id) => sum + (destinations.find(item => item.id === id)?.price || 0), 0);
    const destinationCost = ticketPerPerson * people;
    const originTransport = plan.locationStatus === "outside" ? Number(plan.origin.cost || 0) : 0;
    const vehicle = vehicles.find(item => item.id === plan.vehicleId);
    const localTransport = vehicle ? vehicle.price * schedule.days : 0;
    const hotel = hotels.find(item => item.id === plan.hotelId);
    const accommodation = hotel ? hotel.price * schedule.nights : 0;
    const guide = guides.find(item => item.id === plan.guideId);
    const guideCost = guide ? guide.price * schedule.days : 0;
    const participantCost = Number(plan.participants.adults) * 100000
      + Number(plan.participants.teens) * 75000
      + Number(plan.participants.children) * 50000;
    const selectedPartnerItems = partners.filter(item => plan.selectedPartners.includes(item.id));
    const partnerCost = selectedPartnerItems.reduce((sum, item) => sum + item.price, 0);
    const umkmCost = selectedPartnerItems.filter(item => item.type === "Produk UMKM").reduce((sum, item) => sum + item.price, 0);
    const partnerOther = partnerCost - umkmCost;
    const otherCost = Number(plan.otherCost || 0) + partnerOther;
    const total = destinationCost + originTransport + localTransport + accommodation + guideCost + participantCost + umkmCost + otherCost;
    return { people, schedule, destinationCost, originTransport, localTransport, accommodation, guideCost, participantCost, umkmCost, otherCost, total };
  }

  // BAGIAN: PESAN DAN VALIDASI | Menampilkan kesalahan pada field/box serta mencegah pengguna lanjut jika data penting belum lengkap.
  function showMessage(message, type = "error") {
    const box = document.querySelector("#plannerMessage");
    if (!box) return;
    box.textContent = message;
    box.className = `planner-message ${type}`;
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function clearMessage() {
    const box = document.querySelector("#plannerMessage");
    if (box) box.hidden = true;
  }

  function fieldError(name, message) {
    const target = document.querySelector(`[data-error-for="${name}"]`);
    if (target) target.textContent = message || "";
  }

  function validateStep(step) {
    clearMessage();
    document.querySelectorAll(".field-error").forEach(item => { item.textContent = ""; });
    if (step === 1) {
      const required = [
        ["name", plan.traveler.name, "Nama lengkap wajib diisi."],
        ["phone", plan.traveler.phone, "Nomor HP wajib diisi."],
        ["province", plan.traveler.province, "Provinsi wajib diisi."],
        ["city", plan.traveler.city, "Kota/Kabupaten wajib diisi."],
        ["address", plan.traveler.address, "Alamat lengkap wajib diisi."]
      ];
      let valid = true;
      required.forEach(([name, value, message]) => {
        if (!String(value || "").trim()) {
          fieldError(name, message);
          valid = false;
        }
      });
      if (plan.locationStatus === "outside" && !plan.origin.mode) {
        showMessage("Pilih transportasi awal dari kota asal.");
        valid = false;
      }
      return valid;
    }
    if (step === 2 && !plan.selectedDestinations.length) {
      showMessage("Pilih minimal satu destinasi sebelum melanjutkan.");
      return false;
    }
    if (step === 4) {
      if (participantTotal() < 1) {
        showMessage("Jumlah peserta minimal satu orang.");
        return false;
      }
      if (!getSchedule().valid) {
        showMessage("Tanggal selesai harus sama atau setelah tanggal mulai.");
        return false;
      }
    }
    return true;
  }

  // BAGIAN: TEMPLATE PILIHAN | Fungsi berikut mengubah array destinasi, layanan, dan mitra menjadi card HTML sesuai status dipilih.
  function destinationCards() {
    return destinations.map(item => {
      const selected = plan.selectedDestinations.includes(item.id);
      return `<article class="planner-choice-card destination-choice ${selected ? "selected" : ""}">
        <img src="assets/${item.image}" alt="${item.name}">
        <div class="choice-body">
          <span class="planner-chip">${item.category}</span>
          <h3>${item.name}</h3>
          <p>${item.location} · ${item.distance} dari Waingapu</p>
          <p>${item.description}</p>
          <div class="choice-meta"><span>★ ${item.rating}</span><span>${item.duration}</span><strong>${rp(item.price)} / orang</strong></div>
          <button class="mini-btn ${selected ? "" : "orange"}" type="button" data-toggle-destination="${item.id}">${selected ? "Hapus dari Rencana" : "Tambah ke Rencana"}</button>
        </div>
      </article>`;
    }).join("");
  }

  function optionCards(items, type, selectedId, buttonLabel) {
    return items.map(item => {
      const selected = item.id === selectedId;
      const description = item.capacity || `${item.location || item.specialty} · ${item.language || `★ ${item.rating}`}`;
      return `<article class="planner-option-card ${selected ? "selected" : ""}">
        <div><span class="planner-option-icon"></span><h3>${item.name}</h3></div>
        <p>${description}</p>
        <p>★ ${item.rating || "Mitra terverifikasi"}</p>
        <strong>${rp(item.price)} / ${type === "hotel" ? "malam" : "hari"}</strong>
        ${type === "hotel" ? `<button class="mini-btn" type="button" data-view-hotel="${item.id}">Lihat Hotel</button>` : ""}
        <button class="mini-btn ${selected ? "" : "orange"}" type="button" data-select-${type}="${item.id}">${selected ? "Dipilih" : buttonLabel}</button>
      </article>`;
    }).join("");
  }

  function partnerCards() {
    return partners.map(item => {
      const selected = plan.selectedPartners.includes(item.id);
      return `<article class="partner-card ${selected ? "selected" : ""}">
        <span class="planner-chip">${item.type}</span>
        <h3>${item.name}</h3>
        <p>★ ${item.rating} · Estimasi ${rp(item.price)}</p>
        <button class="mini-btn ${selected ? "" : "orange"}" type="button" data-toggle-partner="${item.id}">${selected ? "Hapus Mitra" : "Pilih Mitra"}</button>
      </article>`;
    }).join("");
  }

  // BAGIAN: LANGKAH 1 - DATA WISATAWAN | Meminta identitas, alamat, status lokasi, kota asal, moda awal, dan estimasi biaya menuju Sumba Timur.
  function stepOne() {
    const outside = plan.locationStatus === "outside";
    return `<section class="planner-step-panel" data-step-panel="1">
      <div class="planner-section-heading"><span>1</span><div><h2>Data Wisatawan & Titik Awal</h2><p>Lengkapi data pemesan agar estimasi perjalanan sesuai titik keberangkatan.</p></div></div>
      <div class="planner-fields two">
        ${textField("name", "Nama lengkap", plan.traveler.name, "Nama sesuai identitas")}
        ${textField("phone", "Nomor WhatsApp / No HP", plan.traveler.phone, "08xxxxxxxxxx", "tel")}
        ${textField("province", "Provinsi", plan.traveler.province, "Contoh: Nusa Tenggara Timur")}
        ${textField("city", "Kota / Kabupaten", plan.traveler.city, "Kota atau kabupaten asal")}
        ${textField("district", "Kecamatan", plan.traveler.district, "Kecamatan")}
        ${textField("postalCode", "Kode pos", plan.traveler.postalCode, "Kode pos", "text")}
      </div>
      <label>Alamat lengkap<textarea data-traveler="address" placeholder="Nama jalan, nomor rumah, desa/kelurahan">${esc(plan.traveler.address)}</textarea><small class="field-error" data-error-for="address"></small></label>
      <fieldset class="location-status"><legend>Apakah Anda sudah berada di Sumba Timur?</legend>
        <label><input type="radio" name="locationStatus" value="outside" ${outside ? "checked" : ""}> Saya dari luar Sumba Timur</label>
        <label><input type="radio" name="locationStatus" value="local" ${!outside ? "checked" : ""}> Saya sudah berada di Sumba Timur</label>
      </fieldset>
      ${outside ? `<div class="travel-estimate-box">
        <h3>Estimasi Perjalanan Awal</h3>
        <div class="planner-fields two">
          <label>Kota asal<input data-origin="city" value="${esc(plan.origin.city)}" placeholder="Kota keberangkatan"></label>
          <label>Tujuan<input value="Waingapu, Sumba Timur" readonly></label>
          <label>Transportasi menuju Sumba Timur<select data-origin="mode">
            <option value="plane" ${plan.origin.mode === "plane" ? "selected" : ""}>Pesawat</option>
            <option value="sea" ${plan.origin.mode === "sea" ? "selected" : ""}>Kapal / Bus</option>
            <option value="custom" ${plan.origin.mode === "custom" ? "selected" : ""}>Custom</option>
          </select></label>
          <label>Estimasi biaya perjalanan awal<input type="number" min="0" data-origin="cost" value="${plan.origin.cost}"></label>
        </div>
      </div>` : `<div class="travel-estimate-box local">
        <h3>Estimasi Perjalanan Lokal</h3>
        <p><strong>Titik awal:</strong> ${esc(plan.traveler.address || "Alamat wisatawan di Sumba Timur")}</p>
        <p><strong>Destinasi pertama:</strong> ${destinations.find(item => item.id === plan.selectedDestinations[0])?.name || "Belum dipilih"}</p>
        <p>Biaya yang dihitung hanya transportasi lokal. Tiket pesawat atau perjalanan antardaerah tidak ditambahkan.</p>
      </div>`}
    </section>`;
  }

  function textField(name, label, value, placeholder, type = "text") {
    return `<label>${label}<input type="${type}" data-traveler="${name}" value="${esc(value)}" placeholder="${esc(placeholder)}"><small class="field-error" data-error-for="${name}"></small></label>`;
  }

  // BAGIAN: LANGKAH 2 - DESTINASI | Menampilkan destinationCards dan mewajibkan minimal satu destinasi.
  function stepTwo() {
    return `<section class="planner-step-panel" data-step-panel="2">
      <div class="planner-section-heading"><span>2</span><div><h2>Pilih Destinasi</h2><p>Pilih minimal satu destinasi. Pilihan langsung masuk ke Ringkasan Trip Plan.</p></div></div>
      <div class="planner-destination-grid">${destinationCards()}</div>
    </section>`;
  }

  // BAGIAN: LANGKAH 3 - LAYANAN | Menampilkan kendaraan, hotel, guide, dan mitra dengan rekomendasi berdasarkan jumlah traveler.
  function stepThree() {
    const recommendation = participantTotal() <= 2 ? "Motor atau Mobil 4 roda" : participantTotal() <= 6 ? "Mobil 4 roda atau MPV" : "Hiace / Minibus";
    return `<section class="planner-step-panel" data-step-panel="3">
      <div class="planner-section-heading"><span>3</span><div><h2>Transportasi, Hotel & Tour Guide</h2><p>Pilih layanan mitra yang sesuai dengan kebutuhan perjalanan.</p></div></div>
      <div class="recommendation-note"><strong>Rekomendasi untuk ${participantTotal()} traveler:</strong> ${recommendation}</div>
      <h3>Transportasi Lokal</h3><div class="planner-option-grid four">${optionCards(vehicles, "vehicle", plan.vehicleId, "Pilih Kendaraan")}</div>
      <h3>Hotel & Penginapan Mitra</h3><div class="planner-option-grid four">${optionCards(hotels, "hotel", plan.hotelId, "Tambahkan ke Rencana")}</div>
      <h3>Tour Guide Lokal</h3><div class="planner-option-grid three">${optionCards(guides, "guide", plan.guideId, "Pilih Guide")}</div>
      <h3>Penawaran Mitra Lokal</h3><div class="partner-grid">${partnerCards()}</div>
    </section>`;
  }

  // BAGIAN: LANGKAH 4 - BUDGET | Mengatur tanggal, peserta, kelas budget, biaya tambahan, dan catatan.
  function stepFour() {
    return `<section class="planner-step-panel" data-step-panel="4">
      <div class="planner-section-heading"><span>4</span><div><h2>Budget & Estimasi Biaya</h2><p>Atur jadwal, komposisi peserta, dan preferensi budget.</p></div></div>
      <div class="planner-fields two">
        <label>Tanggal mulai<input type="date" data-plan-field="startDate" value="${plan.startDate}"></label>
        <label>Tanggal selesai<input type="date" data-plan-field="endDate" value="${plan.endDate}"></label>
      </div>
      <h3>Jumlah Peserta</h3>
      <div class="traveler-fields three">
        <label>Dewasa <small>Rp100.000 / orang</small><input type="number" min="0" data-participant="adults" value="${plan.participants.adults}"></label>
        <label>Remaja <small>Rp75.000 / orang</small><input type="number" min="0" data-participant="teens" value="${plan.participants.teens}"></label>
        <label>Anak-anak <small>Rp50.000 / orang</small><input type="number" min="0" data-participant="children" value="${plan.participants.children}"></label>
      </div>
      <h3>Paket Budget</h3>
      <div class="budget-options">${["Hemat", "Menengah", "Nyaman", "Premium"].map(value => `<button type="button" class="${plan.budget === value ? "active" : ""}" data-budget="${value}">${value}</button>`).join("")}</div>
      <div class="budget-detail"><strong>${plan.budget}</strong>${plan.budget === "Hemat" ? "<p>Paket acuan Rp1.000.000: mobil lokal Rp800.000 dan tour guide Rp200.000 per hari.</p>" : "<p>Pilihan budget membantu menyesuaikan rekomendasi layanan. Total tetap dihitung dari layanan yang dipilih.</p>"}</div>
      <div class="planner-fields two">
        <label>Biaya tambahan lain-lain<input type="number" min="0" data-plan-field="otherCost" value="${plan.otherCost}"></label>
        <label>Catatan<textarea data-plan-field="notes" placeholder="Permintaan khusus atau kebutuhan tambahan">${esc(plan.notes)}</textarea></label>
      </div>
    </section>`;
  }

  // BAGIAN: LANGKAH 5 - KONFIRMASI | Menampilkan seluruh pilihan, metode pembayaran simulasi, total, tombol simpan, booking, dan WhatsApp.
  function stepFive() {
    const cost = calculateTotal();
    const vehicle = vehicles.find(item => item.id === plan.vehicleId);
    const hotel = hotels.find(item => item.id === plan.hotelId);
    const guide = guides.find(item => item.id === plan.guideId);
    const paymentInstructions = {
      bank: "<strong>Transfer Bank</strong><br>BCA 1234567890 a.n. Explore Sumba Timur<br>Mandiri 1400012345678 a.n. Explore Sumba Timur",
      ewallet: "<strong>E-Wallet</strong><br>DANA / OVO / GoPay: 0812-3456-7890<br>a.n. Explore Sumba Timur",
      qris: "<strong>QRIS</strong><br>Kode QR akan diberikan admin setelah ketersediaan perjalanan dikonfirmasi.",
      cash: "<strong>Bayar di Lokasi</strong><br>Pembayaran dilakukan di kantor Explore Sumba Timur sebelum perjalanan."
    };
    return `<section class="planner-step-panel" data-step-panel="5">
      <div class="planner-section-heading"><span>5</span><div><h2>Konfirmasi Booking</h2><p>Periksa seluruh data sebelum menyimpan atau melanjutkan booking.</p></div></div>
      <div class="confirmation-grid">
        <article><h3>Data Wisatawan</h3><p><strong>${esc(plan.traveler.name || "-")}</strong><br>${esc(plan.traveler.phone || "-")}<br>${esc(plan.traveler.address || "-")}, ${esc(plan.traveler.city || "-")}</p><p>Status: ${plan.locationStatus === "outside" ? "Dari luar Sumba Timur" : "Sudah berada di Sumba Timur"}</p></article>
        <article><h3>Jadwal & Peserta</h3><p>${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}</p><p>${cost.people} peserta: ${plan.participants.adults} dewasa, ${plan.participants.teens} remaja, ${plan.participants.children} anak</p></article>
        <article><h3>Layanan</h3><p>Transportasi: ${vehicle?.name || "Belum dipilih"}<br>Hotel: ${hotel?.name || "Tanpa hotel"}<br>Tour Guide: ${guide?.name || "Tanpa guide"}</p></article>
        <article><h3>Destinasi</h3><ol>${plan.selectedDestinations.map(id => `<li>${destinations.find(item => item.id === id)?.name}</li>`).join("") || "<li>Belum dipilih</li>"}</ol></article>
      </div>
      <section class="payment-section">
        <div class="payment-heading"><div><h3>Sistem Pembayaran</h3><p>Pilih metode pembayaran. Ini masih berupa simulasi front-end dan tidak memotong saldo.</p></div><span class="payment-status">${esc(plan.payment.status)}</span></div>
        <div class="payment-methods">
          ${[
            ["bank", "Transfer Bank", "BCA atau Mandiri"],
            ["ewallet", "E-Wallet", "DANA, OVO, atau GoPay"],
            ["qris", "QRIS", "Konfirmasi melalui admin"],
            ["cash", "Bayar di Lokasi", "Kantor Explore Sumba Timur"]
          ].map(([id, name, detail]) => `<label class="payment-method ${plan.payment.method === id ? "selected" : ""}"><input type="radio" name="paymentMethod" value="${id}" ${plan.payment.method === id ? "checked" : ""}><span><strong>${name}</strong><small>${detail}</small></span></label>`).join("")}
        </div>
        <div class="payment-instructions">${paymentInstructions[plan.payment.method] || paymentInstructions.bank}</div>
        <div class="planner-fields two payment-fields">
          <label>Nama pemilik pembayaran<input data-payment="payerName" value="${esc(plan.payment.payerName)}" placeholder="Nama pengirim / pembayar"></label>
          <label>Nomor referensi <small>(opsional)</small><input data-payment="reference" value="${esc(plan.payment.reference)}" placeholder="Nomor transaksi atau catatan"></label>
        </div>
        <div class="payment-total"><span>Total yang harus dibayar</span><strong>${rp(cost.total)}</strong></div>
        <button class="btn primary" type="button" id="processPayment">Konfirmasi Pembayaran Simulasi</button>
      </section>
      <div class="confirmation-actions">
        <button class="btn secondary" type="button" id="saveFinalPlan">Simpan Trip Plan</button>
        <button class="btn primary" type="button" id="continueBooking">Lanjutkan Booking</button>
        <button class="btn whatsapp-button" type="button" id="sendWhatsApp">Kirim ke WhatsApp Admin</button>
      </div>
    </section>`;
  }

  // BAGIAN: FORMAT TANGGAL DAN RINGKASAN | Membuat panel kanan yang selalu menunjukkan destinasi serta rincian estimasi biaya terbaru.
  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
  }

  function renderTripSummary() {
    const cost = calculateTotal();
    const selected = plan.selectedDestinations.map(id => destinations.find(item => item.id === id)).filter(Boolean);
    return `<aside class="planner-summary white-section">
      <div class="summary-heading"><div><span>Trip Planner</span><h2>Ringkasan Trip Plan</h2></div><button type="button" class="summary-reset" id="resetTripPlan">Reset</button></div>
      <div class="summary-traveler"><strong>${esc(plan.traveler.name || "Data wisatawan belum lengkap")}</strong><small>${plan.locationStatus === "outside" ? "Dari luar Sumba Timur" : "Sudah berada di Sumba Timur"} · ${cost.people} peserta</small></div>
      <h3>Destinasi (${selected.length})</h3>
      ${selected.length ? selected.map(item => `<div class="summary-item"><img src="assets/${item.image}" alt=""><span><strong>${item.name}</strong><small>${item.location}</small></span><b>${rp(item.price * cost.people)}</b></div>`).join("") : "<p class=\"summary-empty\">Belum ada destinasi yang dipilih.</p>"}
      <h3>Estimasi Biaya</h3>
      ${summaryRow("Tiket Destinasi", cost.destinationCost)}
      ${summaryRow("Transportasi dari Kota Asal", cost.originTransport)}
      ${summaryRow("Transportasi Lokal", cost.localTransport)}
      ${summaryRow("Hotel / Penginapan", cost.accommodation)}
      ${summaryRow("Tour Guide", cost.guideCost)}
      ${summaryRow("Biaya Peserta", cost.participantCost)}
      ${summaryRow("Produk UMKM", cost.umkmCost)}
      ${summaryRow("Lain-lain", cost.otherCost)}
      <div class="planner-total"><span>Total Estimasi</span><strong>${rp(cost.total)}</strong></div>
      <p class="summary-footnote">${cost.schedule.days} hari · ${cost.schedule.nights} malam · Budget ${plan.budget}</p>
      <button class="btn primary full" type="button" id="summarySave">Simpan Trip Plan</button>
    </aside>`;
  }

  function summaryRow(label, value) {
    return `<div class="summary-row"><span>${label}</span><strong>${rp(value)}</strong></div>`;
  }

  // BAGIAN: RENDER UTAMA | Memilih tampilan step aktif, membuat navigasi langkah, memasang ringkasan, lalu mengaktifkan semua event.
  function renderPlanner() {
    plan.step = Math.min(5, Math.max(1, Number(plan.step) || 1));
    root.innerHTML = `
      <div class="planner-title"><div><p>Rancang Perjalanan</p><h1>Trip Planner Sumba Timur</h1><span>Susun perjalanan lengkap dari titik awal hingga konfirmasi booking.</span></div></div>
      <section class="planner-steps five">
        ${["Data Wisatawan", "Pilih Destinasi", "Transportasi, Hotel & Guide", "Budget & Estimasi", "Konfirmasi Booking"].map((label, index) => `<button type="button" class="${plan.step === index + 1 ? "active" : ""} ${plan.step > index + 1 ? "completed" : ""}" data-go-step="${index + 1}"><b>${index + 1}</b><span>${label}</span></button>`).join("")}
      </section>
      <div id="plannerMessage" class="planner-message" hidden></div>
      <section class="planner-workspace planner-v2-workspace">
        <article class="planner-form white-section">
          ${[stepOne(), stepTwo(), stepThree(), stepFour(), stepFive()][plan.step - 1]}
          <div class="step-navigation">
            ${plan.step > 1 ? `<button class="btn secondary" type="button" data-step-change="-1">Kembali</button>` : "<span></span>"}
            ${plan.step < 5 ? `<button class="btn primary" type="button" data-step-change="1">Lanjutkan</button>` : ""}
          </div>
        </article>
        ${renderTripSummary()}
      </section>`;
    bindPlannerEvents();
  }

  // BAGIAN: EVENT PLANNER | Menyambungkan input, radio, pilihan card, tombol step, reset, simpan, pembayaran simulasi, dan WhatsApp ke object plan.
  function bindPlannerEvents() {
    document.querySelectorAll("[data-traveler]").forEach(field => field.addEventListener("input", () => {
      plan.traveler[field.dataset.traveler] = field.value;
      saveTripPlan();
    }));
    document.querySelectorAll("[data-origin]").forEach(field => field.addEventListener("change", () => {
      plan.origin[field.dataset.origin] = field.dataset.origin === "cost" ? Number(field.value) : field.value;
      if (field.dataset.origin === "mode" && field.value !== "custom") {
        plan.origin.cost = field.value === "plane" ? 1800000 : 650000;
      }
      saveTripPlan();
      renderPlanner();
    }));
    document.querySelectorAll('input[name="locationStatus"]').forEach(field => field.addEventListener("change", () => {
      plan.locationStatus = field.value;
      saveTripPlan();
      renderPlanner();
    }));
    document.querySelectorAll("[data-toggle-destination]").forEach(button => button.addEventListener("click", () => {
      const id = button.dataset.toggleDestination;
      plan.selectedDestinations = plan.selectedDestinations.includes(id)
        ? plan.selectedDestinations.filter(value => value !== id)
        : [...plan.selectedDestinations, id];
      saveTripPlan();
      renderPlanner();
    }));
    bindSingleSelection("vehicle", vehicles);
    bindSingleSelection("hotel", hotels);
    bindSingleSelection("guide", guides);
    document.querySelectorAll("[data-view-hotel]").forEach(button => button.addEventListener("click", () => {
      showMessage("Link hotel mitra masih berupa placeholder dan dapat diganti saat kerja sama aktif.", "success");
    }));
    document.querySelectorAll("[data-toggle-partner]").forEach(button => button.addEventListener("click", () => {
      const id = button.dataset.togglePartner;
      plan.selectedPartners = plan.selectedPartners.includes(id)
        ? plan.selectedPartners.filter(value => value !== id)
        : [...plan.selectedPartners, id];
      saveTripPlan();
      renderPlanner();
    }));
    document.querySelectorAll("[data-participant]").forEach(field => field.addEventListener("change", () => {
      plan.participants[field.dataset.participant] = Math.max(0, Number(field.value));
      saveTripPlan();
      renderPlanner();
    }));
    document.querySelectorAll("[data-plan-field]").forEach(field => field.addEventListener("change", () => {
      const key = field.dataset.planField;
      plan[key] = key === "otherCost" ? Math.max(0, Number(field.value)) : field.value;
      saveTripPlan();
      renderPlanner();
    }));
    document.querySelectorAll("[data-budget]").forEach(button => button.addEventListener("click", () => {
      plan.budget = button.dataset.budget;
      if (plan.budget === "Hemat") {
        plan.vehicleId = "car";
        plan.guideId = "umbu-raka";
      } else if (plan.budget === "Nyaman") {
        plan.vehicleId = "mpv";
        plan.hotelId = "walakiri-homestay";
        plan.guideId = "maria-lede";
      } else if (plan.budget === "Premium") {
        plan.vehicleId = "hiace";
        plan.hotelId = "uma-kapu";
        plan.guideId = "maria-lede";
      }
      saveTripPlan();
      renderPlanner();
    }));
    document.querySelectorAll('input[name="paymentMethod"]').forEach(field => field.addEventListener("change", () => {
      plan.payment.method = field.value;
      plan.payment.status = "Belum dibayar";
      saveTripPlan();
      renderPlanner();
    }));
    document.querySelectorAll("[data-payment]").forEach(field => field.addEventListener("input", () => {
      plan.payment[field.dataset.payment] = field.value;
      saveTripPlan();
    }));
    document.querySelectorAll("[data-step-change]").forEach(button => button.addEventListener("click", () => {
      const direction = Number(button.dataset.stepChange);
      if (direction > 0 && !validateStep(plan.step)) return;
      plan.step = Math.min(5, Math.max(1, plan.step + direction));
      saveTripPlan();
      renderPlanner();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }));
    document.querySelectorAll("[data-go-step]").forEach(button => button.addEventListener("click", () => {
      const next = Number(button.dataset.goStep);
      if (next > plan.step && !validateStep(plan.step)) return;
      plan.step = next;
      saveTripPlan();
      renderPlanner();
    }));
    document.querySelector("#resetTripPlan")?.addEventListener("click", resetTripPlan);
    document.querySelector("#summarySave")?.addEventListener("click", () => {
      saveTripPlan();
      showMessage("Trip Plan tersimpan di perangkat ini.", "success");
    });
    document.querySelector("#saveFinalPlan")?.addEventListener("click", () => {
      if (!validateAll()) return;
      plan.status = "Tersimpan";
      saveTripPlan();
      renderPlanner();
      showMessage("Trip Plan berhasil disimpan.", "success");
    });
    document.querySelector("#continueBooking")?.addEventListener("click", () => {
      if (!validateAll()) return;
      plan.status = "Menunggu konfirmasi";
      saveTripPlan();
      renderPlanner();
      showMessage("Booking disiapkan. Tim Explore Sumba Timur akan melakukan konfirmasi.", "success");
    });
    document.querySelector("#processPayment")?.addEventListener("click", () => {
      if (!validateAll()) return;
      if (!plan.payment.method) {
        showMessage("Pilih metode pembayaran terlebih dahulu.");
        return;
      }
      if (!plan.payment.payerName.trim()) {
        showMessage("Isi nama pemilik pembayaran sebelum konfirmasi.");
        return;
      }
      plan.payment.status = plan.payment.method === "cash" ? "Bayar di lokasi" : "Menunggu verifikasi admin";
      plan.status = "Menunggu verifikasi pembayaran";
      saveTripPlan();
      renderPlanner();
      showMessage("Pembayaran simulasi tersimpan. Admin akan melakukan verifikasi.", "success");
    });
    document.querySelector("#sendWhatsApp")?.addEventListener("click", () => {
      if (!validateAll()) return;
      const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(whatsappMessage())}`;
      window.open(url, "_blank", "noopener");
    });
  }

  // BAGIAN: PILIHAN TUNGGAL DAN VALIDASI FINAL | Memastikan hanya satu kendaraan/hotel/guide dipilih dan seluruh langkah penting valid sebelum booking.
  function bindSingleSelection(type, list) {
    document.querySelectorAll(`[data-select-${type}]`).forEach(button => button.addEventListener("click", () => {
      const key = type === "vehicle" ? "vehicleId" : type === "hotel" ? "hotelId" : "guideId";
      const id = button.dataset[`select${type[0].toUpperCase()}${type.slice(1)}`];
      plan[key] = plan[key] === id ? "" : id;
      saveTripPlan();
      renderPlanner();
    }));
  }

  function validateAll() {
    for (const step of [1, 2, 4]) {
      if (!validateStep(step)) {
        plan.step = step;
        saveTripPlan();
        renderPlanner();
        showMessage(step === 1 ? "Lengkapi data wisatawan terlebih dahulu." : step === 2 ? "Pilih minimal satu destinasi." : "Periksa jadwal dan jumlah peserta.");
        return false;
      }
    }
    return true;
  }

  // BAGIAN: PESAN WHATSAPP | Menyusun teks booking dari data plan, lalu bindPlannerEvents membuka URL wa.me dengan pesan tersebut.
  function whatsappMessage() {
    const cost = calculateTotal();
    const vehicle = vehicles.find(item => item.id === plan.vehicleId)?.name || "Belum dipilih";
    const hotel = hotels.find(item => item.id === plan.hotelId)?.name || "Tanpa hotel";
    const guide = guides.find(item => item.id === plan.guideId)?.name || "Tanpa guide";
    const destinationNames = plan.selectedDestinations.map(id => destinations.find(item => item.id === id)?.name).filter(Boolean).join(", ");
    return `Halo Admin Explore Sumba Timur, saya ingin booking perjalanan.

Nama: ${plan.traveler.name}
No HP: ${plan.traveler.phone}
Alamat: ${plan.traveler.address}, ${plan.traveler.city}, ${plan.traveler.province}
Status Wisatawan: ${plan.locationStatus === "outside" ? "Dari luar Sumba Timur" : "Sudah berada di Sumba Timur"}
Tanggal Perjalanan: ${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}
Jumlah Peserta: ${cost.people}
Destinasi: ${destinationNames}
Transportasi: ${vehicle}
Hotel: ${hotel}
Tour Guide: ${guide}
Metode Pembayaran: ${paymentMethodName(plan.payment.method)}
Status Pembayaran: ${plan.payment.status}
Total Estimasi: ${rp(cost.total)}

Mohon konfirmasi ketersediaan.`;
  }

  function paymentMethodName(id) {
    return {
      bank: "Transfer Bank",
      ewallet: "E-Wallet",
      qris: "QRIS",
      cash: "Bayar di Lokasi"
    }[id] || "Belum dipilih";
  }

  // BAGIAN: API GLOBAL DAN START | Mengekspos fungsi penting untuk debugging/integrasi, kemudian menjalankan render pertama.
  window.saveTripPlan = saveTripPlan;
  window.loadTripPlan = loadTripPlan;
  window.resetTripPlan = resetTripPlan;
  window.calculateTotal = calculateTotal;
  window.renderTripSummary = renderTripSummary;
  window.buildWhatsAppMessage = whatsappMessage;

  renderPlanner();
})();
