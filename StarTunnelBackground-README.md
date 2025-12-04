# StarTunnelBackground Component

A React component for Framer that creates a cosmic star tunnel animation with interactive cursor parallax effects.

## Features

- **Star Tunnel Animation**: 250-600 white stars moving outward from center (hyperspace effect)
- **Dark Theme**: Pure black (#000000) background with galaxy aesthetic
- **Interactive Parallax**: Cursor movement shifts the tunnel vanishing point
- **Noise/Grain Overlay**: Subtle organic texture layer (optional)
- **Performance Optimized**: Canvas-based rendering with requestAnimationFrame
- **Responsive**: Automatically adapts to container size
- **Mobile Friendly**: Disables interaction on touch devices

## Usage in Framer

1. Copy the `StarTunnelBackground.jsx` code into a new Code Component in Framer
2. Add the component to your frame
3. Place your hero content (logo, text) as children

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `speed` | number | 1.0 | Multiplier for star speed (0.1 - 3.0) |
| `density` | number | 300 | Number of stars (250 - 600) |
| `interactive` | boolean | true | Enable cursor parallax interaction |
| `noise` | boolean | true | Show noise/grain overlay |
| `children` | ReactNode | - | Content to display on top of background |

## Technical Details

- Uses HTML5 Canvas for star rendering
- Separate canvas for noise overlay
- Automatic cleanup on unmount
- Window resize handling
- Mobile detection for touch devices

## Styling

The component fills its parent container (`width: 100%`, `height: 100%`) and positions children with `z-index: 10` above the animation layers.

