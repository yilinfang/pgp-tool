import * as openpgp from "openpgp";
import {
  $,
  show,
  action,
  verificationKeys,
  describeSignatures,
} from "./common.js";

action("verBtn", "verStatus", async () => {
  $("verOut").value = "";
  const text = $("verIn").value.trim();
  const keys = await verificationKeys();
  const message = text.includes("-----BEGIN PGP SIGNED MESSAGE-----")
    ? await openpgp.readCleartextMessage({ cleartextMessage: text })
    : await openpgp.readMessage({ armoredMessage: text });
  const { data, signatures } = await openpgp.verify({
    message,
    verificationKeys: keys,
  });
  $("verOut").value = data;
  show("verStatus", await describeSignatures(signatures, keys));
});
