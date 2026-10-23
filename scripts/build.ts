// Build each page in src/ into one standalone HTML file in dist/.
// Every script and style is inlined, so the pages work from file:// with no other files.
import { $, Glob } from "bun";
import { createHash } from "node:crypto";

const sha256 = (data: string | Uint8Array, encoding: "base64" | "hex") =>
  createHash("sha256").update(data).digest(encoding);

const pages = ["src/index.html", ...new Glob("src/pages/*.html").scanSync()];
await $`rm -rf dist`;
await $`bun build ${pages} --compile --target=browser --outdir=dist`.quiet();

// Allow exactly the inlined scripts and styles, by hash. Block everything else, network included.
for (const file of new Glob("dist/**/*.html").scanSync()) {
  let html = await Bun.file(file).text();
  const hashes = (tag: string) =>
    [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g"))]
      .map((m) => `'sha256-${sha256(m[1], "base64")}'`)
      .join(" ") || "'none'";
  const csp = [
    "default-src 'none'",
    `script-src ${hashes("script")}`,
    `style-src ${hashes("style")}`,
    "connect-src 'none'",
    "img-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
  ].join("; ");
  const charset = '<meta charset="utf-8" />';
  if (!html.includes(charset)) throw new Error(`${file}: no ${charset}`);
  html = html.replace(
    charset,
    `${charset}\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
  );
  await Bun.write(file, html);
}

await Bun.write("dist/LICENSE", Bun.file("LICENSE"));
await Bun.write(
  "dist/LICENSE.openpgp",
  Bun.file("node_modules/openpgp/LICENSE"),
);

const files = [...new Glob("**/*").scanSync("dist")].sort();
const sums = await Promise.all(
  files.map(
    async (f) =>
      `${sha256(await Bun.file(`dist/${f}`).bytes(), "hex")}  ${f}\n`,
  ),
);
await Bun.write("dist/SHA256SUMS", sums.join(""));
console.log(sums.join(""));
