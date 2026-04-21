# 🚀 QUICK FIX - "Faqat operatorlar uchun" Xatosi

## ⚡ TEZKOR YECHIM (30 soniya)

### 1️⃣ Browser Console'ni oching
**F12** tugmasini bosing (yoki **Ctrl + Shift + I**)

### 2️⃣ Console tab'ga o'ting va quyidagini yozing:

```javascript
// LocalStorage'ni to'liq tozalash
localStorage.clear();

// Sahifani yangilash
location.reload();
```

### 3️⃣ Qayta login qiling
- Login: **401** (yoki 402-410)
- Parol: **1234**

---

## ✅ MUAMMO HAL BO'LISHI KERAK!

Agar hal bo'lmasa, quyidagi **Professional Fix**'dan foydalaning:

---

# 🔧 PROFESSIONAL FIX

## Token Diagnostic Script

Browser Console'da ishga tushiring:

```javascript
console.log('%c🔍 Bank CRM Token Diagnostic', 'color: blue; font-size: 16px; font-weight: bold');

// 1. LocalStorage check
const token = localStorage.getItem('bankCrmToken');
const operatorId = localStorage.getItem('bankCrmOperatorId');
const userRole = localStorage.getItem('bankCrmUserRole');
const isLoggedIn = localStorage.getItem('bankCrmIsLoggedIn');

console.log('\n📦 LocalStorage:');
console.log('  Token:', token ? '✅ EXISTS' : '❌ MISSING');
console.log('  Operator ID:', operatorId || '❌ MISSING');
console.log('  User Role:', userRole || '❌ MISSING');
console.log('  Is Logged In:', isLoggedIn || '❌ MISSING');

// 2. Token decode
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('\n🔐 Token Payload:');
    console.log('  Role:', payload.role);
    console.log('  Operator ID:', payload.operatorId || 'N/A');
    console.log('  Username:', payload.username || 'N/A');
    console.log('  Issued At:', new Date(payload.iat * 1000).toLocaleString());
    console.log('  Expires At:', new Date(payload.exp * 1000).toLocaleString());
    console.log('  Is Expired:', Date.now() >= payload.exp * 1000 ? '❌ YES' : '✅ NO');

    // 3. Diagnosis
    console.log('\n💡 Diagnosis:');
    if (payload.role === 'operator') {
      console.log('  ✅ Token is valid for operator');
      console.log('  ✅ You should be able to create clients');
    } else if (payload.role === 'admin') {
      console.log('  ⚠️  You are logged in as ADMIN');
      console.log('  ⚠️  Operators cannot use admin tokens');
      console.log('  🔧 Solution: Clear storage and login as operator');
    } else {
      console.log('  ❌ Invalid role in token:', payload.role);
      console.log('  🔧 Solution: Clear storage and re-login');
    }
  } catch (e) {
    console.error('  ❌ Token decode error:', e.message);
    console.log('  🔧 Solution: Token is corrupted, clear storage');
  }
} else {
  console.log('\n❌ NO TOKEN FOUND');
  console.log('  🔧 Solution: Login first');
}

console.log('\n' + '='.repeat(50));
```

---

## 🔄 Full Reset Script

Agar yuqoridagi script **admin token** topsa, quyidagini ishga tushiring:

```javascript
console.log('%c🔄 Full Reset - Clearing Admin Session', 'color: red; font-size: 14px; font-weight: bold');

// Clear everything
localStorage.clear();
sessionStorage.clear();

console.log('✅ All storage cleared');

// Re-login as operator
fetch('http://localhost:5000/api/auth/operator/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({login: '401', password: '1234'})
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    const { token, user } = data.data;
    localStorage.setItem('bankCrmToken', token);
    localStorage.setItem('bankCrmOperatorId', user.operatorId);
    localStorage.setItem('bankCrmUserRole', user.role);
    localStorage.setItem('bankCrmIsLoggedIn', 'true');

    console.log('%c✅ Operator Login Successful!', 'color: green; font-size: 14px; font-weight: bold');
    console.log('  Role:', user.role);
    console.log('  Operator ID:', user.operatorId);
    console.log('\n🔄 Reloading page...');

    setTimeout(() => location.reload(), 1000);
  } else {
    console.error('❌ Login failed:', data.message);
  }
})
.catch(err => {
  console.error('❌ Network error:', err.message);
  console.log('🔧 Make sure backend is running on http://localhost:5000');
});
```

---

## 📊 Test Client Creation

Login qilgandan **keyin** test qiling:

```javascript
// Test: Create client as operator
const token = localStorage.getItem('bankCrmToken');

fetch('http://localhost:5000/api/clients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    ism: 'Test',
    familya: 'User',
    telefon: '+998901234567',
    hudud: 'Toshkent',
    garov: 'Uy',
    summa: 10000000,
    status: 'Jarayonda',
    comment: 'Test client from console'
  })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('%c✅ CLIENT CREATED SUCCESSFULLY!', 'color: green; font-size: 16px; font-weight: bold');
    console.log('Client:', data.data);
  } else {
    console.error('%c❌ FAILED TO CREATE CLIENT', 'color: red; font-size: 14px; font-weight: bold');
    console.error('Error:', data.message);
  }
});
```

---

## 🎯 FINAL VERIFICATION

```javascript
// Verify everything is correct
const checks = {
  token: !!localStorage.getItem('bankCrmToken'),
  operatorId: !!localStorage.getItem('bankCrmOperatorId'),
  role: localStorage.getItem('bankCrmUserRole') === 'operator',
  loggedIn: localStorage.getItem('bankCrmIsLoggedIn') === 'true'
};

console.log('%c✅ Final Verification', 'color: blue; font-size: 14px; font-weight: bold');
console.log('  Token exists:', checks.token ? '✅' : '❌');
console.log('  Operator ID exists:', checks.operatorId ? '✅' : '❌');
console.log('  Role is operator:', checks.role ? '✅' : '❌');
console.log('  Logged in flag:', checks.loggedIn ? '✅' : '❌');

const allGood = Object.values(checks).every(v => v);
if (allGood) {
  console.log('\n%c🎉 EVERYTHING IS CORRECT! You can create clients now.', 'color: green; font-size: 14px; font-weight: bold');
} else {
  console.log('\n%c⚠️  STILL HAVE ISSUES. Run Full Reset Script above.', 'color: orange; font-size: 14px; font-weight: bold');
}
```

---

## 🆘 HAL BO'LMASA

1. **Backend ishlab turganini tekshiring:**
   ```bash
   cd server
   npm run dev
   ```

2. **Backend log'larni ko'ring:**
   Server terminal'da xato log'lari bormi?

3. **Network tab'ni tekshiring:**
   F12 → Network → POST request to `/api/clients` → Response

4. **Screenshots yuboring:**
   - Browser Console
   - Network tab
   - Backend terminal log
