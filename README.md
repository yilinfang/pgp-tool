# PGP Tool

A static, offline OpenPGP tool for Chrome. No installation, no server, no GnuPG.

Get `pgp-tool.zip` from a release and unzip it. Open `index.html` (double-click), or open the
page for your task directly in `pages/`. Each page is one standalone file.

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
- The Content-Security-Policy allows only the page's own script and style, by their SHA-256 hashes.
  The browser does not run any other script.
- The page stores nothing: no cookies, no localStorage, no sessionStorage, no IndexedDB.
- The page never reads or writes the clipboard.
- Keys live in page memory only. Close or reload the tab to forget them.
- Each page is separate. When you go to another page, the page forgets all keys.

The page cannot protect you from malware or browser extensions on the same computer.

## Verify your copy

If you got this tool from a website, a compromised server can serve modified code that steals keys.
A copy on your own disk is the safest.

The release has a `SHA256SUMS` file. Compare it with the checksums in the release notes, then run:

```sh
shasum -a 256 -c SHA256SUMS
```

The build is reproducible. To check a release, build it from source (see below) with the same Bun
version, and compare `dist/SHA256SUMS` with the `SHA256SUMS` of the release.

## Build from source

You need [Bun](https://bun.sh) (the version in `packageManager` in `package.json`).

```sh
bun install          # install OpenPGP.js and Prettier
bun run build        # build the pages into dist/
bun run release      # build, then make pgp-tool.zip
bun run format       # format the source with Prettier
```

```
src/index.html      start page
src/pages/          one page for each task
src/js/             one script for each page, and common.js
src/css/            common.css
scripts/build.ts    the build script
```

The build puts all JavaScript and CSS into each page, and adds the Content-Security-Policy.
OpenPGP.js comes from the npm package [`openpgp@6.3.2`](https://www.npmjs.com/package/openpgp/v/6.3.2).
`bun.lock` records its integrity hash, and `bun install` checks it.

## License

Copyright (C) 2026 Yilin Fang

This project is licensed under the GNU General Public License, version 3 or (at your option)
any later version (GPL-3.0-or-later).
See `LICENSE`.

OpenPGP.js is licensed under the LGPL-3.0. A release includes its license as `LICENSE.openpgp`.
