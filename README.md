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

- Email: `test@example.com`
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

## Testing

### Backend Testing

Backend menggunakan Pest PHP untuk testing. Test mencakup unit test untuk models dan feature test untuk API endpoints.

#### Menjalankan Test

1. Masuk ke folder backend:
```bash
cd gits-test-backend
```

2. Jalankan semua test:
```bash
docker compose exec app php artisan test
```

Atau jika menjalankan langsung (tanpa Docker):
```bash
php artisan test
```

#### Menjalankan Test Spesifik

- Test untuk file tertentu:
```bash
docker compose exec app php artisan test --filter AuthorTest
```

- Test untuk direktori tertentu:
```bash
docker compose exec app php artisan test tests/Unit
docker compose exec app php artisan test tests/Feature
```

#### Coverage Test

Untuk melihat coverage test:
```bash
docker compose exec app php artisan test --coverage
```

#### Test yang Tersedia

**Unit Tests:**
- `tests/Unit/Models/AuthorTest.php` - Test untuk Author model
- `tests/Unit/Models/BookTest.php` - Test untuk Book model
- `tests/Unit/Models/PublisherTest.php` - Test untuk Publisher model
- `tests/Unit/Models/UserTest.php` - Test untuk User model

**Feature Tests:**
- `tests/Feature/AuthTest.php` - Test untuk authentication endpoints
- `tests/Feature/AuthorTest.php` - Test untuk Authors CRUD endpoints
- `tests/Feature/BookTest.php` - Test untuk Books CRUD endpoints
- `tests/Feature/PublisherTest.php` - Test untuk Publishers CRUD endpoints

### Frontend Testing

Frontend menggunakan Jest dan React Testing Library untuk testing. Test mencakup unit test untuk components, pages, dan contexts.

#### Menjalankan Test

1. Masuk ke folder frontend:
```bash
cd gits-test-frontend
```

2. Jalankan semua test:
```bash
npm test
```

3. Jalankan test dalam watch mode (otomatis re-run saat file berubah):
```bash
npm run test:watch
```

4. Jalankan test dengan coverage:
```bash
npm run test:coverage
```

#### Menjalankan Test Spesifik

- Test untuk file tertentu:
```bash
npm test -- AuthorTest
```

- Test untuk direktori tertentu:
```bash
npm test -- __tests__/components
npm test -- __tests__/app
```

#### Test yang Tersedia

**Component Tests:**
- `__tests__/components/Sidebar.test.tsx` - Test untuk Sidebar component
- `__tests__/components/Topbar.test.tsx` - Test untuk Topbar component
- `__tests__/components/ProtectedRoute.test.tsx` - Test untuk ProtectedRoute component

**Page Tests:**
- `__tests__/app/login.test.tsx` - Test untuk Login page
- `__tests__/app/register.test.tsx` - Test untuk Register page
- `__tests__/app/dashboard.test.tsx` - Test untuk Dashboard page
- `__tests__/app/books.test.tsx` - Test untuk Books list page
- `__tests__/app/books-detail.test.tsx` - Test untuk Book detail page
- `__tests__/app/authors.test.tsx` - Test untuk Authors list page
- `__tests__/app/authors-detail.test.tsx` - Test untuk Author detail page
- `__tests__/app/publishers.test.tsx` - Test untuk Publishers list page
- `__tests__/app/publishers-detail.test.tsx` - Test untuk Publisher detail page
- `__tests__/app/page.test.tsx` - Test untuk Home page
- `__tests__/app/layout.test.tsx` - Test untuk Root layout

**Context Tests:**
- `__tests__/contexts/AuthContext.test.tsx` - Test untuk AuthContext

**API Tests:**
- `__tests__/lib/api.test.ts` - Test untuk API service layer

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

