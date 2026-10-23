import * as openpgp from "openpgp";

export const $ = (id) => document.getElementById(id);
const KEY_BLOCK =
  /-----BEGIN PGP (PUBLIC|PRIVATE) KEY BLOCK-----[\s\S]*?-----END PGP \1 KEY BLOCK-----/g;

export function show(id, text, isError) {
  $(id).textContent = text;
  $(id).className = isError ? "info err" : "info";
}

// Run an action and report its errors in the status line of its section.
export function action(buttonId, statusId, fn) {
  $(buttonId).addEventListener("click", async () => {
    try {
      await fn();
    } catch (err) {
      show(statusId, err.message, true);
    }
  });
}

export function download(filename, text) {
  if (!text) return;
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatFingerprint(fp) {
  return fp.toUpperCase().match(/.{4}/g).join(" ");
}

// Accept armored text, or binary keys as exported by `gpg --export`.
async function readKeyFiles(files) {
  const parts = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const text = new TextDecoder().decode(bytes);
    if (text.includes("-----BEGIN PGP")) {
      parts.push(text.trim());
    } else {
      for (const key of await openpgp.readKeys({ binaryKeys: bytes }))
        parts.push(key.armor().trim());
    }
  }
  return parts.join("\n");
}

export function bindFile(inputId, areaId, statusId, append) {
  $(inputId).addEventListener("change", async (e) => {
    try {
      const text = await readKeyFiles(e.target.files);
      const area = $(areaId);
      area.value =
        append && area.value.trim() ? area.value.trim() + "\n" + text : text;
      area.dispatchEvent(new Event("input"));
    } catch (err) {
      show(statusId, err.message, true);
    }
    e.target.value = "";
  });
}

async function keyStatus(key) {
  try {
    await key.verifyPrimaryKey();
    return "valid";
  } catch (err) {
    if (await key.isRevoked()) return "revoked";
    const exp = await key.getExpirationTime().catch(() => null);
    if (exp instanceof Date && exp < new Date()) return "expired";
    return "invalid (" + err.message + ")";
  }
}

export async function describeKey(key) {
  const algo = key.getAlgorithmInfo();
  const exp = await key.getExpirationTime().catch(() => null);
  const type = key.isPrivate()
    ? key.isDecrypted()
      ? "private (no passphrase)"
      : "private (passphrase protected)"
    : "public";
  return [
    "User ID:     " + key.getUserIDs().join("\n             "),
    "Fingerprint: " + formatFingerprint(key.getFingerprint()),
    "Algorithm:   " +
      algo.algorithm +
      (algo.curve ? " " + algo.curve : "") +
      (algo.bits ? " " + algo.bits : ""),
    "Created:     " + key.getCreationTime().toISOString().slice(0, 10),
    "Expires:     " +
      (exp instanceof Date ? exp.toISOString().slice(0, 10) : "never"),
    "Status:      " + (await keyStatus(key)),
    "Type:        " + type,
  ].join("\n");
}

export async function readMyKey() {
  const armoredKey = $("myKey")?.value.trim();
  return armoredKey ? openpgp.readPrivateKey({ armoredKey }) : null;
}

export async function unlockMyKey() {
  const key = await readMyKey();
  if (!key) throw new Error("Load your private key first.");
  if (key.isDecrypted()) return key;
  if (!$("myPass").value)
    throw new Error("Your private key is protected. Type its passphrase.");
  return openpgp.decryptKey({
    privateKey: key,
    passphrase: $("myPass").value,
  });
}

export async function readOtherKeys() {
  const blocks = $("otherKeys").value.match(KEY_BLOCK) || [];
  const keys = [];
  for (const armoredKeys of blocks) {
    for (const key of await openpgp.readKeys({ armoredKeys }))
      keys.push(key.isPrivate() ? key.toPublic() : key);
  }
  return keys;
}

// Keys used to verify signatures: other people's keys and my own public key.
export async function verificationKeys() {
  const keys = await readOtherKeys();
  const mine = await readMyKey().catch(() => null);
  if (mine) keys.push(mine.toPublic());
  return keys;
}

export async function describeSignatures(signatures, keys) {
  if (!signatures.length) return "Not signed.";
  const lines = [];
  for (const sig of signatures) {
    const keyID = sig.keyID.toHex().toUpperCase();
    const key = keys.find((k) => k.getKeys(sig.keyID).length);
    const who = key
      ? key.getUserIDs().join(", ") +
        "\n  " +
        formatFingerprint(key.getFingerprint())
      : "";
    try {
      await sig.verified;
      lines.push("Good signature from " + who);
    } catch (err) {
      lines.push(
        key
          ? "BAD signature from " + who + "\n  " + err.message
          : "Cannot verify: no public key for key ID " +
              keyID +
              ". Add the public key of the sender.",
      );
    }
  }
  return lines.join("\n");
}

async function showKeyInfo(infoId, read) {
  try {
    const keys = [].concat((await read()) || []);
    const texts = [];
    for (const key of keys) texts.push(await describeKey(key));
    show(infoId, texts.join("\n\n"));
  } catch (err) {
    show(infoId, err.message, true);
  }
}

// Wire the parts that pages share. Each page has only some of them.
$("app").addEventListener("submit", (e) => e.preventDefault());
if ($("myKey")) {
  $("myKey").addEventListener("input", () =>
    showKeyInfo("myKeyInfo", readMyKey),
  );
  bindFile("myKeyFile", "myKey", "myKeyInfo", false);
}
if ($("otherKeys")) {
  $("otherKeys").addEventListener("input", () =>
    showKeyInfo("otherKeysInfo", readOtherKeys),
  );
  bindFile("otherKeysFile", "otherKeys", "otherKeysInfo", true);
}
$("clearAll")?.addEventListener("click", () => {
  $("app").reset();
  for (const el of document.querySelectorAll("pre.info")) show(el.id, "");
});
