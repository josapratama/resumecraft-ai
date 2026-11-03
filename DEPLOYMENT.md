# Panduan Deployment ResumeCraft AI ke VPS (Ubuntu / Linux)

Panduan lengkap untuk mendeploy aplikasi **ResumeCraft AI** (Full-stack AI Resume & CV Builder dengan fitur ATS Score, Cover Letter, Interview Prep, Translation, dan Public Link) ke server VPS Ubuntu menggunakan Docker, Docker Compose, dan Nginx Reverse Proxy dengan SSL Let's Encrypt.

---

## 🌟 Fitur Baru yang Telah Diimplementasikan:
1. **AI ATS Compatibility & Job Description Matcher:** Mengukur skor kelulusan ATS (0-100%), perbandingan kata kunci, dan saran perbaikan.
2. **AI Cover Letter Generator:** Membuat surat lamaran otomatis yang disesuaikan dengan posisi kerja dan tone yang diinginkan.
3. **AI Interview Prep & Mock Questions:** Prediksi pertanyaan interview (Behavioral/STAR, Technical, Situational) berdasarkan isi CV.
4. **AI Multi-Language Translation (EN ⇄ ID):** Menerjemahkan dan melokalisasi CV ke Bahasa Inggris atau Indonesia dengan action verbs profesional.
5. **AI Resume / CV Parser & Importer:** Ekstrak otomatis CV lama (teks/LinkedIn/PDF) langsung menjadi data terstruktur dalam 1 klik.
6. **Languages Section:** Input kemahiran bahasa (Native, Fluent, Professional Working, Intermediate, Elementary) dengan drag-and-drop.
7. **Additional / Custom Sections:** Penghargaan (Awards), Organisasi Mahasiswa, Volunteer, Publikasi Ilmiah.
8. **Public Web Link & Recruiter Portfolio:** Bagikan CV via URL publik (`/p/:slug`) lengkap dengan counter jumlah dilihat oleh recruiter.
9. **Theme Colors & Typography Customizer:** Kustomisasi warna aksen dan font dokumen CV.
10. **High-Fidelity Vector PDF Export:** Cetak dokumen dengan teks tajam dan terbaca oleh parser ATS.

---

## 📋 Daftar Isi
1. [Prasyarat Server](#1-prasyarat-server)
2. [Upload / Salin Project ke VPS](#2-upload--salin-project-ke-vps)
3. [Konfigurasi Environment (.env)](#3-konfigurasi-environment-env)
4. [Build & Jalankan Menggunakan Docker Compose](#4-build--jalankan-menggunakan-docker-compose)
5. [Konfigurasi Nginx Reverse Proxy & Domain](#5-konfigurasi-nginx-reverse-proxy--domain)
6. [Pasang SSL HTTPS Gratis (Certbot)](#6-pasang-ssl-https-gratis-certbot)
7. [Pengaturan Provider AI](#7-pengaturan-provider-ai)
8. [Perintah Operasional & Maintenance](#8-perintah-operasional--maintenance)

---

## 1. Prasyarat Server

Pastikan di VPS Anda (misalnya Ubuntu 22.04 / 24.04 LTS) sudah terinstall:
- **Docker** & **Docker Compose (v2)**
- **Nginx**
- **Git**

Jika belum terinstall di VPS, jalankan:
```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Nginx & Certbot
sudo apt install -y nginx certbot python3-certbot-nginx git
```

---

## 2. Upload / Salin Project ke VPS

Pilih salah satu cara di bawah ini untuk mentransfer project ke VPS:

### Opsi A: Menggunakan Git (Disarankan)
Jika project Anda berada di Git repository (GitHub/GitLab):
```bash
cd /var/www  # atau di direktori home Anda (~/)
git clone <URL_REPOSITORY_ANDA> resumecraft
cd resumecraft
```

### Opsi B: Upload Menggunakan SCP dari Komputer Lokal
Jalankan perintah ini dari terminal komputer lokal Anda (PowerShell / Bash):
```bash
scp -r "D:\coding\raspberry pi\project\resumecraft-ai-main" user@IP_VPS:/home/user/resumecraft
```

---

## 3. Konfigurasi Environment (.env)

Masuk ke folder project di VPS:
```bash
cd resumecraft
cp .env.example .env
nano .env
```

Sesuaikan nilai-nilai berikut di file `.env`:
```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
APP_PORT=3000

# Konfigurasi Database MySQL
DB_USER=cv_user
DB_PASSWORD=buat_password_mysql_yang_kuat
DB_NAME=cv_builder
DB_ROOT_PASSWORD=buat_password_root_yang_kuat
DB_PORT=3306

DATABASE_URL=mysql://cv_user:buat_password_mysql_yang_kuat@mysql:3306/cv_builder

# Kunci Rahasia JWT (generate acak 32 karakter)
JWT_SECRET=bisa_dibuat_dengan_openssl_rand_hex_32

# API Key AI (pilih salah satu: OpenAI / DeepSeek / Groq)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com
AI_MODEL=gpt-4o-mini
```

> **Tips:** Untuk membuat JWT_SECRET yang aman, Anda bisa jalankan:
> ```bash
> openssl rand -hex 32
> ```

---

## 4. Build & Jalankan Menggunakan Docker Compose

Jalankan perintah ini di direktori project:
```bash
# Build image aplikasi dan jalankan container di background
docker compose up -d --build
```

### Apa yang terjadi saat container berjalan?
1. Container MySQL 8.4 dijalankan dan volume penyimpanan persisten `cv_mysql_data` disiapkan.
2. Container Aplikasi (`cv_app`) menunggu sampai database MySQL sehat (`healthy`).
3. **Auto-Migration:** Aplikasi secara otomatis mengecek dan menerapkan seluruh skema tabel Drizzle ke MySQL saat pertama kali start.
4. Server aplikasi berjalan di port internal `3000`.

Cek status container:
```bash
docker compose ps
```

Cek log aplikasi untuk memastikan server aktif tanpa error:
```bash
docker compose logs -f app
```
Output yang diharapkan:
```
[Database] Checking and running migrations (attempt 1/10)...
[Database] Database migrations applied successfully!
Server running on http://0.0.0.0:3000/ (environment: production)
```

---

## 5. Konfigurasi Nginx Reverse Proxy & Domain

Salin template konfigurasi Nginx yang sudah disediakan:
```bash
sudo cp deploy/nginx/cv.conf /etc/nginx/sites-available/resumecraft.conf
```

Edit file tersebut dan sesuaikan `server_name` dengan nama subdomain/domain Anda:
```bash
sudo nano /etc/nginx/sites-available/resumecraft.conf
```
Ganti `cv.yourdomain.com` menjadi domain Anda (misal `cv.josapratama.com`).

Aktifkan konfigurasi Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/resumecraft.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Pasang SSL HTTPS Gratis (Certbot)

Jalankan Certbot untuk mengamankan koneksi dengan sertifikat SSL otomatis:
```bash
sudo certbot --nginx -d cv.yourdomain.com
```
Pilih opsi redirect HTTP ke HTTPS secara otomatis. Certbot akan memperbarui sertifikat secara otomatis setiap 90 hari.

Aplikasi Anda kini sudah live dan aman diakses melalui `https://cv.yourdomain.com`!

---

## 7. Pengaturan Provider AI

Aplikasi mendukung berbagai provider AI yang kompatibel dengan protokol OpenAI:

| Provider | `OPENAI_BASE_URL` | `AI_MODEL` Contoh |
| :--- | :--- | :--- |
| **OpenAI** | `https://api.openai.com` | `gpt-4o-mini`, `gpt-4o` |
| **DeepSeek** | `https://api.deepseek.com` | `deepseek-chat` |
| **Groq** | `https://api.groq.com/openai` | `llama-3.3-70b-versatile` |
| **OpenRouter**| `https://openrouter.ai/api` | `google/gemini-2.0-flash-001` |

Cukup ubah konfigurasi di file `.env`, lalu restart aplikasi:
```bash
docker compose restart app
```

---

## 8. Perintah Operasional & Maintenance

### Melihat Log Realtime
```bash
docker compose logs -f app
```

### Restart Aplikasi
```bash
docker compose restart app
```

### Menghentikan Semua Container
```bash
docker compose down
```

### Update Kode Aplikasi ke Versi Baru
```bash
git pull
docker compose up -d --build
```

### Backup Database MySQL
```bash
docker compose exec mysql mysqldump -u cv_user -p cv_builder > backup_cv_$(date +%F).sql
```

