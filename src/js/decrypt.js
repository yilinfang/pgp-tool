import * as openpgp from "openpgp";
import {
  $,
  show,
  action,
  unlockMyKey,
  verificationKeys,
  describeSignatures,
} from "./common.js";

action("decBtn", "decStatus", async () => {
  $("decOut").value = "";
  const decryptionKeys = await unlockMyKey();
  const keys = await verificationKeys();
  const message = await openpgp.readMessage({
    armoredMessage: $("decIn").value.trim(),
  });
  const { data, signatures } = await openpgp.decrypt({
    message,
    decryptionKeys,
    verificationKeys: keys,
  });
  $("decOut").value = data;
  show(
    "decStatus",
    "Decrypted. " + (await describeSignatures(signatures, keys)),
  );
});
