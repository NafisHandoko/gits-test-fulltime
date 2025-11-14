# Publishing Platform

Platform digital untuk mengelola katalog Books, Authors, dan Publishers dengan Laravel Backend dan Next.js Frontend.

## Struktur Project

```
gits-test-fulltime/
├── gits-test-backend/     # Laravel Backend API
└── gits-test-frontend/    # Next.js Frontend
```

## Prerequisites

- **Docker & Docker Compose** (untuk backend)
- **Node.js** (v18 atau lebih baru) dan **npm** (untuk frontend)
- **Git**

## Menjalankan Aplikasi

### 1. Backend (Laravel)

Backend menggunakan Docker untuk menjalankan aplikasi Laravel dengan PostgreSQL.

#### Langkah-langkah:

1. Masuk ke folder backend:
```bash
cd gits-test-backend
```

2. Build dan jalankan container Docker:
```bash
docker compose up --build
```

3. Setelah container berjalan, jalankan migration dan seeder:
```bash
docker compose exec app php artisan migrate:fresh --seed
```

4. Backend akan berjalan di `http://localhost:8000`

#### Catatan:
- Pastikan port 8000 tidak digunakan oleh aplikasi lain
- Database PostgreSQL akan otomatis dibuat dan dikonfigurasi melalui docker-compose
- JWT secret key akan otomatis di-generate saat pertama kali build

### 2. Frontend (Next.js)

Frontend menggunakan Next.js dengan TypeScript dan TailwindCSS.

#### Langkah-langkah:

1. Masuk ke folder frontend:
```bash
cd gits-test-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Pastikan file `.env.local` sudah ada dengan konfigurasi berikut:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

4. Jalankan development server:
```bash
npm run dev
```

5. Frontend akan berjalan di `http://localhost:3000`

#### Catatan:
- Pastikan backend sudah berjalan sebelum menjalankan frontend
- File `.env.local` sudah tersedia dengan konfigurasi default
- Jika backend berjalan di port berbeda, update `NEXT_PUBLIC_API_BASE_URL` di `.env.local`

## Akses Aplikasi

Setelah kedua aplikasi berjalan:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api

## Default Credentials

Setelah menjalankan seeder, Anda dapat menggunakan kredensial berikut untuk login (atau buat akun baru melalui halaman register):

- Email: `nafis@example.com`
- Password: `password`

*Catatan: Kredensial ini hanya untuk development. Pastikan untuk mengubahnya di production.*

## API Endpoints

### Authentication
- `POST /api/register` - Register user baru
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (requires auth)
- `GET /api/me` - Get current user (requires auth)

### Authors
- `GET /api/authors` - List authors (paginated)
- `GET /api/authors/{id}` - Get author by ID
- `POST /api/authors` - Create author
- `PUT /api/authors/{id}` - Update author
- `DELETE /api/authors/{id}` - Delete author

### Publishers
- `GET /api/publishers` - List publishers (paginated)
- `GET /api/publishers/{id}` - Get publisher by ID
- `POST /api/publishers` - Create publisher
- `PUT /api/publishers/{id}` - Update publisher
- `DELETE /api/publishers/{id}` - Delete publisher

### Books
- `GET /api/books` - List books (paginated, with author & publisher relations)
- `GET /api/books/{id}` - Get book by ID (with relations)
- `POST /api/books` - Create book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

## Troubleshooting

### Backend Issues

**Port 8000 sudah digunakan:**
- Ubah port di `docker-compose.yml` atau hentikan aplikasi yang menggunakan port 8000

**Migration error:**
- Pastikan container sudah berjalan: `docker compose ps`
- Coba restart container: `docker compose restart`
- Cek logs: `docker compose logs app`

**Database connection error:**
- Pastikan service `db` (PostgreSQL) sudah running: `docker compose ps`
- Tunggu beberapa detik setelah `docker compose up` untuk database siap

### Frontend Issues

**Cannot connect to backend:**
- Pastikan backend sudah berjalan di `http://localhost:8000`
- Cek file `.env.local` dan pastikan `NEXT_PUBLIC_API_BASE_URL` benar
- Restart frontend setelah mengubah `.env.local`

**Port 3000 sudah digunakan:**
- Next.js akan otomatis menggunakan port berikutnya (3001, 3002, dll)
- Atau hentikan aplikasi yang menggunakan port 3000

**Module not found errors:**
- Hapus `node_modules` dan `package-lock.json`, lalu jalankan `npm install` lagi

## Development

### Backend Development

- Logs: `docker compose logs -f app`
- Masuk ke container: `docker compose exec app bash`
- Run artisan commands: `docker compose exec app php artisan <command>`
- Stop containers: `docker compose down`
- Stop dan hapus volumes: `docker compose down -v`

### Frontend Development

- Build untuk production: `npm run build`
- Start production server: `npm start`
- Lint: `npm run lint`

## Tech Stack

### Backend
- Laravel 11
- PHP 8.3
- PostgreSQL
- JWT Authentication (tymon/jwt-auth)
- Docker & Docker Compose

### Frontend
- Next.js 16
- TypeScript
- TailwindCSS
- React Context API
- Heroicons

## License

This project is for development/testing purposes.

