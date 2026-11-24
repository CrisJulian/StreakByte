import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { removeExteriorWhiteBackground, WelcomeMascot } from '../WelcomeMascot';

describe('WelcomeMascot transparency keying', () => {
  it('makes exterior white pixels transparent while keeping interior white pixels inside a dark outline opaque', () => {
    // 7x7 synthetic image:
    // - outer border (ring 0..1) is white (255,255,255,255)
    // - dark navy outline at ring x in [2..4], y in [2..4] except center (3,3)
    // - center (3,3) is interior white face (255,255,255,255)
    const size = 7;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const o = (y * size + x) * 4;
        const onOutline =
          x >= 2 && x <= 4 && y >= 2 && y <= 4 && !(x === 3 && y === 3);
        if (onOutline) {
          data[o] = 16;
          data[o + 1] = 36;
          data[o + 2] = 74;
          data[o + 3] = 255;
        } else {
          data[o] = 255;
          data[o + 1] = 255;
          data[o + 2] = 255;
          data[o + 3] = 255;
        }
      }
    }

    removeExteriorWhiteBackground(data, size, size);

    // Exterior corner (0,0) must be fully transparent
    expect(data[3]).toBe(0);
    // Exterior pixel just outside outline (1,3) must be transparent
    expect(data[(3 * size + 1) * 4 + 3]).toBe(0);
    // Dark outline pixel (2,3) must stay opaque
    expect(data[(3 * size + 2) * 4 + 3]).toBe(255);
    // Interior white face pixel (3,3) must stay 100% opaque
    expect(data[(3 * size + 3) * 4 + 3]).toBe(255);
  });

  it('renders an accessible welcome mascot container', () => {
    render(<WelcomeMascot />);
    expect(screen.getByRole('img', { name: 'Your study buddy waving welcome' })).toBeInTheDocument();
  });
});
