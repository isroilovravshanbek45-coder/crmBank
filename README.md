# Bank CRM

Bank CRM tizimi - Mijozlarni boshqarish va operator nazorati uchun zamonaviy web-ilova.

## Texnologiyalar

- ⚛️ React 19.2.4
- ⚡ Vite
- 🎨 Tailwind CSS
- 🧭 React Router DOM
- 📊 XLSX (Excel export)

## Xususiyatlar

### Operator Panel
- Mijozlarni qo'shish va tahrirlash
- Real-time statistika
- Status boshqaruvi (Jarayonda, Tasdiqlangan, Rad etilgan)
- Mijoz tafsilotlari

### Admin Panel
- Barcha operatorlar va mijozlarni ko'rish
- Vaqt bo'yicha tahlil (Bugun, Hafta, Oy)
- Top 5 eng yaxshi operatorlar
- Excel export funksiyasi
- Operator samaradorligi tahlili

## O'rnatish

```bash
cd web
pnpm install
```

## Ishga tushirish

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Deploy (Vercel)

1. GitHub ga push qiling
2. [Vercel](https://vercel.com) ga kiring
3. "Import Project" tugmasini bosing
4. GitHub repository ni tanlang
5. Deploy qiling!

**Build Settings:**
- Framework Preset: Vite
- Root Directory: `web`
- Build Command: `pnpm build`
- Output Directory: `dist`

## Login Ma'lumotlari

### Operator
- Login: `401` - `410`
- Parol: `1234`

### Admin
- Maxsus kirish sahifasi orqali

## Litsenziya

MIT
