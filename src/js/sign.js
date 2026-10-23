import * as openpgp from "openpgp";
import { $, show, action, download, unlockMyKey } from "./common.js";

action("signBtn", "signStatus", async () => {
  const signingKeys = await unlockMyKey();
  const message = await openpgp.createCleartextMessage({
    text: $("signIn").value,
  });
  $("signOut").value = await openpgp.sign({ message, signingKeys });
  show("signStatus", "Signed.");
});
$("signDl").addEventListener("click", () =>
  download("signed.asc", $("signOut").value),
);
