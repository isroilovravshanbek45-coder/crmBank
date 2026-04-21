# 🔍 Debug Guide - "Faqat operatorlar uchun" Xatosi

## Muammo:
Operator client qo'shmoqchi bo'lganda "Faqat operatorlar uchun" xatosi chiqayapti.

## Sabablari:

### 1. **Token yo'q yoki noto'g'ri**
- localStorage'da token mavjud emas
- Token expired bo'lgan
- Token admin uchun, operator uchun emas

### 2. **Token role field noto'g'ri**
- Token ichida `role: 'operator'` o'rniga boshqa qiymat bor

## ✅ YECHIM - QADAMMA-QADAM:

### Step 1: Browser Console'ni oching
**Chrome/Edge:** `F12` yoki `Ctrl+Shift+I`

### Step 2: Console'da quyidagini ishga tushiring:

```javascript
// 1. LocalStorage'ni tekshirish
console.log('=== LocalStorage Check ===');
console.log('Token:', localStorage.getItem('bankCrmToken'));
console.log('Operator ID:', localStorage.getItem('bankCrmOperatorId'));
console.log('User Role:', localStorage.getItem('bankCrmUserRole'));
console.log('Is Logged In:', localStorage.getItem('bankCrmIsLoggedIn'));

// 2. Token decode qilish (role tekshirish)
const token = localStorage.getItem('bankCrmToken');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('=== Token Payload ===');
    console.log('Role:', payload.role);
    console.log('Operator ID:', payload.operatorId);
    console.log('Expires:', new Date(payload.exp * 1000));
    console.log('Is Expired:', Date.now() >= payload.exp * 1000);
  } catch (e) {
    console.error('Token decode error:', e);
  }
} else {
  console.error('❌ NO TOKEN FOUND!');
}
```

### Step 3: Natijani tahlil qilish

#### ✅ To'g'ri natija:
```
=== LocalStorage Check ===
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Operator ID: 401
User Role: operator
Is Logged In: true

=== Token Payload ===
Role: operator
Operator ID: 401
Expires: Thu Apr 21 2026 ...
Is Expired: false
```

#### ❌ Noto'g'ri natija:
```
Role: admin    <-- Bu muammo!
```

## 🔧 QUICK FIX:

### Agar token admin uchun bo'lsa:

```javascript
// Console'da ishga tushiring:
localStorage.clear();
location.reload();
```

Keyin qayta **Operator** sifatida login qiling!

---

## 🚨 AGAR HAL BO'LMASA:

### Full Reset:

```javascript
// 1. LocalStorage'ni tozalash
localStorage.clear();

// 2. Backend'ga test so'rov yuborish
fetch('http://localhost:5000/api/auth/operator/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({login: '401', password: '1234'})
})
.then(r => r.json())
.then(data => {
  console.log('Login response:', data);
  if (data.success) {
    localStorage.setItem('bankCrmToken', data.data.token);
    localStorage.setItem('bankCrmOperatorId', data.data.user.operatorId);
    localStorage.setItem('bankCrmUserRole', data.data.user.role);
    localStorage.setItem('bankCrmIsLoggedIn', 'true');
    console.log('✅ Token saved!');
    location.reload();
  }
});
```

---

## 📊 BACKEND LOG TEKSHIRISH:

Server terminal'da quyidagi log'larni qidiring:

```
Operator auth attempt: { hasToken: true, decodedRole: 'admin', expectedRole: 'operator' }
```

Agar `decodedRole: 'admin'` bo'lsa, muammo aniq!

---

## ✅ PERMANENT FIX:

### Frontend'da role-based redirect:

Location: `web/src/pages/LoginPage.jsx`

```javascript
// Login muvaffaqiyatli bo'lganda
if (response.success) {
  const { token, user } = response.data;

  // Admin bo'lsa, admin panel'ga yo'naltirish
  if (user.role === 'admin') {
    navigate('/admin');
  } else {
    // Operator bo'lsa, dashboard'ga
    navigate('/dashboard');
  }
}
```

---

## 🎯 FINAL CHECK:

Console'da:
```javascript
// Token role'ni tekshirish
const token = localStorage.getItem('bankCrmToken');
const role = JSON.parse(atob(token.split('.')[1])).role;
console.log('Current role:', role);

// To'g'ri bo'lishi kerak: "operator"
```

---

**Agar bu yo'riqnomadan keyin ham ishlamasa, quyidagini yuboring:**
1. Browser console screenshot
2. Backend terminal log
3. Network tab screenshot (F12 → Network)
