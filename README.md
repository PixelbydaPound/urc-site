# URC - Underrated Art Creations

Minimal e-commerce website for Underrated Art Creations record label. A brutalist, modern design featuring music player controls and SoundCloud integration.

## Features

- **Minimal Brutalist Design** - Clean, bold aesthetic with brutalist button styling
- **E-commerce Shop** - Product categories: Records, Zines, Merchandise
- **SoundCloud Integration** - Pulls podcast episodes from SoundCloud playlist
- **Music Player** - Fixed bottom player with:
  - Playback controls (play, pause, previous, next)
  - Volume control with slider
  - Turntable-style pitch adjustment (-8 to +8)
  - BPM counter display
  - Progress bar
- **Responsive Layout** - Mobile-friendly design
- **Typography** - A. Monument Grotesk (headings) + Neue Haas Grotesk (body)

## Setup

1. Clone the repository
2. Open `index.html` in a browser or serve via a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Visit `http://localhost:8000`

## SoundCloud Configuration

The site pulls podcast episodes from:
- Playlist: `https://soundcloud.com/urcrecordsnash/sets/from-the-crate`

To change the playlist, update `SOUNDCLOUD_PLAYLIST_URL` in `script.js`.

## Customization

- **Products**: Update product data in `script.js` (`products` object)
- **Podcast Episodes**: Automatically pulled from SoundCloud playlist
- **Styling**: Modify colors and styles in `styles.css`
- **Fonts**: Add font files to `fonts/` directory (see `fonts/README.md`)

## File Structure

```
URC Site/
├── index.html          # Main HTML file
├── styles.css          # All styles
├── script.js           # JavaScript functionality
├── URCLogo.png         # Logo file
├── fonts/              # Font files directory
└── README.md           # This file
```

## Design Notes

- **Brutalist Style**: Bold borders, offset shadows, minimal color palette
- **Turntable Controls**: Pitch adjustment mimics turntable hardware
- **Typography**: Modern sans-serif fonts for brutalist aesthetic
- **Color Scheme**: Light beige background (#fafafa) with black accents

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Web Audio API for BPM detection (optional)

## License

© 2024 Underrated Art Creations

