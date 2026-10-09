// BAGIAN: DATA MARKETPLACE UTAMA | Array destinations dipakai oleh halaman Explore, card, filter, sorting, cart, dan Trip Planner.
const destinations = [
  {id:"waingapu",name:"Kampung Raja Prailiu",subtitle:"Desa Watumbaka",category:"Budaya",type:"Destinasi",price:120000,rating:"4.8",reviews:233,img:"eksplore/market-prailiu.jpg.jpg",detail:true},
  {id:"wairinding",name:"Bukit Wairinding",subtitle:"Desa Pambotanjara",category:"Destinasi Alam",type:"Destinasi",price:120000,rating:"4.7",reviews:142,img:"eksplore/market-wairinding.jpg.jpg",detail:true},
  {id:"praijing",name:"Desa Adat Praijing",subtitle:"Desa Praijing",category:"Budaya",type:"Destinasi",price:100000,rating:"4.9",reviews:157,img:"eksplore/market-praijing.jpg.jpg"},
  {id:"lapopu",name:"Air Terjun Lapopu",subtitle:"Desa Matelowa",category:"Air Terjun",type:"Destinasi",price:135000,rating:"4.7",reviews:107,img:"eksplore/market-lapopu.jpg.jpg"},
  {id:"lodge",name:"Uma Kapu Eco Lodge",subtitle:"Desa Wanokaka",category:"Penginapan",type:"Penginapan",price:950000,rating:"4.8",reviews:148,img:"eksplore/market-lodge.jpg.jpg",unit:"malam"},
  {id:"car",name:"Sewa Mobil + Driver",subtitle:"Sumba Timur",category:"Transportasi",type:"Transportasi",price:450000,rating:"4.9",reviews:207,img:"eksplore/market-car.jpg.jpg",unit:"hari"},
  {id:"guide",name:"Guide Lokal Sumba",subtitle:"Sumba Timur",category:"Guide Lokal",type:"Guide Lokal",price:250000,rating:"5.0",reviews:88,img:"eksplore/market-guide.jpg.jpg"},
  {id:"tenun",name:"Kain Tenun Sumba",subtitle:"Produk lokal",category:"Produk Lokal",type:"Produk Lokal",price:325000,rating:"5.0",reviews:88,img:"eksplore/market-tenun.jpg.jpg",unit:"kain"},
  {id:"food",name:"Paket Makan Siang Sumba",subtitle:"Kuliner",category:"Kuliner",type:"Kuliner",price:325000,rating:"4.8",reviews:92,img:"eksplore/market-food.jpg.jpg",unit:"paket"},
  {id:"tour",name:"Bukit Wairinding Tour",subtitle:"Paket Wisata",category:"Paket Wisata",type:"Paket Wisata",price:575000,rating:"4.8",reviews:181,img:"eksplore/market-tour.jpg.jpg"},
  {id:"weekuri",name:"Snorkelling Weekuri Lagoon",subtitle:"Aktivitas",category:"Aktivitas",type:"Aktivitas",price:375000,rating:"4.7",reviews:66,img:"eksplore/market-weekuri.jpg.jpg"},
  {id:"festival",name:"Festival Budaya Sumba",subtitle:"Paket Wisata",category:"Paket Wisata",type:"Paket Wisata",price:610000,rating:"4.6",reviews:134,img:"eksplore/market-festival.jpg.jpg"}
];

// BAGIAN: DATA POPULER HOMEPAGE | Array ini dirender ke elemen data-render="home-popular" oleh renderCards() dalam app.js.
const homePopular = [
  {id:"walakiri",name:"Pantai Walakiri",subtitle:"Desa Watumbaka",price:125000,rating:"4.8",reviews:320,img:"home/card-walakiri.jpg.jpg",detail:true},
  {id:"waingapu",name:"Kampung Raja Prailiu",subtitle:"Prailiu, Kambera",price:120000,rating:"4.8",reviews:256,img:"home/card-prailiu.jpg.jpg",detail:true},
  {id:"londa",name:"Pantai Londa Lima",subtitle:"Desa Kuta",price:100000,rating:"4.6",reviews:156,img:"home/card.londa.jpg.jpg",detail:true},
  {id:"lambanapu",name:"Situs Lambanapu",subtitle:"Kelurahan Lambanapu",price:100000,rating:"4.8",reviews:181,img:"home/card-dig.jpg.jpg",detail:true},
  {id:"horse",name:"Bukit Wairinding",subtitle:"Desa Pambotanjara",price:120000,rating:"4.7",reviews:142,img:"home/card-horse.jpg.jpg",detail:true}
];

// BAGIAN: DATA PRODUK UMKM | Produk lokal yang dapat ditampilkan pada card dan rekomendasi detail destinasi.
const umkmProducts = [
  {id:"tenun-a",name:"Kain Tenun Ikat Sumba",subtitle:"Tenun tradisional dengan motif khas Prailiu",price:250000,img:"detailprailiu/umkm-tenun.jpg.jpg"},
  {id:"gantungan",name:"Gantungan Kunci Tenun",subtitle:"Gantungan kunci aneka ragam yang menarik.",price:25000,img:"detailprailiu/umkm-gantungan.jpg.jpg"},
  {id:"figur",name:"Figur Khas Sumba",subtitle:"Figur dekoratif dengan ukiran khas Sumba.",price:40000,img:"detailprailiu/umkm-figur.jpg.jpg"},
  {id:"mamuli",name:"Mamuli",subtitle:"Perhiasan logam berharga khas Sumba",price:100000,img:"detailprailiu/umkm-mamuli.jpg.jpg"}
];

// BAGIAN: DATA DETAIL DESTINASI | Object menggunakan ID sebagai kunci. extended.js membaca URL ?id=... lalu mengambil detail, galeri, fasilitas, dan produk terkait dari sini.
const detailDestinations = {
  londa: {
    id:"londa", name:"Pantai Londa Lima", category:"Destinasi Pantai",
    location:"Desa Kuta, Kanatang", price:100000, rating:"4.6", reviews:156,
    img:"home/card.londa.jpg.jpg", description:"Pantai berpasir putih dengan laut tenang, ruang bersantai yang luas, dan akses yang mudah dari Waingapu.",
    tags:["Pantai","Kuliner Lokal","Spot Foto","Family Friendly"],
    hours:"09.00 - 17.30 WITA", duration:"1,5 - 3 jam", access:"Jalan beraspal, kondisi baik",
    facilities:"Parkir, toilet, warung", guide:"Tidak diperlukan", weather:"Cerah berawan",
    distance:"18 km, sekitar 30 menit",
    gallery:["detail londa lima/Rectangle 452.png","detail londa lima/Rectangle 453.png","detail londa lima/Rectangle 455.png","detail londa lima/Rectangle 456.png"],
    mapImage:"detail londa lima/Rectangle 567.png",
    experienceIcons:["Beach.svg","Sea Waves.svg","Sunset.svg","Food.svg"],
    products:[
      {id:"londa-snack",name:"Camilan Laut Lokal",subtitle:"Keripik ikan dan rumput laut khas Sumba Timur",price:20000,img:"detail londa lima/Rectangle 480.png",unit:"paket"},
      {id:"londa-warung",name:"Produk Warung Lokal",subtitle:"Pilihan makanan ringan dari pelaku UMKM sekitar pantai",price:25000,img:"detail londa lima/Rectangle 481.png",unit:"paket"},
      {id:"londa-kopi",name:"Kopi & Oleh-oleh Sumba",subtitle:"Kopi lokal dan oleh-oleh khas daerah",price:45000,img:"detail londa lima/Rectangle 482.png",unit:"paket"},
      {id:"londa-craft",name:"Kerajinan Keranjang",subtitle:"Kerajinan tangan berbahan alami",price:35000,img:"detail londa lima/Rectangle 483.png",unit:"buah"}
    ],
    reviewAvatars:["detail londa lima/Ellipse 37.png","detail londa lima/Ellipse 38.png","detail londa lima/Ellipse 39.png"],
    similarImages:["detail londa lima/Rectangle 489.png","detail londa lima/Rectangle 490.png","detail londa lima/Rectangle 491.png","detail londa lima/Rectangle 492.png"],
    iconFolder:"detail londa lima"
  },
  lambanapu: {
    id:"lambanapu", name:"Situs Lambanapu", category:"Destinasi Budaya",
    location:"Kelurahan Lambanapu, Kambera", price:100000, rating:"4.8", reviews:181,
    img:"home/card-dig.jpg.jpg", description:"Situs megalitik penting yang menyimpan jejak sejarah, pengetahuan lokal, dan kekayaan budaya masyarakat Sumba Timur.",
    tags:["Budaya","Edukasi","Sejarah Lokal","Family Friendly"],
    hours:"08.00 - 16.30 WITA", duration:"1 - 2 jam", access:"Jalan beraspal, kondisi baik",
    facilities:"Parkir, toilet", guide:"Opsional, tersedia di lokasi", weather:"Cerah berawan",
    distance:"10 km, sekitar 20 menit",
    gallery:["detail situs lambanapu/Rectangle 452.png","detail situs lambanapu/Rectangle 453.png","detail situs lambanapu/Rectangle 455.png","detail situs lambanapu/Rectangle 456.png"],
    experienceIcons:["Statue.svg","University.svg","Books.svg","Camera.svg"],
    products:[
      {id:"lambanapu-artifact",name:"Replika Artefak",subtitle:"Replika edukatif peninggalan budaya lokal",price:100000,img:"detail situs lambanapu/Rectangle 480.png",unit:"buah"},
      {id:"lambanapu-craft",name:"Kerajinan Arkeologi",subtitle:"Produk kerajinan terinspirasi temuan Lambanapu",price:75000,img:"detail situs lambanapu/Rectangle 481.png",unit:"buah"},
      {id:"lambanapu-stone",name:"Miniatur Batu Budaya",subtitle:"Miniatur koleksi bernuansa sejarah Sumba",price:85000,img:"detail situs lambanapu/Rectangle 482.png",unit:"buah"},
      {id:"lambanapu-book",name:"Paket Edukasi Sejarah",subtitle:"Materi pengenalan situs dan budaya Lambanapu",price:65000,img:"detail situs lambanapu/Rectangle 483.png",unit:"paket"}
    ],
    reviewAvatars:["detail situs lambanapu/Ellipse 37.png","detail situs lambanapu/Ellipse 38.png","detail situs lambanapu/Ellipse 39.png"],
    iconFolder:"detail situs lambanapu"
  },
  walakiri: {
    id:"walakiri", name:"Pantai Walakiri", category:"Destinasi Pantai",
    location:"Desa Watumbaka, Pandawai", price:125000, rating:"4.8", reviews:320,
    img:"home/card-walakiri.jpg.jpg", description:"Pantai ikonik dengan pohon bakau, air dangkal yang tenang, dan panorama sunset yang menjadi ciri khas Sumba Timur.",
    tags:["Sunset Spot","Pantai Tenang","Spot Foto","Family Friendly"],
    hours:"16.00 - 18.30 WITA", duration:"1,5 - 2 jam", access:"Jalan beraspal, kondisi baik",
    facilities:"Parkir, toilet, warung", guide:"Opsional", weather:"Cerah berawan",
    distance:"30 km, sekitar 50 menit",
    gallery:["detail pantai walakiri/Rectangle 452.png","detail pantai walakiri/Rectangle 453.png","detail pantai walakiri/Rectangle 455.png","detail pantai walakiri/Rectangle 456.png"],
    experienceIcons:["Sunset.svg","National Park.svg","Sea Waves.svg","Camera.svg"],
    products:[
      {id:"walakiri-food",name:"Warung Seafood",subtitle:"Pilihan makanan laut dari warung lokal",price:55000,img:"detail pantai walakiri/Rectangle 480.png",unit:"porsi"},
      {id:"walakiri-bracelet",name:"Gelang Manik Pantai",subtitle:"Aksesori warna-warni inspirasi laut Sumba",price:35000,img:"detail pantai walakiri/Rectangle 481.png",unit:"buah"},
      {id:"walakiri-coffee",name:"Kopi & Oleh-oleh Sumba",subtitle:"Kopi lokal untuk teman menikmati senja",price:55000,img:"detail pantai walakiri/Rectangle 482.png",unit:"paket"},
      {id:"walakiri-shell",name:"Gantungan Kerang",subtitle:"Aksesori kerang buatan pengrajin lokal",price:20000,img:"detail pantai walakiri/Rectangle 483.png",unit:"buah"}
    ],
    iconFolder:"detail pantai walakiri"
  },
  wairinding: {
    id:"wairinding", name:"Bukit Wairinding", category:"Destinasi Alam",
    location:"Desa Pambotanjara, Pandawai", price:120000, rating:"4.7", reviews:142,
    img:"eksplore/market-wairinding.jpg.jpg", description:"Panorama perbukitan bergelombang dengan hamparan savana luas, cocok untuk sunrise, sunset, dan fotografi lanskap.",
    tags:["Alam","Sunrise & Sunset","Spot Foto","Family Friendly"],
    hours:"06.00 - 18.00 WITA", duration:"1,5 - 2 jam", access:"Jalan baik, dapat dilalui mobil",
    facilities:"Parkir, toilet, warung", guide:"Opsional", weather:"Cerah berawan",
    distance:"30 km, sekitar 45 menit",
    gallery:["detail bukit wairinding/Rectangle 452.png","detail bukit wairinding/Rectangle 453.png","detail bukit wairinding/Rectangle 455.png","detail bukit wairinding/Rectangle 456.png"],
    experienceIcons:["National Park.svg","Sunset.svg","Camera.svg","Warranty.svg"],
    products:[
      {id:"wairinding-tenun",name:"Kain Tenun Ikat Sumba",subtitle:"Tenun tradisional khas Sumba Timur",price:250000,img:"detail bukit wairinding/Rectangle 480.png",unit:"kain"},
      {id:"wairinding-honey",name:"Madu Hutan Sumba",subtitle:"Madu murni dari kawasan hutan Sumba",price:80000,img:"detail bukit wairinding/Rectangle 481.png",unit:"botol"},
      {id:"wairinding-coffee",name:"Kopi dan Oleh-oleh Sumba",subtitle:"Kopi lokal dan pilihan oleh-oleh khas",price:75000,img:"detail bukit wairinding/Rectangle 482.png",unit:"paket"},
      {id:"wairinding-craft",name:"Gelang Manik Lokal",subtitle:"Aksesori buatan pengrajin setempat",price:35000,img:"detail bukit wairinding/Rectangle 483.png",unit:"buah"}
    ],
    reviewAvatars:["detail bukit wairinding/Ellipse 37.png","detail bukit wairinding/Ellipse 38.png","detail bukit wairinding/Ellipse 39.png"],
    iconFolder:"detail pantai walakiri"
  },
  waingapu: {
    id:"waingapu", name:"Kampung Raja Prailiu", category:"Destinasi Budaya",
    location:"Prailiu, Kambera", price:120000, rating:"4.8", reviews:256,
    img:"detailprailiu/detail-main.jpg.jpg", description:"Kampung adat yang menghadirkan rumah tradisional, tenun ikat, dan kehidupan masyarakat Sumba yang masih lestari.",
    tags:["Budaya","Rumah Adat","Tenun Ikat","Family Friendly"],
    hours:"08.00 - 16.30 WITA", duration:"1,5 - 2 jam", access:"Jalan beraspal",
    facilities:"Parkir, toilet, gazebo", guide:"Tersedia guide lokal", weather:"Cerah berawan",
    distance:"5 km, sekitar 15 menit"
  }
};

// BAGIAN: NILAI AWAL TRIP | Dipakai ketika pengguna belum memiliki rencana tersimpan; berisi tanggal, jumlah orang, transportasi, makan, penginapan, dan tarif layanan.
const tripDefaults = {
  startDate:"2026-06-12",
  endDate:"2026-06-15",
  adults:2,
  transport:"Mobil pribadi",
  accommodationPerNight:450000,
  mealPerPersonPerDay:125000,
  nights:3,
  days:4,
  serviceRate:0.05
};
