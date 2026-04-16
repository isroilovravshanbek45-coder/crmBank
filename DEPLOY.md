# 🚀 Bank CRM - Vercel'ga Deploy Qilish

**To'liq qo'llanma - Bosqichma-bosqich**

---

## 📋 Zarur narsalar

- ✅ GitHub account
- ✅ Vercel account (https://vercel.com)
- ✅ MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

---

## 🗂️ QISM 1: MongoDB Atlas Sozlash

### 1.1. MongoDB Atlas Account Yaratish

1. **Saytga kiring:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** qiling (Google yoki Email bilan)
3. **Free tier** (M0) ni tanlang

### 1.2. Cluster Yaratish

1. **Create Cluster** tugmasini bosing
2. Sozlamalar:
   - **Cloud Provider:** AWS (yoki Azure/GCP)
   - **Region:** Singapore yoki Frankfurt (yaqin region tanlang)
   - **Cluster Tier:** M0 Sandbox (FREE)
   - **Cluster Name:** `BankCRM` (yoki istalgan nom)
3. **Create Cluster** tugmasini bosing (2-3 daqiqa kutish kerak)

### 1.3. Database User Yaratish

1. **Security → Database Access** ga kiring
2. **Add New Database User** tugmasini bosing
3. Sozlamalar:
   - **Authentication Method:** Password
   - **Username:** `bankcrm_user` (yoki istalgan username)
   - **Password:** Kuchli parol yarating (saqlang!)
   - **Database User Privileges:** `Read and write to any database`
4. **Add User** tugmasini bosing

### 1.4. Network Access Sozlash

1. **Security → Network Access** ga kiring
2. **Add IP Address** tugmasini bosing
3. **Allow Access from Anywhere** ni tanlang (0.0.0.0/0)
   - ⚠️ Production uchun - faqat Vercel IP'larini qo'shish yaxshiroq
4. **Confirm** tugmasini bosing

### 1.5. Connection String Olish

1. **Database → Connect** tugmasini bosing
2. **Connect your application** ni tanlang
3. **Driver:** Node.js, **Version:** 4.1 or later
4. **Connection String** ni nusxalang:
   ```
   mongodb+srv://bankcrm_user:<password>@bankcrm.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. `<password>` ni o'zingizning parol bilan almashtiring
6. Database nomi qo'shing:
   ```
   mongodb+srv://bankcrm_user:your_password@bankcrm.xxxxx.mongodb.net/bank_crm?retryWrites=true&w=majority
   ```

✅ **MongoDB Atlas tayyor!**

---

## 🔧 QISM 2: GitHub'ga Push Qilish

### 2.1. GitHub Repository Yaratish

1. **GitHub.com** ga kiring
2. **New repository** tugmasini bosing
3. Sozlamalar:
   - **Repository name:** `bank-crm`
   - **Visibility:** Private (tavsiya etiladi) yoki Public
   - ❌ **Initialize with README** - belgilamang!
4. **Create repository** tugmasini bosing

### 2.2. Loyihani GitHub'ga Push Qilish

Loyiha papkasida terminalda:

```bash
# 1. Git init (agar qilmagan bo'lsangiz)
git init

# 2. Barcha fayllarni qo'shish
git add .

# 3. Commit qilish
git commit -m "Initial commit - Bank CRM with backend and frontend"

# 4. Main branch yaratish
git branch -M main

# 5. Remote qo'shish (GitHub'dagi URL ni kiriting)
git remote add origin https://github.com/your-username/bank-crm.git

# 6. Push qilish
git push -u origin main
```

✅ **GitHub'ga yuklandi!**

---

## 🚀 QISM 3: Backend'ni Vercel'ga Deploy Qilish

### 3.1. Vercel Account Yaratish

1. **Saytga kiring:** https://vercel.com/signup
2. **GitHub bilan Sign up** qiling
3. GitHub'ga ruxsat bering

### 3.2. Backend Project Import Qilish

1. Vercel Dashboard: **Add New** → **Project**
2. **Import Git Repository**
3. `bank-crm` repository ni tanlang
4. **Import** tugmasini bosing

### 3.3. Backend Sozlamalari

**Root Directory sozlash:**
- **Root Directory:** `server` ni tanlang
- **Framework Preset:** Other
- **Build Command:** Bo'sh qoldiring (yoki `npm install`)
- **Output Directory:** Bo'sh qoldiring

**Environment Variables qo'shish:**

Environment Variables bo'limida quyidagilarni qo'shing:

| Key | Value | Izoh |
|-----|-------|------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `bank_crm_secret_prod_2024_xyz` | Kuchli secret key |
| `ADMIN_USERNAME` | `Nodir` | Admin username |
| `ADMIN_PASSWORD` | `Ipoteka` | Admin password |
| `NODE_ENV` | `production` | Production rejim |
| `CORS_ORIGIN` | `*` | Hozircha * qo'ying, keyinroq frontend URL qo'yiladi |

### 3.4. Deploy Qilish

1. **Deploy** tugmasini bosing
2. 2-3 daqiqa kutish (deploy bo'ladi)
3. Deploy tugagach, URL ni ko'rasiz:
   ```
   https://bank-crm-api-xxx.vercel.app
   ```

### 3.5. Backend Test Qilish

Brauzerda oching:
```
https://bank-crm-api-xxx.vercel.app/health
```

Ko'rinishi kerak:
```json
{
  "success": true,
  "message": "Bank CRM API is running"
}
```

✅ **Backend deploy qilindi!**

**Backend URL ni saqlang:** `https://bank-crm-api-xxx.vercel.app`

---

## 🎨 QISM 4: Frontend'ni Vercel'ga Deploy Qilish

### 4.1. Frontend Environment Variables Yangilash

Loyihada `web/.env.production` faylini tahrirlang:

```env
# Backend URL ni kiriting (oxirida /api qo'shish kerak!)
VITE_API_URL=https://bank-crm-api-xxx.vercel.app/api
```

### 4.2. O'zgarishlarni GitHub'ga Push Qilish

```bash
git add web/.env.production
git commit -m "Update production API URL"
git push
```

### 4.3. Frontend Project Import Qilish

1. Vercel Dashboard: **Add New** → **Project**
2. **Import Git Repository**
3. Yana `bank-crm` repository ni tanlang
4. **Import** tugmasini bosing

### 4.4. Frontend Sozlamalari

**Root Directory sozlash:**
- **Root Directory:** `web` ni tanlang
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

**Environment Variables qo'shish:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://bank-crm-api-xxx.vercel.app/api` |

### 4.5. Deploy Qilish

1. **Deploy** tugmasini bosing
2. 1-2 daqiqa kutish
3. Deploy tugagach, URL ni ko'rasiz:
   ```
   https://bank-crm-xxx.vercel.app
   ```

✅ **Frontend deploy qilindi!**

**Frontend URL ni saqlang:** `https://bank-crm-xxx.vercel.app`

---

## 🔄 QISM 5: Backend CORS Yangilash

### 5.1. Backend Environment Variables Yangilash

1. Vercel Dashboard → **Backend project** → **Settings** → **Environment Variables**
2. `CORS_ORIGIN` ni o'zgartiring:
   - **Eski:** `*`
   - **Yangi:** `https://bank-crm-xxx.vercel.app` (frontend URL)
3. **Save** qiling

### 5.2. Backend'ni Redeploy Qilish

1. **Deployments** tabga kiring
2. Eng oxirgi deploy'ni toping
3. **⋯** (3 nuqta) → **Redeploy** → **Redeploy**
4. 1-2 daqiqa kutish

✅ **CORS sozlandi!**

---

## 🧪 QISM 6: Production Test Qilish

### Test 1: Frontend Ishlayaptimi?

Brauzerda oching: `https://bank-crm-xxx.vercel.app`

Ko'rinishi kerak:
- ✅ Login sahifa
- ✅ Dizayn to'g'ri

### Test 2: Operator Login

1. Login: `401`
2. Parol: `1234`
3. Mijoz qo'shib ko'ring

### Test 3: Admin Login

1. URL: `https://bank-crm-xxx.vercel.app/admin/login`
2. Login: `Nodir`
3. Parol: `Ipoteka`
4. Dashboard'da mijozlar ko'rinishi kerak

### Test 4: Boshqa Kompyuterdan

1. **Telefon yoki boshqa kompyuterdan** oching
2. Operator sifatida kirish
3. Mijoz qo'shish
4. **Kompyuter 1'dan** admin sifatida kirish
5. Mijoz ko'rinishi kerak ✅

🎉 **HAMMASI ISHLAYDI!**

---

## 📱 QISM 7: Custom Domain (Ixtiyoriy)

### Agar o'z domeningiz bo'lsa:

1. **Vercel Dashboard** → **Frontend project** → **Settings** → **Domains**
2. **Add** tugmasini bosing
3. Domain ni kiriting: `bankcrm.uz` (masalan)
4. DNS sozlamalarini ko'rsatma bo'yicha qo'shing
5. 5-10 daqiqa kutish

✅ **Custom domain ulandi!**

---

## 🔧 QISM 8: Monitoring va Logs

### Backend Logs:

1. Vercel Dashboard → **Backend project** → **Deployments**
2. Eng oxirgi deploy → **View Function Logs**
3. Real-time loglarni ko'ring

### Frontend Logs:

1. Vercel Dashboard → **Frontend project** → **Deployments**
2. Eng oxirgi deploy → **View Build Logs**

### MongoDB Logs:

1. MongoDB Atlas → **Cluster** → **Metrics**
2. Real-time statistika va loglar

---

## 🚨 QISM 9: Muammolarni Hal Qilish

### ❌ Muammo 1: Frontend backend'ga ulanmayapti

**Xato:** Network Error, CORS Error

**Yechim:**
1. Backend Environment Variables tekshiring:
   - `CORS_ORIGIN` to'g'ri frontend URL borligini
2. Backend'ni redeploy qiling
3. Frontend'da `.env.production` faylida URL to'g'riligini tekshiring

---

### ❌ Muammo 2: MongoDB ulanmayapti

**Xato:** MongoDB connection error

**Yechim:**
1. MongoDB Atlas → **Network Access**
   - `0.0.0.0/0` qo'shilganligini tekshiring
2. Connection string to'g'riligini tekshiring
3. Username va password to'g'riligini tekshiring

---

### ❌ Muammo 3: 404 Error (Backend)

**Xato:** Cannot GET /api/...

**Yechim:**
1. Backend vercel.json faylini tekshiring
2. Root Directory `server` ga o'rnatilganligini tekshiring
3. Redeploy qiling

---

### ❌ Muammo 4: Build Error (Frontend)

**Xato:** Build failed

**Yechim:**
1. Lokal'da build qilib ko'ring:
   ```bash
   cd web
   npm run build
   ```
2. Xatolarni tuzating
3. GitHub'ga push qiling
4. Avtomatik redeploy bo'ladi

---

## ✅ QISM 10: Deployment Checklist

Deploy qilishdan oldin:

- [ ] MongoDB Atlas cluster yaratilgan
- [ ] Database user yaratilgan
- [ ] Network access 0.0.0.0/0 qo'shilgan
- [ ] Connection string olingan
- [ ] GitHub repository yaratilgan
- [ ] Loyiha GitHub'ga push qilingan
- [ ] Backend Vercel'ga deploy qilingan
- [ ] Backend environment variables qo'shilgan
- [ ] Backend test qilingan (/health)
- [ ] Frontend .env.production yangilangan
- [ ] Frontend Vercel'ga deploy qilingan
- [ ] Frontend environment variables qo'shilgan
- [ ] Backend CORS yangilangan
- [ ] Backend redeploy qilingan
- [ ] Production test qilingan
- [ ] Operator login ishlaydi
- [ ] Admin login ishlaydi
- [ ] Mijoz qo'shish ishlaydi
- [ ] Boshqa kompyuterdan test qilingan

**Barcha ✅ bo'lsa - DEPLOY MUVAFFAQIYATLI!** 🎉

---

## 📊 QISM 11: Production URLs

### Backend:
```
https://bank-crm-api-xxx.vercel.app
```

**API Endpoints:**
- Health: `/health`
- Login: `/api/auth/operator/login`
- Admin: `/api/auth/admin/login`
- Clients: `/api/clients`

### Frontend:
```
https://bank-crm-xxx.vercel.app
```

**Pages:**
- Operator: `/`
- Admin: `/admin/login`
- Dashboard: `/dashboard`

---

## 🔐 QISM 12: Xavfsizlik

### Production uchun tavsiyalar:

1. **JWT_SECRET** ni kuchli qiling:
   ```
   bank_crm_secret_prod_2024_xyz123abc456def
   ```

2. **Admin parolni** o'zgartiring:
   ```
   ADMIN_PASSWORD=KuchliParol123!@#
   ```

3. **CORS** ni aniq sozlang:
   ```
   CORS_ORIGIN=https://bank-crm-xxx.vercel.app
   ```

4. **MongoDB Atlas** IP whitelist:
   - Production'da 0.0.0.0/0 o'rniga faqat Vercel IP'larini qo'shing

5. **Environment Variables** ni hech kimga ko'rsatmang!

---

## 🎯 Xulosa

✅ **Backend deploy:** Vercel + MongoDB Atlas
✅ **Frontend deploy:** Vercel
✅ **CORS sozlangan**
✅ **Environment variables to'g'ri**
✅ **Production tayyor!**

**Endi loyihangiz butun dunyoda ishlaydi!** 🌍🚀

8 ta operatorga URL bering:
- **Operatorlar:** https://bank-crm-xxx.vercel.app
- **Admin:** https://bank-crm-xxx.vercel.app/admin/login

**Muvaffaqiyatli deploy!** 🎊

---

## 📞 Qo'shimcha

### Keyingi deploy (kod o'zgarganda):

1. Kodni o'zgartiring
2. GitHub'ga push qiling:
   ```bash
   git add .
   git commit -m "Update: ..."
   git push
   ```
3. Vercel avtomatik deploy qiladi! ✅

### Yangilashlar:

- Backend o'zgarganda → backend avtomatik deploy bo'ladi
- Frontend o'zgarganda → frontend avtomatik deploy bo'ladi
- Environment variable o'zgarganda → manual redeploy kerak

**Hammasi tayyor!** 🎉
