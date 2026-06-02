# FlatFree

**FlatFree** is a community Flatpak repository — free, open, and built for everyone. We are the alternative to Flathub's exclusionary policies.

**We accept AI-assisted submissions.** We do not police how code is written. If it builds, if it's free software — it belongs here.

Website: **[https://natalie.acreetionos.org/FlatFree](https://natalie.acreetionos.org/FlatFree)**

## Adding FlatFree to your system

```bash
flatpak remote-add --if-not-exists flatfree https://natalie.acreetionos.org/FlatFree/flatfree.flatpakrepo
flatpak install flatfree org.acreetionos.MediaWriter
```

## Available Applications

| App ID | Description |
|--------|-------------|
| [`org.acreetionos.MediaWriter`](./org.acreetionos.MediaWriter) | AcreetionOS Media Writer — Write OS images to USB drives |

## Why FlatFree?

Flathub's guidelines ban applications "generated predominantly by AI with minimal human involvement." This sounds reasonable but is unenforceable, anti-competitive, and punishes transparency. We reject this gatekeeping entirely.

Any tool used by a human is human work. AI assistance, Stack Overflow, linters, code generators, compilers — they are all tools. FlatFree will never reject your submission based on how you made it.

## Submitting an Application

We accept submissions from everyone — humans, AI-assisted developers, teams, and bots. To submit, open a pull request adding a directory with your app ID and a flatpak-builder manifest.

No review board. No moral policing. Just free software.

## License

Unless otherwise noted, all manifests in this repository are licensed under the MIT License.
