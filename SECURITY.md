# 🔒 Security Policy

## Xavfsizlik bo'yicha reportlar

Agar siz tizimda xavfsizlik kamchiligini topsangiz, iltimos quyidagi yo'l bilan xabar bering:

1. **Public issue ochMANG** - Bu attackerlar uchun ma'lumot beradi
2. Email yuboring yoki privately report qiling
3. Quyidagi ma'lumotlarni bering:
   - Kamchilik tavsifi
   - Qayta ishlab chiqarish qadamlari
   - Potensial ta'sir darajasi

## Xavfsiz deployment checklist

### ✅ Environment Variables

- [ ] `.env` fayli Git'ga commit qilinmagan
- [ ] `JWT_SECRET` random 64+ belgidan iborat
- [ ] `ADMIN_PASSWORD` kuchli va unique
- [ ] `NODE_ENV=production` sozlangan
- [ ] `ENABLE_RATE_LIMIT=true` yoqilgan

### ✅ Database

- [ ] MongoDB authentication enabled
- [ ] Database user minimal privileges bilan
- [ ] Network access faqat kerakli IP'lardan
- [ ] Backup mechanism sozlangan
- [ ] Connection string exposed emas

### ✅ API Security

- [ ] CORS faqat trusted origin'lar uchun
- [ ] Rate limiting yoqilgan
- [ ] Request validation barcha endpoint'larda
- [ ] Sensitive data log'da yo'q
- [ ] Error messages generic (detailed emas)

### ✅ Authentication

- [ ] JWT token muddati qisqa (recommended: 15m access, 7d refresh)
- [ ] Password hashing (bcrypt, min 12 rounds)
- [ ] Account lockout after failed attempts
- [ ] Operator parollari default `1234` emas
- [ ] Session invalidation on logout

### ✅ Frontend

- [ ] Sensitive data localStorage'da emas
- [ ] Input validation client-side ham
- [ ] XSS protection enabled
- [ ] Console.log production'da yo'q
- [ ] API keys exposed emas

### ✅ Server

- [ ] HTTPS enabled (production)
- [ ] Security headers (Helmet)
- [ ] File upload size limits
- [ ] Request timeout configured
- [ ] Graceful shutdown implemented

## Bilinen xavfsizlik muammolar va yechimlar

### 1. JWT Token Expiration

**Muammo**: Token 7 kun davomida expired bo'lmaydi

**Yechim**:
```javascript
// constants.js
JWT_CONFIG: {
  ACCESS_TOKEN_EXPIRY: '15m',  // 15 minutes
  REFRESH_TOKEN_EXPIRY: '7d'   // 7 days
}
```

### 2. Rate Limiting

**Muammo**: Development'da o'chirilgan

**Yechim**:
```env
ENABLE_RATE_LIMIT=true
```

### 3. Default Passwords

**Muammo**: Barcha operator parollari `1234`

**Yechim**: Production'da har bir operator uchun unique parol o'rnatish

### 4. CORS Configuration

**Muammo**: `!origin` - har kim API'ni chaqira oladi

**Yechim**:
```javascript
// server.js - Production'da:
origin: function (origin, callback) {
  // !origin check'ni olib tashlash production'da
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('CORS policy: Origin not allowed'));
  }
}
```

## Audit Log

Muhim amaliyotlar log'lanishi kerak:

- ✅ Login attempts (successful va failed)
- ✅ Password changes
- ✅ Admin operations
- ✅ Data export
- ⚠️ Client deletion (soft delete implemented)
- ⚠️ Operator creation/deletion

## Compliance

### Data Protection

- Mijoz ma'lumotlari faqat authorized userlar ko'radi
- Soft delete - ma'lumot butunlay o'chirilmaydi
- Admin barcha ma'lumotlarga access'ga ega

### Recommendation

Production'da qo'shimcha:
- Two-factor authentication (2FA)
- Password complexity requirements
- Regular security audits
- Penetration testing
- SSL/TLS certificate
- Regular dependency updates
- Security monitoring va alerting

## Vulnerability Disclosure Timeline

1. **Reported**: Xavfsizlik muammosi haqida xabar berilgan
2. **Confirmed** (24-48 soat): Muammo tasdiqlangan
3. **Fixed** (7 kun): Patch released
4. **Disclosed** (30 kun): Public disclosure after fix deployed

## Security Updates

Security patch'lar darhol release qilinadi va quyidagicha tag qo'yiladi:

```
git tag -a v1.0.1-security -m "Security fix: <description>"
```

## Contact

Security muammolar uchun:
- Priority: HIGH/CRITICAL uchun darhol
- Priority: MEDIUM/LOW uchun 48 soat ichida javob

---

**Last Updated**: 2026-04-22
