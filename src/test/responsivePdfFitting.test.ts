import { describe, it, expect } from 'vitest';

describe('Mobile PDF Full-Page Viewport & Responsive Fitting', () => {
  const computePageDimensions = (
    containerWidth: number,
    pageOriginalWidth: number,
    pageOriginalHeight: number,
    zoom: number
  ) => {
    const isMobile = containerWidth > 0 && containerWidth < 640;
    const availableContentWidth = containerWidth > 0
      ? (isMobile ? Math.max(containerWidth - 8, 200) : containerWidth - 48)
      : 360;

    const baseDesktopWidth = Math.min(
      Math.floor(pageOriginalWidth * zoom * 1.35),
      availableContentWidth,
      880
    );

    const displayWidth = isMobile
      ? availableContentWidth
      : Math.max(baseDesktopWidth, 320);

    const aspectRatio = pageOriginalHeight / (pageOriginalWidth || 1);
    const displayHeight = Math.floor(displayWidth * aspectRatio);

    return { displayWidth, displayHeight, isMobile, availableContentWidth };
  };

  const testViewports = [
    { name: 'Small phone (320px)', width: 320, height: 640 },
    { name: 'Standard phone (375px)', width: 375, height: 812 },
    { name: 'Large phone (430px)', width: 430, height: 932 },
    { name: 'Phone Landscape (640px)', width: 640, height: 360 },
    { name: 'Small tablet (768px)', width: 768, height: 1024 },
    { name: 'Desktop (1366px)', width: 1366, height: 768 },
    { name: 'Large desktop (1920px)', width: 1920, height: 1080 },
  ];

  const portraitDoc = { width: 595.28, height: 841.89 }; // standard portrait
  const landscapeDoc = { width: 841.89, height: 595.28 }; // standard landscape

  testViewports.forEach((vp) => {
    it(`fits portrait document fully into ${vp.name} with 100% visible horizontal width`, () => {
      const { displayWidth, displayHeight } = computePageDimensions(
        vp.width,
        portraitDoc.width,
        portraitDoc.height,
        1.0
      );

      // Must strictly fit within viewport width
      expect(displayWidth).toBeLessThan(vp.width);
      // On mobile, must leave exactly 8px breathing room (4px on each side)
      if (vp.width < 640) {
        expect(displayWidth).toBe(vp.width - 8);
      }
      // Aspect ratio strictly preserved
      const expectedRatio = portraitDoc.height / portraitDoc.width;
      const actualRatio = displayHeight / displayWidth;
      expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.01);
    });

    it(`fits landscape document cleanly into ${vp.name} without distortion`, () => {
      const { displayWidth, displayHeight } = computePageDimensions(
        vp.width,
        landscapeDoc.width,
        landscapeDoc.height,
        1.0
      );

      expect(displayWidth).toBeLessThan(vp.width);
      const expectedRatio = landscapeDoc.height / landscapeDoc.width;
      const actualRatio = displayHeight / displayWidth;
      expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.01);
    });
  });
});
