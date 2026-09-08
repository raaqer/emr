# emr — Venüs Termal Hotspot saha kurulumu

Otel kurulumu için IP/port formu ve son kontrol paketi.

## Hızlı başlangıç (otelde)

```bat
cd deploy
copy site.env.example site.env
notepad site.env
```

1. **Portları sen yaz:** `WEB_PORT=` ve `API_PORT=` (bilerek boş).
2. **IP’leri kablo çekerken doldur:** `EMR_SERVER_IP`, `MIKROTIK_IP`, `HOTSPOT_GATEWAY_IP`, …
3. Doğrula:

```bat
node scripts\validate-site-env.js
```

Detay: [`deploy/KURULUM.md`](deploy/KURULUM.md) · Son durum: [`deploy/SON-KONTROL.md`](deploy/SON-KONTROL.md)

## Hedef akış (v53)

1. Numara + WhatsApp → hemen ~5 dk internet  
2. WA link aynı numara + kimlik → 24s  
3. Doğrulama yok → ~5 dk sert kesim (`kick:true`)

## Referans (eski lab — zorunlu değil)

| Parça | Eski değer |
|-------|------------|
| Web | 3040 |
| API | 3041 |
| Server | 172.16.25.200 |
| MikroTik | 172.16.25.252 |
| Hotspot GW | 172.16.25.2 |
| SSID | emr-cisco |
| Tenant | venus-termal |
