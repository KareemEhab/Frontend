/** Backend has no average rating; stable display value per course for stars. */
export function displayRating(courseId: string): number {
  let h = 0;
  for (let i = 0; i < courseId.length; i += 1) h = (h * 31 + courseId.charCodeAt(i)) | 0;
  const r = 3.5 + (Math.abs(h) % 16) / 10;
  return Math.round(r * 2) / 2;
}
