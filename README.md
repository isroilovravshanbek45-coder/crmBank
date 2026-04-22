# 🏦 Bank CRM

Bank CRM tizimi - Mijozlarni boshqarish va operator nazorati uchun zamonaviy, xavfsiz web-ilova.

## 🚀 Texnologiyalar

### Backend
- 🟢 Node.js + Express.js
- 🗄️ MongoDB + Mongoose
- 🔐 JWT Authentication
- 🛡️ Security: Helmet, XSS Protection, Rate Limiting
- 📝 Logging: Winston + Morgan
- ✅ Validation: Express Validator

### Frontend
- ⚛️ React 19.2.4
- ⚡ Vite
- 🎨 Tailwind CSS
- 🧭 React Router DOM
- 📊 XLSX (Excel export)

## ✨ Xususiyatlar

### Operator Panel
- ➕ Mijozlarni qo'shish va tahrirlash
- 📈 Real-time statistika
- 🔄 Status boshqaruvi (Jarayonda, Tasdiqlangan, Rad etilgan)
- 📋 Mijoz tafsilotlari
- 🔍 Qidiruv funksiyasi

### Admin Panel
- 👥 Barcha operatorlar va mijozlarni ko'rish
- 📊 Vaqt bo'yicha tahlil (Bugun, Hafta, Oy)
- 🏆 Top 5 eng yaxshi operatorlar
- 📥 Excel export funksiyasi
- 📈 Operator samaradorligi tahlili
- ✏️ Operator boshqaruvi (qo'shish, o'chirish, tahrirlash)

## 📦 O'rnatish

### 1. Repository'ni clone qiling

```bash
git clone <repository-url>
cd Bank_CRM
```

### 2. Backend o'rnatish

```bash
cd server
npm install
```

### 3. Environment Variables sozlash

**MUHIM**: `.env` faylini yarating va xavfsiz qiymatlar bilan to'ldiring!

```bash
# .env.example faylidan nusxa oling
cp .env.example .env
```

Keyin `.env` faylini tahrirlang:

```env
# 1. JWT_SECRET yaratish (MAJBURIY!)
# Quyidagi buyruqni ishga tushiring:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Chiqgan natijani JWT_SECRET ga qo'ying
JWT_SECRET=<generated-secret-here>

# 2. Admin parolini o'zgartiring (MAJBURIY!)
ADMIN_PASSWORD=<kuchli-parol-kiriting>

# 3. Production'da rate limiting yoqing
ENABLE_RATE_LIMIT=true

# 4. CORS'ni sozlang (production URL)
CORS_ORIGIN=https://your-frontend-domain.com
```

### 4. MongoDB'ni ishga tushiring

```bash
# Local MongoDB
# Windows:
net start MongoDB

# Linux/Mac:
sudo systemctl start mongod
```

### 5. Admin foydalanuvchi yaratish

```bash
cd server
node scripts/create-admin.js
```

### 6. Frontend o'rnatish

```bash
cd web
npm install
```

## 🏃 Ishga tushirish

### Development

```bash
# Backend (Terminal 1)
cd server
npm run dev

# Frontend (Terminal 2)
cd web
npm run dev
```

### Production

```bash
# Backend
cd server
npm start

# Frontend
cd web
npm run build
npm run preview
```

## 🚢 Deploy

### Backend (Railway/Render/VPS)

1. Environment variables sozlang:
```env
NODE_ENV=production
ENABLE_RATE_LIMIT=true
JWT_SECRET=<secure-random-secret>
ADMIN_PASSWORD=<secure-password>
MONGODB_URI=<production-mongodb-uri>
CORS_ORIGIN=https://your-frontend-domain.com
```

2. Deploy qiling

### Frontend (Vercel)

1. GitHub ga push qiling
2. [Vercel](https://vercel.com) ga kiring
3. "Import Project" tugmasini bosing
4. GitHub repository ni tanlang

**Build Settings:**
- Framework Preset: Vite
- Root Directory: `web`
- Build Command: `npm run build`
- Output Directory: `dist`

**Environment Variables:**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## 🔐 Xavfsizlik

### ⚠️ MUHIM: Production'ga chiqishdan oldin

1. ✅ `.env` faylini Git'ga commit qilmang
2. ✅ JWT_SECRET'ni random qiymat bilan almashtiring
3. ✅ Admin parolini kuchli parol bilan almashtiring
4. ✅ `ENABLE_RATE_LIMIT=true` qiling
5. ✅ CORS_ORIGIN'ni haqiqiy frontend URL'ga o'zgartiring
6. ✅ Barcha operator parollarini o'zgartiring
7. ✅ MongoDB'ni authentication bilan sozlang

### Xavfsizlik xususiyatlari

- 🛡️ JWT authentication
- 🔒 Password hashing (bcrypt - 12 rounds)
- 🚫 Rate limiting (brute-force protection)
- 🧹 XSS protection
- 💉 NoSQL injection protection
- 🎭 Helmet security headers
- 📝 Request validation
- 🔐 HTTP-Only cookie support

## 🔑 Login Ma'lumotlari

### Operator (Default)
- Login: `401` - `410`
- Parol: `1234`
- URL: `/login`

**⚠️ DIQQAT**: Production'da parollarni o'zgartiring!

### Admin
- URL: `/admin/login`
- Username va parol: `.env` faylida sozlangan

## 🐛 Troubleshooting

### "Token topilmadi" xatosi
```bash
# LocalStorage'ni tozalang
localStorage.clear()
```

### MongoDB connection error
```bash
# MongoDB ishga tushganligini tekshiring
# Windows:
net start MongoDB

# Connection string to'g'riligini tekshiring
```

### Rate limit xatosi
```bash
# Development'da o'chirish:
ENABLE_RATE_LIMIT=false
```

## 📝 API Documentation

API endpoints va request/response formatlarini [DEBUG_GUIDE.md](DEBUG_GUIDE.md) da toping.

## 🤝 Contributing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📄 Litsenziya

MIT

## 👨‍💻 Author

Bank CRM tizimi

---

**⭐ Agar loyiha yoqtirgan bo'lsa, star bering!**
