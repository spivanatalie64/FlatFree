# FlatFree

**FlatFree** is a community Flatpak repository — free, open, and built for everyone.

Inspired by [Flathub](https://flathub.org), FlatFree aims to provide an alternative space for distributing Flatpak applications with a focus on simplicity and accessibility.

## Adding FlatFree to your system

```bash
flatpak remote-add --if-not-exists flatfree https://flatfree.org/repo/flatfree.flatpakrepo
```

*(Repository hosting coming soon)*

## Available Applications

| App ID | Description |
|--------|-------------|
| [`org.acreetionos.MediaWriter`](./org.acreetionos.MediaWriter) | AcreetionOS Media Writer — Write OS images to USB drives |

## Contributing

To submit an app, open a pull request adding a directory with your app ID and a [flatpak-builder manifest](https://docs.flatpak.org/en/latest/flatpak-builder.html).

## License

Unless otherwise noted, all manifests in this repository are licensed under the MIT License.
