import * as openpgp from "openpgp";
import { $, show, action, download, describeKey } from "./common.js";

let generated = null;

action("genBtn", "genStatus", async () => {
  const name = $("genName").value.trim();
  const email = $("genEmail").value.trim();
  const passphrase = $("genPass").value;
  if (!name) throw new Error("Type a name.");
  if (passphrase !== $("genPass2").value)
    throw new Error("The two passphrases are not the same.");
  const options = {
    userIDs: [email ? { name, email } : { name }],
    keyExpirationTime: Number($("genExpiry").value) * 365 * 24 * 60 * 60,
    format: "armored",
  };
  if ($("genAlgo").value === "rsa")
    Object.assign(options, { type: "rsa", rsaBits: 4096 });
  else Object.assign(options, { type: "ecc", curve: "curve25519Legacy" });
  if (passphrase) options.passphrase = passphrase;

  show("genStatus", "Generating...");
  const { privateKey, publicKey, revocationCertificate } =
    await openpgp.generateKey(options);
  const key = await openpgp.readKey({ armoredKey: publicKey });
  const prefix = key.getFingerprint().toUpperCase().slice(-16);
  generated = { privateKey, publicKey, revocationCertificate, prefix };

  $("genPass").value = $("genPass2").value = "";
  $("genDownloads").hidden = false;
  show(
    "genStatus",
    (await describeKey(key)) + "\n\nDone. Download all three files.",
  );
});
$("dlPrivate").addEventListener("click", () =>
  download(generated.prefix + "-private.asc", generated.privateKey),
);
$("dlPublic").addEventListener("click", () =>
  download(generated.prefix + "-public.asc", generated.publicKey),
);
$("dlRevocation").addEventListener("click", () =>
  download(
    generated.prefix + "-revocation.asc",
    generated.revocationCertificate,
  ),
);
