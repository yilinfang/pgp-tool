import * as openpgp from "openpgp";
import {
  $,
  show,
  action,
  download,
  readMyKey,
  unlockMyKey,
  readOtherKeys,
} from "./common.js";

action("encBtn", "encStatus", async () => {
  const encryptionKeys = await readOtherKeys();
  const mine = await readMyKey();
  const options = {
    message: await openpgp.createMessage({ text: $("encIn").value }),
    encryptionKeys,
  };
  if (mine && $("encSelf").checked) encryptionKeys.push(mine.toPublic());
  if (mine && $("encSign").checked) options.signingKeys = await unlockMyKey();
  if (!encryptionKeys.length)
    throw new Error("Add at least one recipient public key.");
  $("encOut").value = await openpgp.encrypt(options);
  show(
    "encStatus",
    "Encrypted to " +
      encryptionKeys.length +
      " key(s)" +
      (options.signingKeys ? ", signed." : ", not signed."),
  );
});
$("encDl").addEventListener("click", () =>
  download("message.asc", $("encOut").value),
);
