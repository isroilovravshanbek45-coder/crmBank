# Bank CRM - To'liq O'rnatish Qo'llanmasi

## Muammo va Yechim

### ❌ Avvalgi Muammo:
- Loyiha faqat `localStorage` dan foydalangan
- Har bir kompyuterda alohida ma'lumotlar
- Operator A qo'shgan mijoz Operator B ga ko'rinmasdi
- Admin boshqa kompyuterdan kirganda ma'lumotlar ko'rinmasdi

### ✅ Endi (Backend bilan):
- Barcha ma'lumotlar MongoDB serverida saqlanadi
- Har qanday kompyuterdan kirgan foydalanuvchi bir xil ma'lumotlarni ko'radi
- Real-time yangilanish ishlaydi
- Ma'lumotlar xavfsiz va doimiy saqlanadi

---

## Prerequisites (Talablar)

1. **Node.js** (v18 yoki yuqori): https://nodejs.org/
2. **MongoDB** (ikki variant):
   - **A variant:** Lokal MongoDB: https://www.mongodb.com/try/download/community
   - **B variant:** MongoDB Atlas (Cloud - bepul): https://www.mongodb.com/cloud/atlas

3. **Git** (ixtiyoriy): https://git-scm.com/

---

## 1-Qism: Backend O'rnatish

### 1.1. MongoDB'ni sozlash

#### A variant: Lokal MongoDB

**Windows:**
1. MongoDB Community Server'ni yuklab oling va o'rnating
2. MongoDB Compass ham avtomatik o'rnatiladi
3. MongoDB service'ni ishga tushiring:
   ```bash
   net start MongoDB
   ```
4. MongoDB Compass'da connection: `mongodb://localhost:27017`

#### B variant: MongoDB Atlas (Cloud) ⭐ Tavsiya

1. https://www.mongodb.com/cloud/atlas/register ga boring
2. Bepul account yarating
3. **Create a Cluster** tugmasini bosing
4. **M0 Free** tier'ni tanlang
5. Cluster yaratilishini kuting (2-3 daqiqa)
6. **Connect** tugmasini bosing
7. **Drivers** ni tanlang
8. **Connection String** ni nusxalang:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/bank_crm
   ```
9. **Network Access** bo'limida:
   - **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)

### 1.2. Backend Dependencies O'rnatish

```bash
cd server
npm install
```

### 1.3. Environment Variables Sozlash

`.env` faylini tahrirlang:

**Lokal MongoDB uchun:**
```env
MONGODB_URI=mongodb://localhost:27017/bank_crm
PORT=5000
NODE_ENV=development
JWT_SECRET=bank_crm_super_secret_jwt_key_2024
ADMIN_USERNAME=Nodir
ADMIN_PASSWORD=Ipoteka
CORS_ORIGIN=http://localhost:5173
```

**MongoDB Atlas uchun:**
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/bank_crm
PORT=5000
NODE_ENV=development
JWT_SECRET=bank_crm_super_secret_jwt_key_2024
ADMIN_USERNAME=Nodir
ADMIN_PASSWORD=Ipoteka
CORS_ORIGIN=http://localhost:5173
```

⚠️ `your_username` va `your_password` ni o'zingiznikiga almashtiring!

### 1.4. Backend Ishga Tushirish

```bash
cd server
npm run dev
```

Agar hammasi to'g'ri bo'lsa, ko'rasiz:
```
✅ MongoDB connected: ...
📊 Database: bank_crm
🚀 Server is running on port 5000
📡 API: http://localhost:5000
```

---

## 2-Qism: Frontend Sozlash

### 2.1. Frontend Dependencies O'rnatish

```bash
cd web
npm install
```

### 2.2. Environment Variables

`.env` fayli allaqachon yaratilgan:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2.3. Frontend Ishga Tushirish

```bash
cd web
npm run dev
```

Frontend: http://localhost:5173 da ochiladi

---

## 3-Qism: Test Qilish

### 3.1. Backend Test

1. Brauzerda oching: http://localhost:5000
2. Ko'rishingiz kerak:
   ```json
   {
     "success": true,
     "message": "Bank CRM API",
     "version": "1.0.0"
   }
   ```

3. Health check: http://localhost:5000/health

### 3.2. Frontend Test

1. Brauzerda oching: http://localhost:5173
2. **Operator sifatida kirish:**
   - Login: `401` (yoki 402-410)
   - Parol: `1234`
3. Mijoz qo'shing
4. **Boshqa brauzerda** yoki **boshqa kompyuterda** admin sifatida kiring:
   - Admin URL: http://localhost:5173/admin/login
   - Login: `Nodir`
   - Parol: `Ipoteka`
5. **Tekshiring:** Operator qo'shgan mijoz admin'ga ko'rinishi kerak! ✅

---

## 4-Qism: Production'ga Deploy

### 4.1. Backend (Vercel'ga)

1. **MongoDB Atlas sozlash:**
   - Network Access: `0.0.0.0/0` qo'shing

2. **Vercel'ga deploy:**
   ```bash
   cd server
   vercel
   ```

3. **Vercel Environment Variables qo'shing:**
   - Dashboard → Settings → Environment Variables
   - Qo'shing:
     - `MONGODB_URI` = MongoDB Atlas connection string
     - `JWT_SECRET` = sizning secret key
     - `ADMIN_USERNAME` = Nodir
     - `ADMIN_PASSWORD` = Ipoteka
     - `NODE_ENV` = production
     - `CORS_ORIGIN` = frontend URL (masalan: https://bank-crm.vercel.app)

4. **Backend URL'ni oling:**
   - Masalan: `https://bank-crm-api.vercel.app`

### 4.2. Frontend (Vercel'ga)

1. **`.env.production` yarating (web papkasida):**
   ```env
   VITE_API_URL=https://bank-crm-api.vercel.app/api
   ```

2. **Vercel'ga deploy:**
   ```bash
   cd web
   vercel
   ```

3. **Vercel Environment Variables:**
   - `VITE_API_URL` = backend URL + `/api`

4. **Deploy:**
   - `vercel --prod`

---

## 5-Qism: Muammolarni Hal Qilish

### ❌ MongoDB ulanmayapti

**Lokal MongoDB:**
```bash
# Service'ni ishga tushiring
net start MongoDB

# Tekshiring
mongo --version
```

**MongoDB Atlas:**
- IP Address whitelist'ni tekshiring (`0.0.0.0/0`)
- Username/password to'g'riligini tekshiring
- Connection string to'g'riligini tekshiring

### ❌ Backend ishlamayapti

1. `.env` faylni tekshiring
2. Port band emasligini tekshiring:
   ```bash
   netstat -ano | findstr :5000
   ```
3. Dependencies'ni qayta o'rnating:
   ```bash
   rm -rf node_modules
   npm install
   ```

### ❌ Frontend backend'ga ulanmayapti

1. `.env` faylda `VITE_API_URL` to'g'riligini tekshiring
2. Backend ishlab turganligini tekshiring
3. CORS xatosi bo'lsa:
   - Backend `.env` da `CORS_ORIGIN` ni frontend URL ga o'zgartiring
4. Brauzer cache'ni tozalang (Ctrl + Shift + Delete)

### ❌ CORS Error

Backend `.env` faylidagi `CORS_ORIGIN` ni frontend URL'ga o'zgartiring:
```env
# Development
CORS_ORIGIN=http://localhost:5173

# Production
CORS_ORIGIN=https://your-frontend.vercel.app
```

### ❌ Token expired xatosi

- Login qaytadan qiling
- Token 7 kun amal qiladi

---

## 6-Qism: API Endpoints

### Authentication

**Operator Login:**
```http
POST http://localhost:5000/api/auth/operator/login
Content-Type: application/json

{
  "login": "401",
  "password": "1234"
}
```

**Admin Login:**
```http
POST http://localhost:5000/api/auth/admin/login
Content-Type: application/json

{
  "login": "Nodir",
  "password": "Ipoteka"
}
```

### Clients

**Get Operator Clients:**
```http
GET http://localhost:5000/api/clients/operator
Authorization: Bearer <token>
```

**Create Client:**
```http
POST http://localhost:5000/api/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "ism": "Ali",
  "familya": "Valiyev",
  "telefon": "+998901234567",
  "hudud": "Toshkent",
  "garov": "Uy-joy",
  "summa": 50000000,
  "status": "Jarayonda",
  "comment": "Test mijoz"
}
```

Batafsil API dokumentatsiya: [server/README.md](server/README.md)

---

## 7-Qism: Folder Structure

```
Bank_CRM/
├── server/                    # Backend
│   ├── src/
│   │   ├── config/           # Database config
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth middleware
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   └── server.js         # Entry point
│   ├── .env                  # Environment variables
│   ├── .env.example          # Example env
│   ├── package.json
│   ├── vercel.json           # Vercel config
│   └── README.md             # Backend docs
│
├── web/                      # Frontend
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── services/        # API services
│   │   ├── utils/           # API utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                 # Environment variables
│   ├── .env.example         # Example env
│   ├── package.json
│   └── vercel.json          # Vercel config
│
├── README.md                # Main readme
└── SETUP.md                 # Bu fayl
```

---

## 8-Qism: Keyingi Qadamlar

✅ **Backend tayyor** - MongoDB bilan to'liq ishlaydi
✅ **Frontend tayyor** - API'lar orqali ma'lumot oladi/yuboradi
✅ **Muammo hal qilindi** - Endi barcha foydalanuvchilar bir xil ma'lumotni ko'radi

### Qo'shimcha xususiyatlar qo'shish:

1. **Real-time updates** - Socket.io qo'shish
2. **File upload** - Hujjatlar yuklash
3. **SMS notifications** - Mijozlarga SMS yuborish
4. **Raportlar** - PDF/Excel raportlar
5. **Role-based permissions** - Turli huquqlar

---

## Yordam

Muammoga duch kelsangiz:
1. Loglarni tekshiring (terminal output)
2. MongoDB Compass da ma'lumotlarni ko'ring
3. Browser DevTools → Network tab'ni tekshiring
4. `.env` fayllar to'g'riligini tekshiring

## Muvaffaqiyatli ishlar! 🚀
