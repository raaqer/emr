# Son kontrol özeti — kurulum öncesi (2026-08-21 solid fix / v53)

## Root cause hatırlatma (eski “durum aynı”)

- Android’de `PENDING_OTP` skip edilmişti (sadece sahte temporaryInternet).
- RADIUS UDP 1812 düşmüştü → `emr-android-temp` login olmuyordu.
- Eski “sınırsız” bug: mac-cookie 3d + soft revoke → çözüm bypass kaldırmak değil, **kick’li expire**.

## Şu anki doğru davranış

| Parça | Durum |
|-------|--------|
| Android | timed PENDING_OTP (~300+5s), BullMQ/timer revoke `kick:true` |
| RADIUS | phone / emr-android-pending → emr-android-temp, session-timeout=5m, add-mac-cookie=no |
| on-login | WA fetch |
| login.html | v53 android-dual-pending-otp-radius-v53 |
| Dual-path | pending grant (~2.4s) sonra RADIUS POST dst=generate_204 |
| Watchdog | RADIUS + start-server.ps1 |
| Portlar | **saha formu (`site.env`) — sen yazarsın** |

## Kritik dosyalar (yerel emr-hotspot’tan deploy)

- `login.html`
- `android-hotspot-radius.js`
- `captive-portal.service.ts`
- `pending-otp-access`
- `mikrotik.adapter` → `revokeTemporaryInternet(kick)`
- deploy mirror

## Bu repodaki saha formu

IP ve port girişi: `deploy/site.env.example` → `deploy/site.env`  
Checklist: `deploy/KURULUM.md`  
Doğrulama: `deploy/scripts/validate-site-env.js`
