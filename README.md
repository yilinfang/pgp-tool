# PGP Tool

A static, offline OpenPGP tool for Chrome. No installation, no server, no GnuPG.

Open `index.html` from disk (double-click). Keep `openpgp.min.js` in the same folder.

## What it does

- **Generate** an ECC Curve25519 or RSA 4096 key. Download the private key, the public key and the revocation certificate.
- **Encrypt** to one or more public keys, to your own key, and sign at the same time.
- **Decrypt** with your private key, and verify the signature in the same step.
- **Sign** a message as a cleartext signature.
- **Verify** cleartext and inline signed messages.
- **Revoke** a public key with its revocation certificate. Send the revoked public key to your contacts.

Output is compatible with GnuPG and other OpenPGP software (v4 keys).

## Privacy

- The page makes no network requests. A Content-Security-Policy blocks them.
- The page stores nothing: no cookies, no localStorage, no sessionStorage, no IndexedDB.
- The page never reads or writes the clipboard.
- Keys live in page memory only. Close the tab or press **Clear all** to forget them.

The page cannot protect you from malware or browser extensions on the same computer.

## Verify your copy

If you got this tool from a website, a compromised server can serve modified code that steals keys.
A copy on your own disk is the safest. Check it against these SHA-256 checksums:

```
e732645b557fcfd04e75bea1b8d23cecd5d7b07de55f8dc161a29b6441d9b9cf  index.html
e19bf4f04f34f24caded3ff3f3643099538b2674a0a94221e2faca75ac3e4aa1  openpgp.min.js
```

```sh
shasum -a 256 index.html openpgp.min.js
```

`openpgp.min.js` is the unmodified `dist/openpgp.min.js` from the npm package
[`openpgp@6.3.2`](https://www.npmjs.com/package/openpgp/v/6.3.2)
(package integrity `sha512-wcZTzHz41LV8Y48zH/JlD1JT8YdNmpWOuMAjQ/podvvCwsjBEU37K3znJh4UQcj3hksE5z9TzvhbUbwzsGvlLQ==`).

## License

OpenPGP.js is licensed under the LGPL-3.0. See `LICENSE.openpgp`.
