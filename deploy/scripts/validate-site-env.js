#!/usr/bin/env node
/**
 * Otel saha site.env doğrulayıcı.
 * Portlar senin yazdığın değerler olmalı; boşsa hata verir.
 *
 * Kullanım:
 *   node deploy/scripts/validate-site-env.js
 *   node deploy/scripts/validate-site-env.js --final
 */
const fs = require("fs");
const path = require("path");

const finalMode = process.argv.includes("--final");
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, "site.env");
const examplePath = path.join(root, "site.env.example");

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function fail(msg) {
  console.error("FAIL:", msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log("OK  :", msg);
}

function warn(msg) {
  console.warn("WARN:", msg);
}

if (!fs.existsSync(examplePath)) {
  fail(`eksik şablon: ${examplePath}`);
  process.exit(1);
}

const env = parseEnv(envPath);
if (!env) {
  fail(`site.env yok. Önce: copy site.env.example site.env  (${envPath})`);
  console.error("Şablon hazır:", examplePath);
  process.exit(1);
}

const requiredAlways = [
  "TENANT_ID",
  "WEB_PORT",
  "API_PORT",
  "EMR_SERVER_IP",
  "MIKROTIK_IP",
  "HOTSPOT_GATEWAY_IP",
  "SSID",
  "RADIUS_HOST",
  "RADIUS_AUTH_PORT",
  "PENDING_OTP_SECONDS",
  "PENDING_OTP_REVOKE_KICK",
];

for (const key of requiredAlways) {
  if (!env[key] || !String(env[key]).trim()) {
    fail(`${key} boş — kurarken doldur (portlar SEN yaz)`);
  } else {
    ok(`${key}=${env[key]}`);
  }
}

function assertPort(name) {
  const n = Number(env[name]);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    fail(`${name} geçerli port değil: "${env[name]}"`);
  }
}

if (env.WEB_PORT) assertPort("WEB_PORT");
if (env.API_PORT) assertPort("API_PORT");

if (env.WEB_PORT && env.API_PORT && env.WEB_PORT === env.API_PORT) {
  fail("WEB_PORT ve API_PORT aynı olamaz");
}

const ipKeys = ["EMR_SERVER_IP", "MIKROTIK_IP", "HOTSPOT_GATEWAY_IP"];
const ipRe = /^(?:\d{1,3}\.){3}\d{1,3}$/;
for (const key of ipKeys) {
  if (env[key] && !ipRe.test(env[key])) {
    fail(`${key} IP formatı değil: "${env[key]}"`);
  }
}

if (String(env.PENDING_OTP_REVOKE_KICK).toLowerCase() !== "true") {
  fail("PENDING_OTP_REVOKE_KICK=true olmalı (sert kesim)");
}

if (String(env.RADIUS_ADD_MAC_COOKIE || "").toLowerCase() === "yes") {
  fail("RADIUS_ADD_MAC_COOKIE=yes yasak (eski sınırsız bug)");
}

if (env.PORTAL_LOGIN_BUILD && !String(env.PORTAL_LOGIN_BUILD).includes("v53")) {
  warn(`PORTAL_LOGIN_BUILD v53 değil: ${env.PORTAL_LOGIN_BUILD}`);
}

if (finalMode) {
  const flags = [
    "CHECK_RADIUS_UDP_1812",
    "CHECK_ANDROID_PENDING_OTP_TIMED",
    "CHECK_REVOKE_KICK_TRUE",
    "CHECK_NO_MAC_COOKIE_BYPASS",
    "CHECK_IPHONE_WHATSAPP_LINK_JSON",
    "CHECK_LOGIN_HTML_V53",
  ];
  for (const f of flags) {
    if (String(env[f] || "").toLowerCase() !== "true") {
      fail(`--final: ${f}=true olmalı (test bitince işaretle)`);
    } else {
      ok(`final ${f}`);
    }
  }
}

if (process.exitCode) {
  console.error("\nKurulum formu eksik. deploy/KURULUM.md bak.");
  process.exit(process.exitCode);
}

console.log(
  finalMode
    ? "\nHAZIR — son kontroller tamam. Canlıya geçilebilir."
    : "\nHAZIR — site.env dolu. Servisleri ayağa kaldırıp KURULUM.md testlerine geç."
);
