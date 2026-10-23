#!/bin/sh
# Build each page in src/ into one standalone HTML file in dist/.
# Every script and style is inlined, so the pages work from file:// with no other files.
set -eu
cd "$(dirname "$0")/.."

rm -rf dist
bun build src/index.html src/pages/*.html --compile --target=browser --outdir=dist >/dev/null

# Allow exactly the inlined scripts and styles, by hash. Block everything else, network included.
for file in dist/*.html dist/pages/*.html; do
	perl -0777 -i -MDigest::SHA=sha256_base64 -pe '
    sub hashes {
      my $tag = shift;
      my @h = map { "\x27sha256-" . sha256_base64($_) . "=\x27" } /<$tag[^>]*>([\s\S]*?)<\/$tag>/g;
      @h ? join(" ", @h) : "\x27none\x27";
    }
    my $csp = join "; ",
      "default-src \x27none\x27",
      "script-src " . hashes("script"),
      "style-src " . hashes("style"),
      "connect-src \x27none\x27",
      "img-src \x27none\x27",
      "form-action \x27none\x27",
      "base-uri \x27none\x27";
    my $charset = q{<meta charset="utf-8" />};
    s/\Q$charset\E/$charset\n    <meta http-equiv="Content-Security-Policy" content="$csp" \/>/
      or die "$ARGV: no $charset\n";
  ' "$file"
done

cp LICENSE dist/LICENSE
cp node_modules/openpgp/LICENSE dist/LICENSE.openpgp

cd dist
sums=$(find . -type f | sed 's|^\./||' | LC_ALL=C sort | xargs shasum -a 256)
printf '%s\n' "$sums" | tee SHA256SUMS
