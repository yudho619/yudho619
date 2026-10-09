(function () {
  // BAGIAN: UTILITAS DASAR | IIFE membungkus kode agar variabel tidak mencemari global. rp memformat Rupiah; $ dan $$ mempersingkat pencarian elemen DOM.
  const rp = value => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value).replace(/\s/g, "");
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);
  const cartKey = "eksploreSumbaCart";
  const cartInitKey = "eksploreSumbaCartInitialized";
  const favoriteKey = "exploreSumbaFavorites";
  const getCart = () => JSON.parse(localStorage.getItem(cartKey) || "[]");
  const all = [...destinations, ...homePopular, ...umkmProducts];
  const find = id => detailDestinations[id] || all.find(item => item.id === id) || destinations[0];

  // BAGIAN: NOTIFIKASI TOAST | Menampilkan pesan singkat lalu menghilangkannya otomatis setelah 1,7 detik.
  function toast(message) {
    const element = $("#toast");
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove("show"), 1700);
  }

  // BAGIAN: TEMPLATE CARD | Mengubah satu object wisata/produk dari data.js menjadi string HTML card lengkap dengan tombol Detail, Favorit, dan Tambah Trip.
  function itemCard(item, mode = "trip") {
    const detail = `detail.html?id=${encodeURIComponent(item.id)}`;
    const image = item.img.startsWith("http") ? item.img : `assets/${item.img}`;
    return `<article class="item-card" data-type="${item.type || item.category || ""}">
      <button class="heart" type="button" data-favorite="${item.id}" aria-label="Tambahkan ${item.name} ke favorit">♡</button>
      ${item.category ? `<span class="badge">${item.category}</span>` : ""}
      <a href="${detail}"><img src="${image}" alt="${item.name}"></a>
      <div class="item-body">
        <h3>${item.name}</h3>
        <p>${item.subtitle || ""}</p>
        ${item.rating ? `<p><span class="star">★</span> ${item.rating} (${item.reviews})</p>` : ""}
        <div class="price">${rp(item.price)} <small>/ ${item.unit || "orang"}</small></div>
        <div class="card-actions">
          <a class="mini-btn" href="${detail}">Detail</a>
          <button class="mini-btn orange" type="button" data-add-cart="${item.id}">${mode === "planner" ? "Tambah Rencana" : "Tambah Trip"}</button>
        </div>
      </div>
    </article>`;
  }

  // BAGIAN: RENDER CARD | Mencari wadah data-render pada halaman aktif lalu mengisinya dengan card dari array yang sesuai.
  function renderCards() {
    const home = $('[data-render="home-popular"]');
    const market = $('[data-render="market"]');
    const planner = $('[data-render="planner"]');
    const umkm = $('[data-render="umkm"]');
    const similar = $('[data-render="similar"]');
    if (home) home.innerHTML = homePopular.map(item => itemCard(item)).join("");
    if (market) market.innerHTML = destinations.map(item => itemCard(item)).join("");
    if (planner) planner.innerHTML = destinations.slice(0, 8).map(item => itemCard(item, "planner")).join("");
    if (umkm) umkm.innerHTML = umkmProducts.map(item => itemCard(item, "produk")).join("");
    if (similar) similar.innerHTML = destinations.slice(1, 5).map(item => itemCard(item)).join("");
  }

  // BAGIAN: TAB KATEGORI | Membuat tombol kategori secara otomatis dan memanggil filterMarket saat pengguna memilih tab.
  function renderTabs() {
    const tabs = $("#categoryTabs");
    if (!tabs) return;
    const names = ["Semua", "Destinasi", "Paket Wisata", "Penginapan", "Transportasi", "Guide Lokal", "Kuliner", "Produk Lokal", "Aktivitas"];
    const iconClass = {
      Semua: "grid",
      Destinasi: "destination",
      "Paket Wisata": "package",
      Penginapan: "bed",
      Transportasi: "car",
      "Guide Lokal": "guide",
      Kuliner: "food",
      "Produk Lokal": "shop",
      Aktivitas: "activity"
    };
    tabs.innerHTML = names.map((name, index) => `<button class="${index === 0 ? "active" : ""}" type="button" data-cat="${name}"><span class="tab-icon ${iconClass[name]}"></span>${name}</button>`).join("");
    tabs.onclick = event => {
      const button = event.target.closest("button");
      if (!button) return;
      $$("#categoryTabs button").forEach(item => item.classList.toggle("active", item === button));
      filterMarket();
    };
  }

  // BAGIAN: SEARCH, FILTER, SORTING | Menyaring destinations berdasarkan kata kunci/kategori, mengurutkan harga atau rating, lalu merender hasil.
  function filterMarket() {
    const grid = $('[data-render="market"]');
    if (!grid) return;
    const query = ($("#marketSearch")?.value || "").toLowerCase();
    const category = $("#categoryTabs .active")?.dataset.cat || "Semua";
    const sort = $("#sortSelect")?.value || "popular";
    const list = destinations.filter(item => (
      category === "Semua" || item.type === category || item.category === category
    ) && `${item.name} ${item.subtitle} ${item.category}`.toLowerCase().includes(query));
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "popular") list.sort((a, b) => Number(b.rating) - Number(a.rating));
    grid.innerHTML = list.map(item => itemCard(item)).join("") || "<p>Data tidak ditemukan.</p>";
    const count = $("#resultCount");
    if (count) count.textContent = `Menampilkan ${list.length} pengalaman`;
    bindDynamic();
  }

  // BAGIAN: PENYIMPANAN CART | Mengubah array cart menjadi JSON di LocalStorage, menyinkronkan pilihan ke planner, lalu memperbarui drawer.
  function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    localStorage.setItem(cartInitKey, "1");
    syncCartToTripPlan(cart);
    renderCart();
  }

  // BAGIAN: HUBUNGAN CART KE PLANNER | ID destinasi yang didukung diteruskan ke key exploreSumbaTripPlan agar tampil di Trip Planner.
  function syncCartToTripPlan(cart) {
    const key = "exploreSumbaTripPlan";
    const supported = new Set(["walakiri", "waingapu", "lambanapu", "londa", "wairinding"]);
    const selected = cart
      .map(entry => entry.id === "horse" ? "wairinding" : entry.id)
      .filter(id => supported.has(id));
    if (!selected.length) return;
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    saved.selectedDestinations = [...new Set([...(saved.selectedDestinations || []), ...selected])];
    localStorage.setItem(key, JSON.stringify(saved));
  }

  // BAGIAN: TAMBAH ITEM | Jika ID sudah ada maka qty bertambah; jika belum maka dibuat object baru {id, qty}.
  function addCart(id) {
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, qty: 1 });
    saveCart(cart);
    $("#cartDrawer")?.classList.add("open");
    toast("Item ditambahkan ke rencana.");
  }

  // BAGIAN: DRAWER TRIP PLAN | Membaca cart dari LocalStorage, menghitung subtotal harga x qty, dan membuat tombol menuju planner.html.
  function renderCart() {
    const drawer = $("#cartDrawer");
    if (!drawer) return;
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + find(item.id).price * item.qty, 0);
    drawer.innerHTML = `<div class="cart-head"><h2>Rencana Perjalanan</h2><button type="button" data-close-cart>Tutup</button></div>
      ${cart.length ? cart.map(entry => {
        const item = find(entry.id);
        return `<div class="cart-line"><b>${item.name}</b><br><span>${entry.qty} × ${rp(item.price)}</span></div>`;
      }).join("") : "<p>Belum ada rencana.</p>"}
      <p class="cart-total">Subtotal aktivitas: ${rp(total)}</p>
      <button class="checkout-now" type="button" data-checkout>Lanjut ke Trip Planner</button>`;
    drawer.querySelector("[data-close-cart]").onclick = () => drawer.classList.remove("open");
    drawer.querySelector("[data-checkout]").onclick = () => {
      if (!getCart().length) {
        toast("Rencana masih kosong.");
        return;
      }
      location.href = "planner.html";
    };
  }

  // BAGIAN: FOOTER DINAMIS | Membuat isi footer yang sama pada seluruh halaman yang memiliki elemen #footer.
  function footer() {
    const element = $("#footer");
    if (!element) return;
    element.innerHTML = `<div><img src="assets/logo/logo_final.svg.svg" alt="Explore Sumba Timur"><p>Media wisata untuk menjelajahi Sumba Timur dan merencanakan perjalanan dalam satu platform.</p></div>
    <div><b>Jelajahi</b><a href="explore.html">Destinasi</a><a href="planner.html">Trip Planner</a><a href="explore.html">Kuliner</a><a href="explore.html">Produk Lokal</a></div>
    <div><b>Bantuan</b><a href="contact.html">Cara pemesanan</a><a href="contact.html">Pembayaran</a><a href="contact.html">Kebijakan pembatalan</a><a href="contact.html">FAQ</a><a href="contact.html">Hubungi Kami</a></div>
    <div><b>Tentang Kami</b><a href="about.html">Tentang Explore</a><a href="about.html">Blog & Artikel</a><a href="about.html">Karier</a><a href="about.html">Mitra Lokal</a></div>
    <div><b>Newsletter</b><p>Dapatkan informasi dan promo menarik dari kami.</p><form class="newsletter" data-newsletter><input type="email" aria-label="Alamat email newsletter" placeholder="Masukkan email Anda" required><button type="submit" aria-label="Daftar newsletter">→</button></form></div>`;
  }

  // BAGIAN: EVENT ELEMEN DINAMIS | Dipanggil setelah card dirender untuk mengaktifkan tombol Tambah Trip dan Favorit.
  function bindDynamic() {
    $$("[data-add-cart]").forEach(button => {
      button.onclick = () => addCart(button.dataset.addCart);
    });
    const favorites = JSON.parse(localStorage.getItem(favoriteKey) || "[]");
    $$("[data-favorite]").forEach(button => {
      const id = button.dataset.favorite;
      if (id && favorites.includes(id)) {
        button.classList.add("liked");
        button.textContent = "♥";
      }
      button.onclick = () => {
        if (!id) {
          toast("Pilih destinasi untuk menambahkannya ke favorit.");
          return;
        }
        const current = JSON.parse(localStorage.getItem(favoriteKey) || "[]");
        const index = current.indexOf(id);
        if (index >= 0) current.splice(index, 1);
        else current.push(id);
        localStorage.setItem(favoriteKey, JSON.stringify(current));
        button.classList.toggle("liked", index < 0);
        button.textContent = index < 0 ? "♥" : "♡";
        toast(index < 0 ? "Ditambahkan ke favorit." : "Dihapus dari favorit.");
      };
    });
  }

  // BAGIAN: EVENT ELEMEN STATIS | Menghubungkan tombol/cart, input search, sorting, reset, login simulasi, daftar demo, dan newsletter.
  function bindStatic() {
    $$("[data-open-cart]").forEach(button => {
      button.onclick = () => $("#cartDrawer")?.classList.add("open");
    });
    $("#marketSearch")?.addEventListener("input", filterMarket);
    $("#sortSelect")?.addEventListener("change", filterMarket);
    $("#smartFilter")?.addEventListener("click", () => toast("Filter cerdas aktif."));
    $("#resetFilter")?.addEventListener("click", () => {
      if ($("#marketSearch")) $("#marketSearch").value = "";
      filterMarket();
      toast("Filter direset.");
    });
    $$("[data-info]").forEach(button => {
      button.onclick = () => toast(button.dataset.info);
    });
    const loginForm = $("#loginForm");
    if (loginForm) {
      loginForm.onsubmit = event => {
        event.preventDefault();
        localStorage.setItem("eksploreUser", $("#loginEmail").value);
        $("#authMessage").textContent = "Login berhasil. Anda akan diarahkan ke Home.";
        setTimeout(() => location.href = "index.html", 700);
      };
    }
    $("#registerDemo")?.addEventListener("click", () => {
      $("#authMessage").textContent = "Mode pendaftaran demo aktif. Data disimpan secara lokal.";
    });
    $$("[data-newsletter]").forEach(form => {
      form.addEventListener("submit", event => {
        event.preventDefault();
        localStorage.setItem("exploreSumbaNewsletter", form.querySelector("input").value.trim());
        form.reset();
        toast("Email berhasil didaftarkan ke newsletter.");
      });
    });
  }

  // BAGIAN: ANIMASI SCROLL | IntersectionObserver menambahkan class in-view saat section masuk area layar.
  function initReveal() {
    const selectors = [".category-panel", ".work-section", ".steps-card", ".section-head", ".card-grid", ".service-strip", ".inspiration-grid"];
    const nodes = selectors.flatMap(selector => [...document.querySelectorAll(selector)]);
    nodes.forEach(node => node.classList.add("reveal"));
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(node => node.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    nodes.forEach(node => observer.observe(node));
  }

  // BAGIAN: TITIK MULAI APP | Setelah HTML selesai dibaca browser, semua fungsi render dan event dijalankan dalam urutan ini.
  document.addEventListener("DOMContentLoaded", () => {
    renderCards();
    renderTabs();
    footer();
    renderCart();
    bindDynamic();
    bindStatic();
    initReveal();
  });
})();
