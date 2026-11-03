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
  - **Aturan Navigasi Mobile**: Tombol toggle navigasi mobile terletak di header topbar pojok kiri atas (bersebelahan dengan logo Digaji.id) untuk aksesibilitas yang cepat, bersih, dan natural bagi jempol pengguna smartphone.

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
   - Kolom sempit (`w-20 sm:w-22`) berisi pill vertikal item menu utama: **Beranda**, **Pesanan**, **Data**, **Setting**.
   - Setiap item menampilkan ikon Lucide di atas teks label ringkas.
   - Status aktif ditandai dengan background warna tema (`var(--theme-primary)`), teks putih/kontras, dan garis indikator samping.
   - **Flyout Submenu on Hover (Saat Submenu Ditutup)**:
     - Ketika kolom submenu dilipat (*collapsed*), mengarahkan kursor mouse (*hover*) ke salah satu tombol menu utama yang memiliki sub-menu akan memunculkan **kartu melayang (*floating popover card*)** di sebelah kanannya.
     - Kartu menampilkan header menu, badge jumlah menu, tombol cepat buka permanen, dan seluruh daftar sub-menu berikon dengan indikator aktif rute.
     - Pengguna dapat langsung mengklik sub-menu tujuan secara instan tanpa perlu repot membuka kembali kolom submenu lebar-lebar.
     - Dilengkapi *safe hover bridge* dan jeda debouncing halus (160ms) agar kartu tidak berkedip atau tertutup saat kursor berpindah dari tombol menu ke dalam kartu.
2. **Submenu Sidebar (`SubmenuSidebar.vue`)**:
   - Berada dalam status **tertutup secara default (*collapsed by default*)** di desktop agar area kerja utama lebih luas dan lega.
   - Dilengkapi **Sliding Active Pill**: background indikator aktif meluncur mulus ke atas/bawah menggunakan animasi kurva `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Dapat dibuka/tutup menggunakan tombol panah di header submenu, floating button `>` di garis pembatas antar kolom, atau diakses instan via *Hover Flyout Card*.

### Mobile Drawer (100% Wireframe Compliant)
- **Mepet Penuh Atas-Bawah**: Panel drawer mobile membentang penuh dari atas ke bawah (`inset-y-0 left-0 h-full rounded-r-[32px] sm:rounded-r-[36px]`).
- **Animasi Geser Kanan-Kiri**:
  - Buka: Meluncur dari kiri ke kanan (`-translate-x-full` $\rightarrow$ `translate-x-0`).
  - Tutup: Meluncur keluar dari kanan ke kiri (`translate-x-0` $\rightarrow$ `-translate-x-full`).
  - Backdrop gelap independen dengan animasi *fade-in/fade-out*.
- **Kolom Menu Kapsul**: Kolom `PrimarySidebar` di mobile menggunakan mode `capsule` (`rounded-[26px] bg-neutral-100/90 dark:bg-[#1a1a1e] h-[calc(100%-24px)] my-3 ml-3`), presisi mengikuti sketsa Wireframe.
- **Toggle Button Mobile (Pojok Kiri Atas)**:
  - Terletak di header topbar sebelah kiri (bersebelahan dengan logo): `w-8.5 h-8.5 rounded-xl border border-neutral-300 dark:border-[#27272a]`.
  - Menggunakan ikon `Menu` (hamburger) saat tertutup, dan ikon `X` saat terbuka.
  - Efek klik `active:scale-95` dan outline ring berwarna tema saat aktif.
  - Bebas dari tumpang tindih elemen konten bawah (*clean viewport*).

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
- **Auto-Placement Pintar (*Dynamic Alignment*)**: Ketika trigger berada di paruh kanan layar (misal: kolom kedua modal form atau toolbar kanan), kalender otomatis menempel ke kanan (`right-0`) dan melebar ke kiri agar tidak terpotong tepi layar/modal. Sebaliknya jika di kiri, melebar ke kanan (`left-0`).
- **Kontras Tinggi di Dark & Light Mode**: Angka tanggal bulan aktif ditampilkan tegas (`text-neutral-900` di Light Mode, `text-[#f4f4f5]` di Dark Mode, `font-semibold`), hari di luar bulan tetap terbaca jelas (`text-neutral-400 dark:text-neutral-600`), dan tanggal hari ini ditandai dengan *ring outline* warna tema aktif. Tanggal yang dipilih (*selected*) terisolasi dari konflik spesifisitas Tailwind dengan teks kontras 100% (`var(--theme-primary-text)`: putih pekat di Light Mode, gelap pekat di Dark Mode).
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

### 4.21 `ConfirmationModal.vue` (Modal Konfirmasi Universal)
Komponen dialog konfirmasi tindakan penting (Simpan, Hapus, Peringatan, atau Berhasil):
- **4 Varian Tipe**: `delete` (merah bahaya), `save` (biru simpan), `warning` (kuning waspada), `success` (hijau sukses).
- **Badge & Ikon Tematik**: Ikon dan badge warna otomatis menyesuaikan varian tipe.
- **Dukungan Mobile Responsive**: Di desktop tampil sebagai dialog tengah dengan backdrop blur, di mobile tampil ramah sentuhan dengan tombol aksi berukuran penuh.

```vue
<script setup>
import { ref } from 'vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'

const isDeleteModalOpen = ref(false)

const handleConfirmDelete = () => {
  // Jalankan logika hapus data di sini
}
</script>

<template>
  <ConfirmationModal
    v-model="isDeleteModalOpen"
    type="delete"
    title="Hapus Data Karyawan"
    message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
    confirm-text="Ya, Hapus Data"
    cancel-text="Batal"
    @confirm="handleConfirmDelete"
  />
</template>
```

---

## 5. Standar Desain Dashboard & Visualisasi SVG (Zero Library)

Dashboard operasional di [`DashboardView.vue`](file:///c:/Users/yaniy/OneDrive/Documents/PROJEK/Template%20VUE/src/views/DashboardView.vue) dibangun menggunakan pure SVG interaktif berkinerja tinggi tanpa library chart eksternal:

### 1. Kurva Bezier Bergelombang (*Undulating Wave Motion*)
- Titik koordinat SVG dihitung dinamis dengan osilasi harmonis:
  $$y_{\text{anim}} = y_{\text{base}} + \sin(\text{phase} + i \times 0.85) \times \text{amplitude}$$
- Menggunakan `requestAnimationFrame` pada 60 FPS.
- **Otomatis Pause saat Hover**: Ketika kursor diarahkan ke dalam diagram untuk membaca tooltip, gelombang otomatis dijeda agar data mudah dibaca.
- **Tombol Gelombang Icon-Only**: Tombol toggle gelombang menggunakan tombol kotak icon-only (`w-8.5 h-8.5 rounded-xl border`) dengan ikon `Waves` animasi `animate-pulse` saat aktif dan tooltip informatif.

### 2. Standar Header Diagram 1 Garis Horizontal
Header kartu diagram diatur agar **selalu 1 baris horizontal** tanpa patah/wrapping pada layar desktop maupun laptop:
- Wadah luar: `flex items-center justify-between gap-2 min-w-0`
- Judul sisi kiri: `flex items-center gap-1.5 min-w-0` dengan teks berkelas `truncate`
- Kontrol sisi kanan: `flex items-center gap-1.5 shrink-0` (berisi tombol gelombang icon-only + wrapper datepicker `w-38 sm:w-44 shrink-0`)
- **Format Tanggal Compact di `BaseDatePicker`**: Bila rentang tanggal berada dalam bulan dan tahun yang sama, otomatis diformat ringkas (contoh: `21 – 27 Jan 2025` alih-alih `21 Jan 2025 — 27 Jan 2025`) sehingga tidak terpotong elipsis.

### 3. Standar Tipografi Angka & Satuan KPI Card (Anti-Collapsing)
Agar angka dari `BaseCountUp` dan label satuan (seperti `batch`, `tiket`, `pegawai`, `modul`, `staf`) tidak menempel rapat akibat browser whitespace collapsing:
```html
<div class="flex items-baseline gap-1.5 leading-none">
  <span class="text-lg sm:text-xl font-bold font-mono">
    <BaseCountUp :to="142" />
  </span>
  <span class="text-xs font-normal text-neutral-500 font-sans">batch</span>
</div>
```
- Menggunakan flexbox `items-baseline` untuk meratakan garis dasar font antara angka dan teks.
- Menggunakan `gap-1.5` (6px) untuk kepastian jarak fisik yang konsisten di semua browser.

### 4. Standar Visualisasi Lainnya
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

---

## 8. Katalog Halaman & Standar Arsitektur Halaman (*Page Design Patterns*)

Setiap halaman di folder `src/views/` mengikuti pola tata letak berjenjang yang konsisten agar mudah dipelihara dan memberikan pengalaman pengguna yang seragam.

```
+-----------------------------------------------------------------------------------+
| 1. HEADER HALAMAN                                                                 |
|    - Breadcrumb / Navigasi Mini                                                   |
|    - Judul Halaman (H1) + Badge Live Status                                       |
|    - Deskripsi Singkat Halaman                                                    |
|    - Tombol Aksi Utama (Refresh, Export, Tambah Data)                             |
+-----------------------------------------------------------------------------------+
| 2. RINGKASAN KPI / STATISTIK CEPAT (6 Cards Grid)                                 |
|    - Grid: 2 kolom (mobile), 3 kolom (tablet), 6 kolom (desktop)                  |
|    - BaseCountUp + Label Satuan (gap-1.5) + Indikator Tren Pertumbuhan            |
+-----------------------------------------------------------------------------------+
| 3. BILAH FILTER & PENCARIAN (Toolbar)                                             |
|    - Input Search (BaseInput dengan icon Search)                                  |
|    - Dropdown Filter (Status, Divisi/Kategori, Rentang Tanggal)                   |
|    - Tombol Aksi Tambahan (Impor CSV, Ekspor Excel)                               |
+-----------------------------------------------------------------------------------+
| 4. AREA KONTEN UTAMA                                                              |
|    - Mode Tabel (DataView / DataKaryawanView): Sticky Header + Multi-select       |
|    - Mode Kanban (KanbanView): 4 Kolom Drag & Drop HTML5                          |
|    - Mode Dashboard (DashboardView): SVG Wave Chart + Bar + Donut                 |
+-----------------------------------------------------------------------------------+
| 5. BILAH AKSI MASAL TERAPUNG (Hanya muncul jika >= 1 baris dicentang)             |
|    - Fixed Bottom Center: Jumlah Terpilih | Ekspor CSV | Hapus Massal | Batal     |
+-----------------------------------------------------------------------------------+
| 6. KONTROL PAGINASI & METRIK FOOTER                                               |
|    - BasePagination: Menampilkan item per halaman + navigasi halaman              |
+-----------------------------------------------------------------------------------+
```

### 8.1 Ringkasan Halaman yang Sudah Dibangun

| Halaman | Rute | File View | Fitur Utama |
|---|---|---|---|
| **Dashboard ERP & Payroll** | `/` | [`DashboardView.vue`](file:///c:/Users/yaniy/OneDrive/Documents/PROJEK/Template%20VUE/src/views/DashboardView.vue) | 6 KPI stat cards, SVG real-time wave chart beriak, horizontal bar alokasi budget divisi, donut chart distribusi status pegawai, audit log realtime, simulasi skeleton loading. |
| **Login In-Place (Morphing Card)** | Terintegrasi di `/` (Single Screen) | [`AppLayout.vue`](file:///c:/Users/yaniy/OneDrive/Documents/PROJEK/Template%20VUE/src/components/layout/AppLayout.vue) | Autentikasi in-place tanpa navigasi/pindah halaman (*Zero Route Split*). Menampilkan kartu login terpusat (Frame 1), beralih ke lingkaran LOADING & timeline progress horizontal pada tombol "Masuk" (Frame 2-4: 0% &rarr; 100%), lalu kartu morphing melebar menjadi card besar dashboard. |
| **Data Karyawan & Payroll** | `/data/karyawan` | [`DataKaryawanView.vue`](file:///c:/Users/yaniy/OneDrive/Documents/PROJEK/Template%20VUE/src/views/DataKaryawanView.vue) | Tabel CRUD enterprise, multi-select checkbox, floating bulk action bar, wizard impor CSV, modal form tambah/edit adaptif, slide-over detail karyawan, modal konfirmasi hapus massal. |
| **Data Gunung Jawa** | `/data` | [`DataView.vue`](file:///c:/Users/yaniy/OneDrive/Documents/PROJEK/Template%20VUE/src/views/DataView.vue) | Tabel master data 159 gunung di Jawa, filter provinsi & status aktif, pencarian instan, sorting multi-kolom, modal tambah/edit dan pratinjau detail. |
| **Papan Alur Kanban** | `/pesanan/kanban` | [`KanbanView.vue`](file:///c:/Users/yaniy/OneDrive/Documents/PROJEK/Template%20VUE/src/views/KanbanView.vue) | Pipeline alur kerja 4 kolom, drag & drop HTML5 native antar status, badge prioritas, akumulasi nilai rupiah per kolom, laci slide-over detail order, pratinjau invoice cetak. |
| **Pusat Pengaturan** | `/setting` | [`SettingView.vue`](file:///c:/Users/yaniy/OneDrive/Documents/PROJEK/Template%20VUE/src/views/SettingView.vue) | Kustomisasi Dasar Pertama (pola latar, palet warna), konfigurasi Dasar Kedua (gaya sudut & margin card), preferensi akun & keamanan, serta pengaturan notifikasi sistem. |

---

### 8.2 Contoh Template Boilerplate Halaman Baru (*Standard Page Template*)

Gunakan struktur di bawah ini sebagai acuan saat membuat halaman baru:

```vue
<script setup>
import { ref, computed } from 'vue'
import { Plus, Download, RefreshCw, Filter } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'

// State Halaman
const searchQuery = ref('')
const isAddModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedItem = ref(null)

// Data Dummy / API
const items = ref([
  { id: 1, nama: 'Operasional Wilayah Barat', status: 'Aktif', kode: 'OPS-01' },
  { id: 2, nama: 'Distribusi Sentral Jakarta', status: 'Pending', kode: 'OPS-02' },
])

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(item =>
    item.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="space-y-4 sm:space-y-5 p-3.5 sm:p-5">
    <!-- 1. Header Halaman -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
            Kelola Divisi Operasional
          </h1>
          <BaseBadge variant="success" size="sm" dot>Live</BaseBadge>
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Daftar seluruh unit divisi kerja aktif dan status operasional sistem.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 self-start sm:self-center">
        <BaseButton variant="outline" size="sm">
          <Download class="w-3.5 h-3.5" />
          <span>Ekspor</span>
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="isAddModalOpen = true">
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah Divisi</span>
        </BaseButton>
      </div>
    </div>

    <!-- 2. Toolbar Filter & Search -->
    <div class="p-3 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex items-center justify-between gap-3">
      <div class="w-full sm:w-72">
        <BaseInput
          v-model="searchQuery"
          placeholder="Cari divisi..."
          size="sm"
          clearable
        />
      </div>
    </div>

    <!-- 3. Tabel Data Konten -->
    <div class="rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-neutral-50 dark:bg-[#18181b] border-b border-neutral-200 dark:border-[#27272a] text-neutral-500 font-semibold uppercase text-[11px]">
            <tr>
              <th class="py-2.5 px-3.5 text-center w-12">No</th>
              <th class="py-2.5 px-3">Kode</th>
              <th class="py-2.5 px-3">Nama Divisi</th>
              <th class="py-2.5 px-3">Status</th>
              <th class="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-[#202024]">
            <tr v-for="(item, idx) in filteredItems" :key="item.id" class="hover:bg-neutral-50 dark:hover:bg-[#18181b]/60 transition">
              <td class="py-2.5 px-3.5 text-center text-neutral-400 font-mono">{{ idx + 1 }}</td>
              <td class="py-2.5 px-3 font-mono font-semibold">{{ item.kode }}</td>
              <td class="py-2.5 px-3 font-medium text-neutral-900 dark:text-white">{{ item.nama }}</td>
              <td class="py-2.5 px-3">
                <BaseBadge :variant="item.status === 'Aktif' ? 'success' : 'warning'" size="sm">
                  {{ item.status }}
                </BaseBadge>
              </td>
              <td class="py-2.5 px-3 text-right">
                <BaseButton variant="ghost" size="sm" @click="selectedItem = item; isDeleteModalOpen = true">
                  Hapus
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. Modal Formulir Tambah Data (Auto-Adaptive) -->
    <BaseModal
      v-model="isAddModalOpen"
      title="Tambah Divisi Baru"
      subtitle="Masukkan detail identitas unit divisi kerja baru"
      size="md"
    >
      <div class="space-y-3.5">
        <BaseInput label="Nama Divisi" required placeholder="Contoh: Logistik Sentral" />
        <BaseInput label="Kode Divisi" required placeholder="Contoh: LOG-01" />
      </div>

      <template #footer="{ close }">
        <BaseButton variant="outline" size="sm" @click="close">Batal</BaseButton>
        <BaseButton variant="primary" size="sm" @click="close">Simpan Divisi</BaseButton>
      </template>
    </BaseModal>

    <!-- 5. Modal Konfirmasi Hapus -->
    <ConfirmationModal
      v-model="isDeleteModalOpen"
      type="delete"
      title="Hapus Divisi"
      :message="`Apakah Anda yakin ingin menghapus divisi ${selectedItem?.nama}?`"
      confirm-text="Ya, Hapus"
      @confirm="isDeleteModalOpen = false"
    />
  </div>
</template>
```

---

### 8.3 Pola Row Selection & Floating Bulk Action Bar (Multi-Select Checkbox)

Fitur untuk memilih banyak baris data sekaligus dan menjalankan aksi massal (*bulk actions*):

```vue
<script setup>
import { ref, computed } from 'vue'
import { Trash2, Download, X } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

const items = ref([
  { id: 101, nama: 'Budi Santoso' },
  { id: 102, nama: 'Siti Rahma' },
  { id: 103, nama: 'Ahmad Fauzi' },
])

const selectedIds = ref([])

// Checkbox Header: Pilih Semua
const isAllSelected = computed(() => {
  return items.value.length > 0 && items.value.every(item => selectedIds.value.includes(item.id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = items.value.map(item => item.id)
  }
}

// Checkbox Baris: Pilih Satu
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx !== -1) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const clearSelection = () => {
  selectedIds.value = []
}
</script>

<template>
  <!-- Tabel dengan Checkbox -->
  <table>
    <thead>
      <tr>
        <th class="w-10 text-center">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="rounded border-neutral-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] cursor-pointer"
          />
        </th>
        <th>No</th>
        <th>Nama</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, idx) in items" :key="item.id">
        <td class="text-center">
          <input
            type="checkbox"
            :checked="selectedIds.includes(item.id)"
            @change="toggleSelect(item.id)"
            class="rounded border-neutral-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] cursor-pointer"
          />
        </td>
        <td>{{ idx + 1 }}</td>
        <td>{{ item.nama }}</td>
      </tr>
    </tbody>
  </table>

  <!-- Floating Bulk Action Toolbar (Terapung di Bawah Layar) -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-6"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-6"
  >
    <div
      v-if="selectedIds.length > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-[#18181c]/95 backdrop-blur-md border border-neutral-300 dark:border-[#383842] shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-3 text-xs will-change-transform max-w-[calc(100vw-32px)]"
    >
      <div class="flex items-center gap-2 pr-2 border-r border-neutral-200 dark:border-[#2a2a30]">
        <span class="w-5 h-5 rounded-full bg-[var(--theme-primary)] text-[var(--theme-primary-text)] flex items-center justify-center font-bold text-[11px]">
          {{ selectedIds.length }}
        </span>
        <span class="font-semibold text-neutral-800 dark:text-neutral-200 hidden sm:inline">Data Terpilih</span>
      </div>

      <!-- Ekspor Terpilih -->
      <BaseButton variant="outline" size="sm" @click="handleExportSelected">
        <Download class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Ekspor</span>
      </BaseButton>

      <!-- Hapus Massal -->
      <BaseButton variant="danger" size="sm" @click="handleDeleteSelected">
        <Trash2 class="w-3.5 h-3.5" />
        <span>Hapus ({{ selectedIds.length }})</span>
      </BaseButton>

      <!-- Batal Pilih -->
      <button
        type="button"
        @click="clearSelection"
        class="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
        title="Batal Pilih"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>
```

---

### 8.4 Arsitektur Single-Screen Morphing Auth (Sesuai Wireframe 4-Frame)

Fitur autentikasi Digaji.id didesain **tanpa berpindah halaman** (*Zero Route Splitting / Single-Screen Experience*). Menggunakan arsitektur 2 Layer (Dasar Pertama sebagai background backdrop dan Dasar Kedua sebagai kartu yang bermutasi/morphing):

```
+---------------------------------------------------------------------------------------------------+
| LAYER 1: DASAR PERTAMA (Backdrop Grid / Dots / Solid / Image) + Header Logo & Theme Switcher      |
|                                                                                                   |
|  [FRAME 1: FORM MASUK]        [FRAME 2: 25% TIMELINE]     [FRAME 3: 55% TIMELINE]    [FRAME 4: 100%]     |
|  +------------------------+  +-----------------------+  +-----------------------+  +--------------------+ |
|  |   Masuk ke Akun Anda   |  |                       |  |                       |  |                    | |
|  |                        |  |       /-------\       |  |       /-------\       |  |      /-------\     | |
|  | Username / email       |  |      | LOADING |      |  |      | LOADING |      |  |     | LOADING |    | |
|  | [____________________] |  |       \-------/       |  |       \-------/       |  |      \-------/     | |
|  | Kata Sandi             |  |                       |  |                       |  |                    | |
|  | [____________________] |  |                       |  |                       |  |                    | |
|  | [        Masuk       ] |  | [==|                ] |  | [========|           ] |  | [================] | |
|  |       (o) Google       |  |       (Masuk 25%)     |  |       (Masuk 55%)     |  |     (Masuk 100%)   | |
|  +------------------------+  +-----------------------+  +-----------------------+  +--------------------+ |
|             |                            |                          |                         |           |
|             +----------------------------+--------------------------+-------------------------+           |
|                                                      |                                                    |
|                                         CARD MELEBAR & MEMBESAR                                           |
|                            (transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)])                |
|                                                      v                                                    |
|  +-----------------------------------------------------------------------------------------------------+  |
|  | LAYER 2: DASAR KEDUA (KARTU BESAR DASHBOARD: PRIMARY SIDEBAR + SUBMENU + MAIN CONTENT AREA)         |  |
|  +-----------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

#### Alur Animasi & Desain UI Kartu Login (Enterprise Precision, No AI Slop):
1. **Frame 1 (Formulir Masuk Ringkas & Presisi)**:
   - Kartu Dasar Kedua berukuran presisi (`max-w-[390px] sm:max-w-[410px] h-[490px] sm:h-[510px] rounded-3xl`) mengapung rapi di tengah Dasar Pertama.
   - **Header**: Judul *"Masuk ke Akun Anda"* + Subtitle bersih *"Silakan masukkan kredensial akun Anda untuk melanjutkan"*. Tanpa tab switcher, tanpa tombol demo yang berantakan.
   - **Input Fields**: Input bersudut rounded-xl dengan ikon leading (`Mail` untuk username/email, `Lock` untuk kata sandi) dan toggle mata show/hide password.
   - **Tombol Aksi**:
     - Tombol utama **"Masuk"** dengan warna tema aktif (`var(--theme-primary)`).
     - Tombol **"Google"** dengan ikon lingkaran resmi sesuai wireframe.
2. **Frames 2, 3, 4 (Enterprise Circular Loader & Timeline "Masuk")**:
   - Transisi in-place di kartu yang sama:
     - **Bagian Atas**: Lingkaran SVG loader geometris kelas enterprise berputar halus dengan warna tema aktif (`var(--theme-primary)`) dan teks tipografi monospace **"LOADING"** (`tracking-[0.28em]`) di tengahnya tanpa ornamen berlebih (Zero AI Slop).
     - **Bagian Bawah**: Tombol **"Masuk"** berada di **posisi dan dimensi yang sama persis** tanpa bergeser 1 piksel pun. Latar belakang tombol berubah menjadi timeline progress bar yang mengisi secara mulus dari kiri ke kanan (0% &rarr; 25% &rarr; 55% &rarr; 100%) menggunakan warna tema aktif (`var(--theme-primary)`), dengan teks **"Masuk"** tetap berada di tengah.
3. **Morphing Expansion (Melebar & Membesar)**:
   - Setelah timeline mencapai 100%, kartu Dasar Kedua melebar dan memanjang secara simetris dalam 700ms (`cubic-bezier(0.16, 1, 0.3, 1)`) menjadi kartu penuh dashboard (`rounded-t-[32px] sm:rounded-2xl lg:rounded-3xl`).
   - **Optimasi Low-End 60 FPS**: Menggunakan *Lazy Mounting* di mana konten dashboard berat baru dipasang saat kartu selesai membesar, serta menekan bayangan berat ke `shadow-md` selama bergerak untuk mengeliminasi *layout thrashing* dan menghemat 50% komputasi GPU.
   - Konten dashboard (Primary Sidebar, Submenu Sidebar, Area Konten) muncul dengan transisi fade-in.
4. **Keluar Sesi (Reverse Morphing)**:
   - Mengklik *"Keluar Sesi"* di profil header atau `Ctrl + K` menyusutkan kartu dashboard kembali ke kartu login Frame 1 secara mulus tanpa reload halaman.

---

## 9. Sistem Modal Dialog Lengkap: Desktop vs Mobile (*Adaptive Modal Guide*)

Di aplikasi Digaji.id, seluruh modal dialog menggunakan arsitektur **Auto-Adaptive**. Pengembang **tidak perlu** membuat dua komponen modal terpisah untuk desktop dan mobile.

### 9.1 Perilaku Adaptif Otomatis

```
                  Ukuran Layar Terdeteksi (Breakpoint 768px)
                                      |
                 +--------------------+--------------------+
                 |                                         |
          Layar Desktop (>= 768px)                  Layar Mobile (< 768px)
                 |                                         |
     [ Centered Modal Dialog ]                    [ iOS-Style Bottom Sheet ]
     - Melayang di tengah layar                   - Menempel di bawah (bottom-0)
     - Backdrop blur lembut                       - Drag handle geser ke bawah
     - Border rounded keliling                    - Sudut lengkung atas (rounded-t)
     - Tombol Close (X) kanan atas                - Touch-friendly scrollable area
     - Ukuran: sm, md, lg, xl, full               - Sticky action footer di bawah
```

---

### 9.2 Contoh 1: Modal Form Tambah/Edit Data (`BaseModal.vue`)

Komponen form modal lengkap dengan input teks, mata uang Rupiah otomatis, dropdown pencarian, dan sticky footer:

```vue
<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseCurrencyInput from '@/components/ui/BaseCurrencyInput.vue'
import BaseSearchableSelect from '@/components/ui/BaseSearchableSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const isOpen = ref(false)
const form = ref({
  nama: '',
  jabatan: '',
  gajiPokok: 12500000,
  divisi: '',
})

const divisiOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Product', label: 'Product & Design' },
  { value: 'Finance', label: 'Finance & Tax' },
]

const handleSave = () => {
  // Simpan data ke API / State
  isOpen.value = false
}
</script>

<template>
  <BaseButton variant="primary" @click="isOpen = true">
    Buka Formulir Pegawai
  </BaseButton>

  <BaseModal
    v-model="isOpen"
    title="Formulir Data Pegawai"
    subtitle="Lengkapi data identitas dan remunerasi karyawan"
    size="md"
  >
    <!-- Body Formulir (Scrollable touch-friendly di HP) -->
    <div class="space-y-4">
      <BaseInput
        v-model="form.nama"
        label="Nama Lengkap"
        required
        placeholder="Contoh: Raden Wijaya"
      />

      <BaseSearchableSelect
        v-model="form.divisi"
        label="Divisi Kerja"
        required
        :options="divisiOptions"
        placeholder="Pilih divisi..."
      />

      <BaseCurrencyInput
        v-model="form.gajiPokok"
        label="Gaji Pokok"
        required
        terbilang
        hint="Nominal netto per bulan sebelum tunjangan."
      />
    </div>

    <!-- Sticky Footer Aksi -->
    <template #footer="{ close }">
      <BaseButton variant="outline" size="sm" @click="close">
        Batal
      </BaseButton>
      <BaseButton variant="primary" size="sm" @click="handleSave">
        Simpan Data
      </BaseButton>
    </template>
  </BaseModal>
</template>
```

---

### 9.3 Contoh 2: Modal Konfirmasi Tindakan & Hapus Data (`ConfirmationModal.vue`)

Digunakan untuk tindakan penting yang memerlukan kepastian pengguna (*destructive action* atau *confirm commit*):

```vue
<script setup>
import { ref } from 'vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const isConfirmDeleteOpen = ref(false)

const executeDelete = () => {
  // Eksekusi API hapus
}
</script>

<template>
  <!-- Tombol Pemicu -->
  <BaseButton variant="danger" size="sm" @click="isConfirmDeleteOpen = true">
    Hapus Karyawan
  </BaseButton>

  <!-- Dialog Konfirmasi -->
  <ConfirmationModal
    v-model="isConfirmDeleteOpen"
    type="delete"
    title="Konfirmasi Hapus Data"
    message="Apakah Anda yakin ingin menghapus data ini secara permanen? Data yang dihapus tidak dapat dipulihkan kembali."
    confirm-text="Ya, Hapus Sekarang"
    cancel-text="Batalkan"
    @confirm="executeDelete"
  />
</template>
```

---

### 9.4 Contoh 3: Modal Pratinjau Faktur & Siap Cetak (`BaseInvoiceModal.vue`)

Menampilkan lembar tagihan resmi yang otomatis disesuaikan untuk cetak printer `@media print`:

```vue
<script setup>
import { ref } from 'vue'
import BaseInvoiceModal from '@/components/ui/BaseInvoiceModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const isInvoiceOpen = ref(false)
const invoiceData = ref({
  id: 'ORD-9021',
  customer: 'PT Surya Kencana Abadi',
  email: 'finance@suryakencana.co.id',
  phone: '0812-3456-7890',
  address: 'Jl. Sudirman No. 45, Jakarta Selatan',
  service: 'Paket Payroll Enterprise 150 Staf',
  items: [
    { name: 'Lisensi Modul Payroll Cloud', qty: 1, price: 12500000 },
    { name: 'Modul Integrasi BPJS & PPh 21', qty: 1, price: 3500000 },
  ],
  status: 'PROSES',
  paymentStatus: 'LUNAS',
  date: '2025-01-28',
  dueDate: '2025-02-15',
})
</script>

<template>
  <BaseButton variant="outline" size="sm" @click="isInvoiceOpen = true">
    Lihat Faktur Resmi
  </BaseButton>

  <BaseInvoiceModal
    v-model="isInvoiceOpen"
    :invoice-data="invoiceData"
  />
</template>
```

---

### 9.5 Contoh 4: Laci Samping Detail Data (`BaseSlideOver.vue`)

Menyajikan informasi rinci, histori audit, atau log waktu tanpa menutup konteks layar tabel:

```vue
<script setup>
import { ref } from 'vue'
import BaseSlideOver from '@/components/ui/BaseSlideOver.vue'
import BaseTimeline from '@/components/ui/BaseTimeline.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const isDrawerOpen = ref(false)
const auditLogs = [
  { id: 1, title: 'Realisasi Payroll Disetujui', time: 'Hari ini, 09:30 WIB', variant: 'success', author: 'Direktur Keuangan' },
  { id: 2, title: 'Draft Batch Payroll Dibuat', time: 'Kemarin, 16:45 WIB', variant: 'primary', author: 'HR Payroll Admin' },
]
</script>

<template>
  <BaseButton variant="outline" size="sm" @click="isDrawerOpen = true">
    Buka Rincian Log
  </BaseButton>

  <BaseSlideOver
    v-model="isDrawerOpen"
    title="Rincian Batch Payroll #BTH-01"
    subtitle="Periode Januari 2025"
    size="md"
  >
    <template #badge>
      <BaseBadge variant="success" dot>Terverifikasi</BaseBadge>
    </template>

    <div class="space-y-4">
      <div class="p-3 rounded-xl bg-neutral-50 dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a]">
        <span class="text-xs text-neutral-500">Total Anggaran Payroll:</span>
        <div class="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
          Rp 384.500.000
        </div>
      </div>

      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Jejak Audit Persetujuan
        </h3>
        <BaseTimeline :items="auditLogs" />
      </div>
    </div>

    <template #footer="{ close }">
      <BaseButton variant="outline" size="sm" @click="close">Tutup</BaseButton>
    </template>
  </BaseSlideOver>
</template>
```

---

### 9.6 Contoh 5: Wizard Impor Data CSV 3-Tahap (`BaseCsvImporter.vue`)

Memungkinkan pengguna mengimpor ribuan baris data CSV lokal ke sistem dengan pemetaan kolom interaktif:

```vue
<script setup>
import { ref } from 'vue'
import BaseCsvImporter from '@/components/ui/BaseCsvImporter.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { UploadCloud } from 'lucide-vue-next'

const isImporterOpen = ref(false)

const targetColumns = [
  { key: 'nama', label: 'Nama Lengkap', required: true },
  { key: 'nip', label: 'Nomor Induk Pegawai (NIP)', required: true },
  { key: 'jabatan', label: 'Jabatan', required: true },
  { key: 'gaji', label: 'Gaji Pokok', required: false },
]

const handleImportedData = (dataRows) => {
  console.log('Data CSV berhasil diimpor:', dataRows)
}
</script>

<template>
  <BaseButton variant="outline" size="sm" @click="isImporterOpen = true">
    <UploadCloud class="w-3.5 h-3.5" />
    <span>Impor Data CSV</span>
  </BaseButton>

  <BaseCsvImporter
    v-model="isImporterOpen"
    title="Impor Data Karyawan Massal"
    :target-fields="targetColumns"
    @imported="handleImportedData"
  />
</template>
```

---

## 10. Tabel Komparasi Antarmuka: Desktop vs Layar Mobile

| Fitur / Komponen | Perilaku di Layar Desktop ($\ge 768\text{px}$) | Perilaku di Layar Mobile ($< 768\text{px}$) |
|---|---|---|
| **Modal (`BaseModal`)** | Centered pop-up dialog melayang di tengah layar dengan backdrop blur. | Bertransformasi menjadi iOS-style Bottom Sheet menempel di bawah dengan drag handle. |
| **Navigasi Sidebar** | Dual-rail sidebar permanen (Primary Menu Rail + Submenu Rail meluncur). | Drawer samping layar penuh dari kiri, dibuka via tombol menu pojok kiri atas (topbar). |
| **Header Diagram SVG** | 1 garis horizontal (`justify-between`), tombol gelombang icon-only + date range compact. | Tetap 1 garis horizontal compact dengan ikon gelombang square dan datepicker responsif. |
| **Bilah Aksi Masal (Bulk Bar)** | Bar terapung di bawah tengah layar dengan label teks lengkap dan tombol aksi. | Bar terapung responsif dengan `max-w-[calc(100vw-32px)]`, teks diringkas, tombol tetap mudah diklik. |
| **Tabel Data Enterprise** | Kolom lengkap terlihat langsung, horizontal scroll halus bila melebihi kontainer. | Mendukung swipe horizontal, kolom NIP/kontak dilipat ringkas di bawah nama pegawai. |
| **Drawer Detail (`BaseSlideOver`)** | Panel laci meluncur mulus dari sisi kanan layar (`max-w-lg`). | Meluncur menutupi layar dari kanan atau bawah dengan tombol tutup mudah dijangkau jempol. |
| **Filter & Pencarian** | Input pencarian dan filter dropdown berjejer rapi dalam 1 baris toolbar. | Input pencarian lebar penuh (100%), filter tersusun rapi atau dilipat dalam dropdown ringkas. |


