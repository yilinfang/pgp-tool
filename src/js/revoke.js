import * as openpgp from "openpgp";
import { $, show, action, download, bindFile, describeKey } from "./common.js";

bindFile("revKeyFile", "revKey", "revStatus", false);
bindFile("revCertFile", "revCert", "revStatus", false);

action("revBtn", "revStatus", async () => {
  $("revOut").value = "";
  const key = await openpgp.readKey({
    armoredKey: $("revKey").value.trim(),
  });
  const { publicKey } = await openpgp.revokeKey({
    key: key.isPrivate() ? key.toPublic() : key,
    // GnuPG prefixes the certificates in openpgp-revocs.d/ with ':' to prevent accidental import.
    revocationCertificate: $("revCert")
      .value.trim()
      .replace(/^:-----BEGIN/m, "-----BEGIN"),
    format: "armored",
  });
  const revoked = await openpgp.readKey({ armoredKey: publicKey });
  if (!(await revoked.isRevoked()))
    throw new Error("The certificate does not revoke this key.");
  $("revOut").value = publicKey;
  show(
    "revStatus",
    (await describeKey(revoked)) +
      "\n\nSend this revoked public key to your contacts.",
  );
});
$("revDl").addEventListener("click", async () => {
  const key = await openpgp
    .readKey({ armoredKey: $("revOut").value })
    .catch(() => null);
  if (key)
    download(
      key.getFingerprint().toUpperCase().slice(-16) + "-public-revoked.asc",
      $("revOut").value,
    );
});
