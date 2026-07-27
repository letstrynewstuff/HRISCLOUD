import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

const F = "src/pages/Payslips.jsx";
copyFileSync(F, "/tmp/payslips.bak");
const base = readFileSync(F, "utf8");

const MUTANTS = {
  C1: ['const _m = { c: "#123456" };', "off-token hex"],
  C2: ['const _m = { c: "#06B6D4" };', "retired cyan"],
  C3: ['const _m = { b: "linear-gradient(135deg,#4F46E5,#4F46E5)" };', "collapsed gradient"],
  C4: ['const _m = { b: "linear-gradient(135deg,#4F46E5,#4F46E8)" };', "near-flat gradient"],
  C5: ['const _m = { boxShadow: "0 4px 16px rgba(79,70,229,0.4)" };', "coloured shadow"],
  T1: ['const _m = { fontFamily: "Sora,sans-serif" };', "retired typeface"],
  T2: ['const _m = <h2 className="text-lg font-bold">x</h2>;', "bold heading utility"],
  T3: ['const _m = <h1 style={{ fontWeight: 800 }}>x</h1>;', "inline heavy heading"],
  S1: ['const _m = <button className="rounded-xl">x</button>;', "non-pill button (class)"],
  S1b: ['const _m = <button style={{ borderRadius: 12 }}>x</button>;', "non-pill button (inline)"],
  I5: ['const _m = C.doesNotExist;', "undefined token key"],
  E1: ['const _m = "All done \u{1F389}";', "emoji in shipped code"],
  E2: ['const _cfg = { icon: Users }; const _m = <p>{_cfg.icon}</p>;', "component as text child"],
  E3: ['const _cfg = { icon: NotARealIconName };', "unresolved icon component"],
  C3b: ['const _m = { b: "linear-gradient(135deg,#4F46E5 0%,#4F46E5 50%,#312E81 100%)" };', "adjacent duplicate stop"],
  E5: [
    'const _nav = [\n' +
    '  { label: "Alpha", icon: Clock, path: "/a" },\n' +
    '  { label: "Beta", icon: Clock, path: "/b" },\n' +
    '  { label: "Gamma", icon: Users, path: "/c" },\n' +
    '];',
    "duplicate nav icon",
  ],
};

// Checks that mutate a file's structure rather than inject a line
const STRUCTURAL = {
  I2: [(src) => src.replace(/^import C from [^\n]+\n/m, ""), "missing C import"],
  I3: [(src) => src.replace(/^(import C from [^\n]+\n)/m, '$1import C from "../styles/colors";\n'), "duplicate C declaration"],
  I4: [(src) => 'const C = { primary: "#4F46E5" };\n' + src, "local shadow palette"],
};

let caught = 0;
for (const [id, [code, label]] of Object.entries(MUTANTS)) {
  writeFileSync(F, base.replace("export default", `${code}\nexport default`, 1));
  let out = "";
  try { execSync("node scripts/brand-audit.mjs --json", { encoding: "utf8" }); }
  catch (e) { out = e.stdout ?? ""; }
  const failed = out ? JSON.parse(out).results.filter(r => r.status !== "PASS").map(r => r.id) : [];
  const hit = failed.includes(id.replace(/[a-z]$/, ""));
  if (hit) caught++;
  console.log(`  ${hit ? "DETECTED" : "MISSED  "}  ${id}  ${label}`);
}
for (const [id, [mutate, label]] of Object.entries(STRUCTURAL)) {
  writeFileSync(F, mutate(base));
  let out = "";
  try { execSync("node scripts/brand-audit.mjs --json", { encoding: "utf8" }); }
  catch (e) { out = e.stdout ?? ""; }
  const failed = out ? JSON.parse(out).results.filter(r => r.status !== "PASS").map(r => r.id) : [];
  const hit = failed.includes(id.replace(/[a-z]$/, ""));
  if (hit) caught++;
  console.log(`  ${hit ? "DETECTED" : "MISSED  "}  ${id}  ${label}`);
}

copyFileSync("/tmp/payslips.bak", F);
const total = Object.keys(MUTANTS).length + Object.keys(STRUCTURAL).length;
console.log(`\n  ${caught}/${total} mutants detected`);
process.exit(caught === total ? 0 : 1);
