// Site settings. This is the only file you need to edit.
window.ZIPPER_SITE = {
  // Every download button links straight to this DMG. For a new release, update these four lines.
  // (index.html holds the same values as a fallback for visitors without JavaScript.)
  download: {
    url: "https://github.com/erfanj/Zipper/releases/download/v1.0.0/Zipper-1.0.0.dmg",
    checksumUrl: "https://github.com/erfanj/Zipper/releases/download/v1.0.0/Zipper-1.0.0.dmg.sha256",
    version: "1.0.0",
    size: "14.5 MB",
  },

  // Set to true once releases are signed and notarized with your Developer ID. While it's false,
  // the install steps explain macOS's "Open Anyway" step for unsigned apps.
  notarized: false,

  // Shown next to the download button.
  requirements: "macOS 14 Sonoma or later",
};
