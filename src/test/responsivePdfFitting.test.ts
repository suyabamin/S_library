import { describe, it, expect } from 'vitest';

describe('Responsive Layout Math & Page Fitting Computations', () => {
  const computePageDimensions = (
    containerWidth: number,
    pageOriginalWidth: number,
    pageOriginalHeight: number,
    zoom: number
  ) => {
    const isMobile = containerWidth > 0 && containerWidth < 640;
    const baseTargetWidth = isMobile
      ? Math.max(containerWidth - 16, 260)
      : Math.min(Math.floor(pageOriginalWidth * zoom * 1.35), Math.max(containerWidth - 48, 400));

    const displayWidth = Math.min(baseTargetWidth, containerWidth > 0 ? containerWidth - 12 : 860);
    const aspectRatio = pageOriginalHeight / (pageOriginalWidth || 1);
    const displayHeight = Math.floor(displayWidth * aspectRatio);

    return { displayWidth, displayHeight, isMobile };
  };

  const testViewports = [
    { name: 'Small mobile (320px)', width: 320, height: 640 },
    { name: 'Standard mobile (375px)', width: 375, height: 812 },
    { name: 'Large mobile (430px)', width: 430, height: 932 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Small desktop (1024px)', width: 1024, height: 768 },
    { name: 'Standard desktop (1366px)', width: 1366, height: 768 },
    { name: 'Large desktop (1920px)', width: 1920, height: 1080 },
  ];

  const standardA4 = { width: 595.28, height: 841.89 }; // standard PDF points

  testViewports.forEach((vp) => {
    it(`fits standard portrait PDF cleanly within ${vp.name} without overflow`, () => {
      const { displayWidth, displayHeight } = computePageDimensions(
        vp.width,
        standardA4.width,
        standardA4.height,
        1.0
      );

      // Must strictly fit inside container width
      expect(displayWidth).toBeLessThan(vp.width);
      // Margin on mobile must leave at least 12px breathing room
      expect(displayWidth).toBeLessThanOrEqual(vp.width - 12);
      // Aspect ratio must be preserved within 1px rounding
      const expectedRatio = standardA4.height / standardA4.width;
      const actualRatio = displayHeight / displayWidth;
      expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.01);

      // On large desktop, must not over-expand to infinite width
      if (vp.width >= 1366) {
        expect(displayWidth).toBeLessThanOrEqual(1000);
      }
    });
  });
});
