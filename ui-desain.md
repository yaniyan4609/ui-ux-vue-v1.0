# Panduan Arsitektur & Desain UI — Digaji.id (Vue 3 Modular UI)

Dokumen ini adalah **pedoman resmi dan panduan implementasi teknis** untuk seluruh pengembang (*developer*) dan AI Agent yang bekerja pada codebase ini. Semua komponen antarmuka, filosofi tata letak, palet warna, dan aturan interaksi dijelaskan secara menyeluruh agar siap pakai secara langsung tanpa menebak-nebak.

---

## 1. Filosofi Arsitektur: 2-Layer Layout (Dasar Pertama & Dasar Kedua)

Aplikasi ini mengadopsi prinsip desain modular berjenjang **2 Layer**:

```
+-----------------------------------------------------------------------------------+
| 1. DASAR PERTAMA (Outer Backdrop Layer)                                           |
|    - Pola Latar: Grid, Dots, Solid Color, atau Background Image                   |
|    - Header Topbar: Logo Brand | Digaji.id  ----  Tema | Lonceng | Profil        |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | 2. DASAR KEDUA (Inner Application Surface / Floating Card)                  |  |
|  |    +------------+----------------+---------------------------------------+  |  |
|  |    | PRIMARY    | SUBMENU        | MAIN CONTENT WORKSPACE                |  |  |
|  |    | MENU RAIL  | (Collapsible)  | (Beranda / Data / Setting)            |  |  |
|  |    | Capsule    | Sliding Pill   | Overflow Scroll / Table               |  |  |
|  |    +------------+----------------+---------------------------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### Layer 1: Dasar Pertama (`Base Layer 1`)
- **Fungsi**: Kanvas terluar aplikasi yang mengelilingi kartu utama.
- **Konfigurasi Dinamis**: Dikontrol melalui `useBackground.js` dengan opsi:
  - `grid`: Pola garis kisi modern (`bg-grid-pattern`).
  - `dots`: Pola bintik elegan (`bg-dots-pattern`).
  - `solid`: Warna solid kustom (HEX).
  - `image`: URL gambar latar bertekstur/wallpaper.
- **Header Topbar**: Menempel di Dasar Pertama:
  - Sisi Kiri: `Logo Box` bersudut melengkung + Garis vertikal `|` + Nama brand `Digaji.id`.
  - Sisi Kanan: Single button switch tema (Sun/Moon dengan animasi lingkaran View Transition API), Lonceng Notifikasi, dan Avatar Profil.
  - **Aturan**: Hamburger menu di header **dihilangkan**; toggle navigasi mobile dialihkan ke floating button di pojok bawah.

### Layer 2: Dasar Kedua (`Base Layer 2 - Floating Card`)
- **Fungsi**: Wadah (*container*) utama seluruh konten aplikasi.
- **Desktop**:
  - Tampil sebagai kartu melayang bersudut bulat (`rounded-2xl lg:rounded-3xl`).
  - Diberi border tegas (`border-2 border-neutral-300 dark:border-[#27272a]`) dan bayangan lembut (`shadow-xl`).
  - Margin luar super mepet (`px-1.5 md:px-2 lg:px-2.5 sm:pb-2`) agar memaksimalkan area kerja.
- **Mobile**:
  - Menempel mepet ke tepi kiri, kanan, dan atas layar dengan sudut atas lengkung (`rounded-t-[32px]`).

---

## 2. Navigasi & Drawer Mobile (Wireframe Standard)

Navigasi aplikasi mengadopsi sistem **Dual-Sidebar Rail**:

### Desktop Sidebar Rail
1. **Primary Rail (`PrimarySidebar.vue`)**:
   - Kolom sempit (`w-20 sm:w-22`) berisi pill vertikal item menu utama: **Beranda**, **Data**, **Setting**.
   - Setiap item menampilkan ikon Lucide di atas teks label ringkas.
   - Status aktif ditandai dengan background warna tema (`var(--theme-primary)`), teks putih/kontras, dan garis indikator samping.
2. **Submenu Sidebar (`SubmenuSidebar.vue`)**:
   - Muncul otomatis jika menu aktif memiliki sub-menu (misal: menu **Setting** atau **Data**).
   - Dilengkapi **Sliding Active Pill**: background indikator aktif meluncur mulus ke atas/bawah menggunakan animasi kurva `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Dapat dilipat (*collapse*) menggunakan tombol panah di header submenu atau floating button `>` di garis pembatas antar kolom.

### Mobile Drawer (100% Wireframe Compliant)
- **Mepet Penuh Atas-Bawah**: Panel drawer mobile membentang penuh dari atas ke bawah (`inset-y-0 left-0 h-full rounded-r-[32px] sm:rounded-r-[36px]`).
- **Animasi Geser Kanan-Kiri**:
  - Buka: Meluncur dari kiri ke kanan (`-translate-x-full` $\rightarrow$ `translate-x-0`).
  - Tutup: Meluncur keluar dari kanan ke kiri (`translate-x-0` $\rightarrow$ `-translate-x-full`).
  - Backdrop gelap independen dengan animasi *fade-in/fade-out*.
- **Kolom Menu Kapsul**: Kolom `PrimarySidebar` di mobile menggunakan mode `capsule` (`rounded-[26px] bg-neutral-100/90 dark:bg-[#1a1a1e] h-[calc(100%-24px)] my-3 ml-3`), presisi mengikuti sketsa Wireframe.
- **Floating Toggle Button**:
  - Terletak di pojok kiri bawah layar: `fixed bottom-7 left-6 sm:bottom-8 sm:left-7 z-60`.
  - Berbentuk squircle dengan border 2px dan efek klik `active:scale-90`.
  - **Ikon Khusus**:
    - Saat Tertutup: Ikon squircle dengan panah `>` di kiri dan garis vertikal di kanan.
    - Saat Terbuka: Ikon squircle dengan garis vertikal di kiri dan panah `<` di kanan.

---

## 3. Sistem Tema & Warna (4 Tema Resmi)

Aplikasi mendukung 4 tema warna yang dapat diubah secara instan di menu **Setting $\rightarrow$ Dasar Pertama**:

| Nama Tema | Primary Token | Hex Brand | Latar Terang | Latar Gelap (Dark Mode) |
|---|---|---|---|---|
| **Default** | `--theme-primary` | `#18181b` (Light) / `#ffffff` (Dark) | `#F8FAFC` | `#09090b` *(Pure Neutral Dark, 0% Blue Tint)* |
| **Pink** | `--theme-primary` | `#E85D88` (CTA: `#C83D6A`) | `#FFF8FB` | `#140810` / Surface `#1e0e18` |
| **Blue** | `--theme-primary` | `#007AFF` (CTA: `#007AFF`) | `#F8FAFC` | `#0c1527` / Surface `#111c35` |
| **Terracotta** | `--theme-primary` | `#C03A18` (Action: `#C03A18`) | `#F3F1EC` *(Warm Sand)* | `#15120F` *(Charcoal Warm)* |

### Variabel CSS Tema Global
Gunakan selalu variabel CSS berikut saat mendesain UI baru agar otomatis menyesuaikan tema aktif:
- `var(--theme-primary)`: Warna tombol utama, link aktif, border fokus, dan aksen SVG.
- `var(--theme-primary-text)`: Warna teks di atas tombol primary (biasanya putih).
- `var(--theme-primary-soft)`: Latar belakang badge soft, tab aktif sekunder, atau sorotan menu.
- `var(--theme-bg)`: Warna latar belakang Dasar Pertama.
- `var(--theme-surface)`: Warna latar card atau modal Dasar Kedua.
- `var(--theme-border)`: Garis pemisah atau border input.

---

## 4. Katalog Komponen Base UI (`src/components/ui/`)

Semua komponen berikut bersifat **reusable**, mandiri, dan bebas ketergantungan library luar (*zero external heavy libraries*).

### 4.1 `BaseInput.vue` & `BaseCurrencyInput.vue` (Input Teks & Mata Uang)

#### `BaseInput.vue`
Input teks serbaguna dengan dukungan label, tanda wajib `*`, leading/trailing icon, pesan error validasi animasi halus, dan tombol clear `×`.

```vue
<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { Search, Mail } from 'lucide-vue-next'

const nama = ref('')
const email = ref('')
const keyword = ref('')
</script>

<template>
  <BaseInput
    v-model="nama"
    label="Nama Lengkap"
    required
    placeholder="Masukkan nama..."
    hint="Sesuai kartu identitas resmi."
    clearable
  />

  <BaseInput
    v-model="email"
    type="email"
    label="Email Kantor"
    :leading-icon="Mail"
    error="Format email tidak valid"
  />

  <BaseInput
    v-model="keyword"
    placeholder="Cari data..."
    :leading-icon="Search"
    size="sm"
  />
</template>
```

#### `BaseCurrencyInput.vue` (Auto Rupiah & Terbilang)
Input khusus mata uang Rupiah Indonesia. Mengetik `1000` otomatis terformat menjadi `1.000`. Nilai `v-model` tetap berupa angka murni (`Number`), mempertahankan posisi kursor saat mengetik di tengah angka, serta mendukung konversi kata terbilang otomatis.

```vue
<script setup>
import { ref } from 'vue'
import BaseCurrencyInput from '@/components/ui/BaseCurrencyInput.vue'

const gaji = ref(15000000) // Nilai murni: 15000000
</script>

<template>
  <BaseCurrencyInput
    v-model="gaji"
    label="Gaji Pokok Pegawai"
    required
    suffix="/ bulan"
    terbilang
    hint="Ketik angka nominal tanpa tanda baca titik."
  />
  <!-- Output terbilang live di bawah input: "Lima Belas Juta Rupiah" -->
</template>
```

---

### 4.2 `BaseSearchableSelect.vue` (Dropdown Pencarian Cantik Soft-Color)
Dropdown pilihan dengan input pencarian terintegrasi, soft-color badge, dukungan navigasi keyboard (Up/Down/Enter/Esc), opsi grup, dan tombol reset.

```vue
<script setup>
import { ref } from 'vue'
import BaseSearchableSelect from '@/components/ui/BaseSearchableSelect.vue'

const selectedProvinsi = ref('')
const provinsiOptions = [
  { value: 'Jawa Timur', label: 'Jawa Timur', badge: '12 Gunung' },
  { value: 'Jawa Tengah', label: 'Jawa Tengah', badge: '10 Gunung' },
  { value: 'Jawa Barat', label: 'Jawa Barat', badge: '8 Gunung' },
]
</script>

<template>
  <BaseSearchableSelect
    v-model="selectedProvinsi"
    :options="provinsiOptions"
    label="Provinsi"
    placeholder="Pilih atau cari provinsi..."
    clearable
  />
</template>
```

---

### 4.3 `BaseButton.vue`
Tombol aksi standar dengan berbagai varian dan status *loading spinner*.

```vue
<template>
  <!-- Varian: primary, secondary, outline, danger, ghost -->
  <BaseButton variant="primary" size="md" @click="simpan">
    Simpan Data
  </BaseButton>

  <BaseButton variant="outline" size="sm" :loading="isLoading">
    Segarkan
  </BaseButton>
</template>
```

---

### 4.4 `BaseModal.vue` & `MobileModal.vue` (Auto-Adaptive Modal System)

> [!IMPORTANT]
> **Aturan Wajib**: Selalu gunakan `BaseModal.vue` untuk modal dialog maupun form tambah/edit.
> `BaseModal` secara cerdas memiliki properti bawaan `adaptive: true` (default):
> - **Layar Desktop ($\ge 768\text{px}$)**: Otomatis tampil sebagai **Centered Modal Dialog** dengan *backdrop blur*.
> - **Layar Mobile ($< 768\text{px}$)**: Otomatis bertransformasi menjadi **`MobileModal.vue`** (*Bottom Sheet iOS-style* dengan handle geser ke bawah untuk menutup).

```vue
<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const isModalOpen = ref(false)
</script>

<template>
  <BaseModal
    v-model="isModalOpen"
    title="Formulir Tambah Data"
    subtitle="Isi data lengkap di bawah ini"
    size="lg"
  >
    <!-- Konten Form / Body (Otomatis touch-friendly & scrollable di mobile) -->
    <div class="space-y-4">
      <BaseInput label="Nama" required />
    </div>

    <!-- Sticky Footer Aksi -->
    <template #footer="{ close }">
      <BaseButton variant="outline" size="sm" @click="close">
        Batal
      </BaseButton>
      <BaseButton variant="primary" size="sm" @click="submit">
        Simpan Data
      </BaseButton>
    </template>
  </BaseModal>
</template>
```

---

### 4.5 `BaseSkeleton.vue` (Shimmer Wave Placeholder)
Placeholder pemuatan data dengan animasi sapuan kilau (*shimmer sweep wave*). Digunakan agar tidak menampilkan layar kosong saat mengambil data.

```vue
<script setup>
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
</script>

<template>
  <!-- Varian: 'card' (wadah kartu lengkap), 'text', 'circular', 'rectangular' -->
  <BaseSkeleton variant="card" />

  <!-- Single baris teks / custom -->
  <BaseSkeleton width="180px" height="16px" />

  <!-- Lingkaran avatar -->
  <BaseSkeleton variant="circular" width="40px" height="40px" />

  <!-- Multi-line text -->
  <BaseSkeleton variant="text" :lines="3" />
</template>
```

---

### 4.6 `BaseCountUp.vue` (Animasi Angka Bergulir / Ticker)
Komponen penampil angka beranimasi dari 0 ke nilai target menggunakan kurva `ease-out cubic` via `requestAnimationFrame`. Ringan, halus, dan mendukung format mata uang Rupiah.

```vue
<script setup>
import BaseCountUp from '@/components/ui/BaseCountUp.vue'
</script>

<template>
  <!-- Format Angka Biasa -->
  <BaseCountUp :to="142" suffix=" order" />

  <!-- Format Rupiah -->
  <BaseCountUp :to="7850000" prefix="Rp " />

  <!-- Format Desimal & Persen -->
  <BaseCountUp :to="85.7" :decimals="1" suffix="%" />
</template>
```

---

### 4.7 `BaseBadge.vue` & `BaseTag.vue`
Penyaji status atau kategori dalam warna-warna *soft color*.

```vue
<template>
  <!-- Varian: neutral, success, danger, warning, info, purple -->
  <BaseBadge variant="success" dot pulse>Aktif</BaseBadge>
  <BaseBadge variant="warning">Pending</BaseBadge>
  <BaseBadge variant="danger">Kritis</BaseBadge>
  <BaseBadge variant="purple" size="sm">Pro Modul</BaseBadge>
</template>
```

---

### 4.8 `BaseSwitch.vue` & `BaseTextarea.vue`

```vue
<template>
  <!-- BaseSwitch: Toggle Apple-style yang halus -->
  <BaseSwitch
    v-model="notifikasiAktif"
    label="Pemberitahuan Email"
    description="Kirim ringkasan laporan otomatis setiap pagi."
  />

  <!-- BaseTextarea: Auto-expand dengan counter karakter -->
  <BaseTextarea
    v-model="catatan"
    label="Catatan Khusus"
    placeholder="Tuliskan keterangan..."
    :rows="3"
    :maxlength="250"
  />
</template>
```

---

### 4.9 `BasePagination.vue`
Komponen kontrol paginasi mandiri yang terintegrasi dengan tabel atau list data.

```vue
<template>
  <BasePagination
    :current-page="currentPage"
    :total-pages="totalPages"
    :total-items="totalItems"
    :items-per-page="itemsPerPage"
    :per-page-options="[15, 30, 50]"
    @update:current-page="currentPage = $event"
    @update:items-per-page="itemsPerPage = $event"
  />
</template>
```

---

### 4.10 `BaseDropdownMenu.vue` (Action Menu •••)
Menu popover melayang untuk kolom aksi tabel atau header kartu.

```vue
<template>
  <BaseDropdownMenu
    :items="[
      { label: 'Lihat Detail', icon: Eye, action: () => bukaDetail(row) },
      { label: 'Edit Data', icon: Edit2, action: () => bukaEdit(row) },
      { divider: true },
      { label: 'Hapus', icon: Trash2, danger: true, action: () => hapus(row) },
    ]"
  />
</template>
```

---

### 4.11 `BaseCommandPalette.vue` (Global Search & Quick Actions `Ctrl + K`)
Pusat komando dan pencarian cepat berbasis pintasan keyboard (`Ctrl + K` / `Cmd + K`):
- **Navigasi Cepat**: Langsung berpindah ke Dashboard, Data Pegawai, Data Gunung, atau Pengaturan.
- **Aksi Cepat Sistem**: Mengganti tema gelap/terang, berganti palet warna (Default, Terracotta, Pink, Blue).
- **Pencarian Data**: Menemukan nama pegawai atau nama gunung secara instan.
- **Dukungan Keyboard Penuh**: Panah Atas/Bawah untuk navigasi, `Enter` untuk memilih, `Esc` untuk menutup.

```vue
<template>
  <!-- Mount global di AppLayout.vue -->
  <BaseCommandPalette v-model="isCommandPaletteOpen" />
</template>
```

---

### 4.12 `BaseDatePicker.vue` (Kalender Mandiri Single & Range Mode)
Komponen pemilih tanggal enterprise tanpa dependensi eksternal:
- **Mode Fleksibel**: Mendukung pemilihan tanggal tunggal (*single date*) atau rentang tanggal (*date range*).
- **Preset Instan Cepat**: Pilihan "Hari Ini", "7 Hari Terakhir", "30 Hari Terakhir", dan "Bulan Ini".
- **Format Tampilan Indonesia**: Menampilkan label ramah pengguna (contoh: `27 Jan 2025` atau `21 Jan 2025 - 27 Jan 2025`), sementara `v-model` menyimpan format ISO standar `YYYY-MM-DD`.

```vue
<template>
  <!-- Mode Single Date -->
  <BaseDatePicker
    v-model="tanggalMasuk"
    label="Tanggal Masuk"
    placeholder="Pilih tanggal..."
  />

  <!-- Mode Range Date dengan Presets -->
  <BaseDatePicker
    v-model="periodeFilter"
    range
    label="Rentang Waktu"
    placeholder="Pilih rentang tanggal..."
    @change="handleFilterChange"
  />
</template>
```

---

### 4.13 `BaseEmptyState.vue` (Ilustrasi Status Kosong Soft Badge)
Penyaji status ketika hasil pencarian atau tabel bernilai 0:
- Menghindari halaman tampak patah atau kosong melompong.
- Dilengkapi ilustrasi halo bertema lembut, judul, deskripsi pemecahan masalah, dan tombol aksi (*call-to-action*).

```vue
<template>
  <BaseEmptyState
    :icon="FolderSearch"
    title="Data Tidak Ditemukan"
    description="Coba gunakan kata kunci lain atau bersihkan filter pencarian."
    actionText="Bersihkan Filter"
    @action="resetFilter"
  />
</template>
```

---

### 4.14 Multi-Select Checkbox, Floating Batch Bar & Ekspor CSV
Fitur produktivitas tabel data skala enterprise di [`DataKaryawanView.vue`](file:///c:/Users/yaniy/OneDrive/Documents/PROJEK/Template%20VUE/src/views/DataKaryawanView.vue):
- **Pilih Semua (Select All)**: Mengontrol semua baris dalam halaman aktif atau seluruh dataset.
- **Floating Batch Action Bar**: Bilah aksi mengambang di bagian bawah layar saat $\ge 1$ baris terpilih, dengan tombol *Ekspor CSV Terpilih* dan *Hapus Terpilih*.
- **Ekspor CSV Sesuai Standar RFC 4180**:
  - Mengikutsertakan UTF-8 BOM (`\uFEFF`) agar teks dan angka terbuka rapi di Microsoft Excel tanpa rusak encoding.
  - Nilai dengan koma atau tanda petik otomatis dibungkus tanda kutip ganda secara aman.

---

### 4.15 `BaseSlideOver.vue` (Slide-Over Detail Drawer)
Panel laci (*drawer*) yang meluncur mulus dari sisi kanan layar untuk menyajikan detail tanpa meninggalkan konteks halaman kerja:
- **Ukuran Fleksibel**: `sm` (max-w-sm), `md` (max-w-lg), `lg` (max-w-2xl), `xl` (max-w-3xl).
- **Aksesibilitas & Pintasan**: Menutup otomatis dengan tombol `Esc` atau klik area backdrop.
- **Scrollable Body & Sticky Footer**: Area konten dapat digeser bebas dengan tombol aksi tersemat di bagian bawah.

```vue
<template>
  <BaseSlideOver
    v-model="isDetailOpen"
    title="Detail Pesanan #ORD-9021"
    subtitle="PT Mandiri Graha"
    size="md"
  >
    <template #badge>
      <BaseBadge variant="warning">PROSES</BaseBadge>
    </template>

    <div class="space-y-4">
      <!-- Konten detail / timeline -->
    </div>

    <template #footer="{ close }">
      <BaseButton variant="outline" size="sm" @click="close">Tutup</BaseButton>
    </template>
  </BaseSlideOver>
</template>
```

---

### 4.16 `BaseTimeline.vue` (Garis Waktu & Audit Log)
Komponen jejak audit dan status berurutan dengan konektor vertikal yang rapi:
- **Varian Status Node**: `primary`, `success`, `warning`, `danger`, `info`, `neutral`.
- **Ikon Kustom / Otomatis**: Mendukung ikon Lucide kustom atau otomatis disesuaikan dengan varian status.
- **Slot Kustom**: Memungkinkan penyisipan tombol, bukti lampiran, atau tabel mini di setiap titik waktu.

```vue
<template>
  <BaseTimeline
    :items="[
      { id: 1, title: 'Pembayaran Lunas', time: '10:30 WIB', variant: 'success', author: 'Payment Gateway' },
      { id: 2, title: 'Produksi Mesin Cetak', time: '11:15 WIB', variant: 'primary', author: 'Operator' },
    ]"
    compact
  />
</template>
```

---

### 4.17 `BaseInvoiceModal.vue` (Faktur Resmi & Cetak Struk `@media print`)
Komponen pratinjau faktur/invoice penjualan resmi yang siap cetak:
- **Struktur Standar**: Nomor invoice, tanggal terbit, jatuh tempo, status lunas, rincian biaya, PPN 11%, dan total bayar.
- **Cetak Ramah Kertas**: Dilengkapi aturan `@media print` scoped sehingga saat dicetak melalui `window.print()`, header, sidebar, dan tombol aksi otomatis disembunyikan.

```vue
<template>
  <BaseInvoiceModal
    v-model="isInvoiceModalOpen"
    :invoice-data="dataInvoice"
  />
</template>
```

---

### 4.18 `BaseFileUploader.vue` (Drag & Drop File Upload)
Komponen pengunggah berkas mandiri dengan area seret & lepas:
- **Indikator Visual Dinamis**: Border putus-putus beranimasi dan beriak lembut saat berkas ditarik di atasnya.
- **Pratinjau Miniatur**: Menampilkan gambar asli untuk file foto/gambar, dan ikon warna tematik untuk PDF, Excel/CSV, ZIP, atau dokumen teks.
- **Validasi Berkas**: Validasi ukuran maksimal (MB) dan format ekstensi (`accept`).

```vue
<template>
  <BaseFileUploader
    v-model="uploadedFiles"
    label="Unggah Berkas Pendukung"
    hint="Format berkas: JPG, PNG, atau PDF (maks. 5 MB)"
    accept="image/*,.pdf"
    :max-size-m-b="5"
  />
</template>
```

---

### 4.19 `BaseCsvImporter.vue` (Wizard Impor Data CSV Klien)
Modal multi-tahap (3 langkah) untuk mengimpor berkas CSV ke dalam state tabel aplikasi secara instan:
1. **Langkah 1 (Unggah)**: Drag & drop atau pemilih file CSV lokal.
2. **Langkah 2 (Pemetaan Kolom)**: Parser cerdas membaca delimiter (`,` atau `;`), mendeteksi header secara otomatis, dan menyediakan dropdown pencocokan kolom CSV dengan field data sistem.
3. **Langkah 3 (Pratinjau & Selesai)**: Menampilkan 4 baris data teratas hasil pemetaan dan tombol konfirmasi impor.

```vue
<template>
  <BaseCsvImporter
    v-model="isImporterOpen"
    title="Impor Data Karyawan dari CSV"
    :target-fields="[
      { key: 'nama', label: 'Nama Lengkap', required: true },
      { key: 'jabatan', label: 'Jabatan', required: true },
      { key: 'gaji', label: 'Gaji Pokok', required: false },
    ]"
    @imported="handleDataImported"
  />
</template>
```

---

### 4.20 `KanbanView.vue` (Papan Alur Kanban Pipeline)
Halaman papan Kanban visual di rute `/pesanan/kanban`:
- **4 Kolom Tahapan Alur**: `Menunggu Pembayaran`, `Antrean Produksi`, `Quality Control`, dan `Selesai & Dikirim`.
- **Drag & Drop Native HTML5**: Geser kartu antar kolom tanpa dependensi library eksternal.
- **Metrik Kolom**: Counter jumlah order dan akumulasi total nominal Rupiah per kolom.
- **Aksi Cepat Kartu**: Buka rincian lengkap di `BaseSlideOver.vue` atau cetak faktur langsung di `BaseInvoiceModal.vue`.

---

## 5. Standar Desain Dashboard & Visualisasi SVG (Zero Library)

Dashboard operasional di [`DashboardView.vue`](file:///c:/Users/yaniy/OneDrive/Documents/PROJEK/Template%20VUE/src/views/DashboardView.vue) dibangun menggunakan pure SVG interaktif berkinerja tinggi tanpa library chart eksternal:

### 1. Kurva Bezier Bergelombang (*Undulating Wave Motion*)
- Titik koordinat SVG dihitung dinamis dengan osilasi harmonis:
  $$y_{\text{anim}} = y_{\text{base}} + \sin(\text{phase} + i \times 0.85) \times \text{amplitude}$$
- Menggunakan `requestAnimationFrame` pada 60 FPS.
- **Otomatis Pause saat Hover**: Ketika kursor diarahkan ke dalam diagram untuk membaca tooltip, gelombang otomatis dijeda agar data mudah dibaca.
- Dilengkapi tombol toggle manual **"Gelombang On / Off"**.

### 2. Standar Visualisasi Lainnya
- **Horizontal Bar Chart**: Bar memanjang dinamis dengan transisi CSS `transition-all duration-1000 ease-out`.
- **Radial Gauge & Donut Chart**: Menggunakan `circle` SVG dengan `stroke-dasharray` dan `stroke-dashoffset`.

---

## 6. Daftar Composable Pendukung (`src/composables/`)

| Composable | Deskripsi & Kegunaan |
|---|---|
| `useTheme.js` | Mengatur tema Gelap/Terang (`isDark`, `toggleTheme`) dengan efek visual lingkaran View Transition API. |
| `useThemeColor.js` | Mengatur palet warna brand (`themeColor`, `setThemeColor`: `default`, `pink`, `blue`, `terracotta`). |
| `useBackground.js` | Mengatur tipe latar Dasar Pertama (`bgType`: `grid`, `dots`, `solid`, `image`). |
| `useToast.js` | Menampilkan toast global non-blocking (`toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`). |
| `useIsMobile.js` | Mendeteksi ukuran layar secara reaktif (`isMobile`, breakpoint default 768px). |

---

## 7. Aturan Rekayasa & Panduan Menulis Kode (Golden Rules)

1. **Aturan Dark Mode Murni (*Zero Blue Tint*)**:
   - Untuk tema Default, warna latar gelap **wajib** menggunakan `#09090b` (bukan biru tua/navy `#0f172a`).
   - Warna card permukaan gelap menggunakan `#121214` atau `#141417`, dengan border `#27272a`.
2. **Aturan Format Rupiah**:
   - Setiap formulir nominal gaji, harga, atau omzet **wajib** menggunakan `BaseCurrencyInput.vue`.
   - Pada teks statis gunakan `.toLocaleString('id-ID')` atau `<BaseCountUp prefix="Rp " />`.
3. **Aturan Modal Responsif**:
   - Jangan membuat modal terpisah antara desktop dan mobile di halaman view. Cukup panggil `<BaseModal>`, sistem akan otomatis mengalihkannya ke Bottom Sheet di HP.
4. **Aturan Touch-Friendly pada Sheet Mobile**:
   - Area isi formulir pada `MobileModal` wajib mengizinkan `touch-auto select-auto` agar pengguna smartphone dapat menggeser form dan mengisi input tanpa terblokir gesture penutup sheet.
5. **Aturan Integritas Desain**:
   - Jangan menambahkan library charting atau UI bloated (seperti Bootstrap, Vuetify, Chart.js) ke dalam proyek. Semua base UI telah tersedia lengkap di folder `src/components/ui/`.

