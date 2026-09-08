# Venüs Termal — Otel saha kurulum checklist (v53)

Hedef akış (değişmez):

1. Numara + WhatsApp gönder → hemen ~5 dk yetkili internet (CNA “yetkilendirme gerekiyor” olmamalı).
2. WA link aynı numara + kimlik → 24 saat.
3. Doğrulama yok → ~5 dk sonunda sert kesim (`kick:true`).
4. iPhone: `whatsapp-link` JSON + `PENDING_OTP` bozulmamalı.

## 0) Hazırlık (bu repoda)

```bat
cd deploy
copy site.env.example site.env
notepad site.env
```

- `WEB_PORT=` ve `API_PORT=` **sen yaz** (boş bırakılmış).
- IP alanlarını kablo çekerken doldur.
- Port yazdıktan sonra:

```bat
node scripts\validate-site-env.js
```

(veya Linux: `node scripts/validate-site-env.js`)

## 1) Kablo / IP (doldururken)

| Alan | site.env key | Yazılan değer |
|------|--------------|---------------|
| EMR sunucu | `EMR_SERVER_IP` | _______________ |
| MikroTik mgmt | `MIKROTIK_IP` | _______________ |
| Hotspot GW | `HOTSPOT_GATEWAY_IP` | _______________ |
| DHCP pool | `HOTSPOT_DHCP_POOL_*` | _______________ |
| WAN | `WAN_IP` / `WAN_GATEWAY` | _______________ |
| Web port | `WEB_PORT` | _______________ |
| API port | `API_PORT` | _______________ |
| SSID | `SSID` | _______________ |

Ping kontrolü (değerleri yazdıktan sonra):

```bat
ping %EMR_SERVER_IP%
ping %MIKROTIK_IP%
ping %HOTSPOT_GATEWAY_IP%
```

## 2) Servisler

- [ ] API `API_PORT` üzerinde dinliyor
- [ ] Web `WEB_PORT` üzerinde dinliyor
- [ ] RADIUS UDP **1812** ayakta (watchdog / `start-server.ps1`)
- [ ] Redis / BullMQ (PENDING_OTP timer) ayakta

## 3) MikroTik / hotspot profil

- [ ] `emr-android-pending` → `emr-android-temp`
- [ ] `session-timeout=5m` (`RADIUS_SESSION_TIMEOUT_SEC=300`)
- [ ] `add-mac-cookie=no` (eski “sınırsız” bug geri gelmesin)
- [ ] on-login WA fetch
- [ ] `revokeTemporaryInternet(kick:true)` yolu deploy edildi

## 4) Portal build

- [ ] `login.html` = **v53** `android-dual-pending-otp-radius-v53`
- [ ] Android dual-path: önce android-pending-internet grant (~2.4s) → sonra RADIUS POST `dst=generate_204`
- [ ] iPhone whatsapp-link JSON korunuyor
- [ ] Tenant `venus-termal`, WA template `venus_wifi_portal_v2`

## 5) Canlı test (Wi‑Fi unut → bağlan)

| Test | Beklenen |
|------|----------|
| Numara gönder | CNA kalkar, internet hemen gelir |
| Doğrulama yok | ~5 dk (+grace) sonra sert kesim |
| Aynı numara WA link | 24s full grant |
| Android | timed PENDING_OTP (RADIUS + BullMQ revoke kick) |
| iPhone | whatsapp-link + PENDING_OTP bozulmaz |

## 6) Bitince

`site.env` içinde şu bayrakları `true` yap:

- `CHECK_RADIUS_UDP_1812`
- `CHECK_ANDROID_PENDING_OTP_TIMED`
- `CHECK_REVOKE_KICK_TRUE`
- `CHECK_NO_MAC_COOKIE_BYPASS`
- `CHECK_IPHONE_WHATSAPP_LINK_JSON`
- `CHECK_LOGIN_HTML_V53`

Sonra tekrar:

```bat
node scripts\validate-site-env.js --final
```
