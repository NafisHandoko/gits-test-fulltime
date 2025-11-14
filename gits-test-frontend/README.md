# Publishing Platform Frontend

Frontend application untuk Publishing Platform menggunakan Next.js, TypeScript, dan TailwindCSS.

## Fitur

- ✅ Authentication (Login/Register) dengan JWT
- ✅ Dashboard dengan statistik (Books, Authors, Publishers)
- ✅ CRUD untuk Books dengan filtering dan pagination
- ✅ CRUD untuk Authors dengan filtering dan pagination
- ✅ CRUD untuk Publishers dengan filtering dan pagination
- ✅ Protected routes
- ✅ Responsive UI dengan TailwindCSS
- ✅ Error handling dan validation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Buat file `.env.local` (sudah ada contoh):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

3. Pastikan backend Laravel sudah berjalan di `http://localhost:8000`

4. Jalankan development server:
```bash
npm run dev
```

5. Buka browser di `http://localhost:3000`

## Struktur Project

```
gits-test-frontend/
├── app/
│   ├── login/          # Halaman login
│   ├── register/       # Halaman register
│   ├── dashboard/       # Dashboard dengan statistik
│   ├── books/          # Halaman books (list + detail/form)
│   ├── authors/        # Halaman authors (list + detail/form)
│   └── publishers/      # Halaman publishers (list + detail/form)
├── components/
│   ├── Sidebar.tsx     # Sidebar navigation
│   ├── Topbar.tsx      # Topbar dengan profile dropdown
│   └── ProtectedRoute.tsx  # Component untuk protected routes
├── contexts/
│   └── AuthContext.tsx # Context untuk authentication
├── lib/
│   └── api.ts          # API service layer
└── types/
    └── index.ts        # TypeScript types/interfaces
```

## Pages

### Authentication
- `/login` - Halaman login
- `/register` - Halaman register

### Main Pages (Protected)
- `/dashboard` - Dashboard dengan statistik
- `/books` - List books dengan filtering
- `/books/[id]` - Detail/edit book
- `/books/new` - Create new book
- `/authors` - List authors dengan filtering
- `/authors/[id]` - Detail/edit author
- `/authors/new` - Create new author
- `/publishers` - List publishers dengan filtering
- `/publishers/[id]` - Detail/edit publisher
- `/publishers/new` - Create new publisher

## Teknologi

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Heroicons** - Icons
- **Context API** - State management untuk authentication

## API Integration

Frontend menggunakan Fetch API untuk berkomunikasi dengan backend Laravel. Semua request otomatis menambahkan JWT token dari localStorage ke header Authorization.

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```
