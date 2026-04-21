# 🔧 TOKEN MUAMMOSINI HAL QILISH

## Muammo: "Faqat operatorlar uchun" (403 Forbidden)

Bu xato **TOKEN yo'q** yoki **noto'g'ri** degani.

## ✅ YECHIM - Quyidagilarni tartib bilan bajaring:

### 1. Browser Developer Tools'ni oching
- **F12** yoki **Ctrl + Shift + I** (Windows)
- **Cmd + Option + I** (Mac)

### 2. Console tab'ga o'ting va quyidagi kodni kiriting:

```javascript
// LocalStorage'ni to'liq tozalash
localStorage.clear();

// Sahifani yangilash
location.reload();
```

### 3. Qayta LOGIN qiling

**Operator:**
- Login: `401` (yoki 402, 403, 404, 405, 406, 407, 408, 409, 410)
- Parol: `1234`

**Admin:**
- Login: `admin`
- Parol: `changeme123`

### 4. Login qilgandan KEYIN tekshiring

Console'da quyidagini kiriting:

```javascript
console.log('Token:', localStorage.getItem('bankCrmToken'));
console.log('Operator ID:', localStorage.getItem('bankCrmOperatorId'));
console.log('Role:', localStorage.getItem('bankCrmUserRole'));
console.log('Is Logged In:', localStorage.getItem('bankCrmIsLoggedIn'));
```

**To'g'ri natija:**
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (uzun string)
Operator ID: 401
Role: operator
Is Logged In: true
```

### 5. AGAR TOKEN YO'Q BO'LSA:

Login sahifasida muammo bor. Backend ishlayaptimi tekshiring:

```bash
curl http://localhost:5000/health
```

Yoki browser'da: http://localhost:5000/health

## 🔍 Muammo Sabablari

### 1. LocalStorage'da eski ma'lumot
- **Yechim:** `localStorage.clear()` ishlatish

### 2. Backend ishlamayapti
- **Yechim:** Terminal'da `cd server && npm run dev`

### 3. Frontend va Backend URL noto'g'ri
- **Yechim:** `.env` faylini tekshirish

### 4. Login muvaffaqiyatsiz
- **Yechim:** Console'da xatolarni ko'rish

## 🎯 LOGIN PROSESSI TO'G'RI ISHLASHI KERAK:

1. ✅ Login form'ga login/parol kiritiladi
2. ✅ POST request `/api/auth/operator/login` ga ketadi
3. ✅ Backend token qaytaradi
4. ✅ Token `localStorage` ga saqlanadi
5. ✅ Dashboard'ga redirect bo'ladi
6. ✅ Har bir request header'da token yuboriladi

## 🐛 DEBUGGING

Agar hali ishlamasa, quyidagini bajaring:

### Browser Console'da:

```javascript
// 1. Token bor-yo'qligini tekshirish
console.log('Token exists:', !!localStorage.getItem('bankCrmToken'));

// 2. Barcha localStorage ma'lumotlarini ko'rish
console.log('All localStorage:', { ...localStorage });

// 3. Login API'ni qo'lda test qilish
fetch('http://localhost:5000/api/auth/operator/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ login: '401', password: '1234' })
})
  .then(r => r.json())
  .then(data => {
    console.log('Login Response:', data);
    if (data.success && data.data.token) {
      localStorage.setItem('bankCrmToken', data.data.token);
      localStorage.setItem('bankCrmOperatorId', data.data.user.operatorId);
      localStorage.setItem('bankCrmUserRole', data.data.user.role);
      localStorage.setItem('bankCrmIsLoggedIn', 'true');
      console.log('✅ Token saved! Refresh page.');
    }
  });
```

## ✨ TEZKOR FIX (Qo'lda token saqlash)

Agar login ishlamayotgan bo'lsa, qo'lda token oling va saqlang:

### Terminal'da:

```bash
curl -X POST http://localhost:5000/api/auth/operator/login \
  -H "Content-Type: application/json" \
  -d "{\"login\":\"401\",\"password\":\"1234\"}"
```

Natijada kelgan `token` ni nusxalang va browser console'da:

```javascript
// TOKEN'ni o'rniga backend qaytargan tokenni qo'ying
localStorage.setItem('bankCrmToken', 'TOKENNI_SHUNGA_QOYING');
localStorage.setItem('bankCrmOperatorId', '401');
localStorage.setItem('bankCrmUserRole', 'operator');
localStorage.setItem('bankCrmIsLoggedIn', 'true');
location.reload();
```

---

## 📞 AGAR HAMMA NARSA TO'G'RI BAJRILSA:

✅ Login ishlaydi
✅ Token saqlanadi
✅ Dashboard ochiladi
✅ Mijoz qo'shish ishlaydi
✅ Barcha funksiyalar ishlaydi

---

**Agar bu yo'riqnomani bajarib ham ishlamasa, server log'ini yuboring.**
