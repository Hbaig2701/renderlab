export const stagingEnhancementPrompts: Record<string, string> = {
  modern: `
Look at this room photo carefully. I need you to create a version where ONLY the furniture changes to modern style.

You MUST preserve EXACTLY:
- The exact room shape (including any slanted ceilings, angles)
- The exact wall colors and textures
- The exact window positions, sizes, and shapes
- The exact door positions
- The exact flooring
- Any artwork or frames on walls
- The exact camera angle and lighting

ONLY change the furniture style to modern. If there's a bed, make it a modern bed. If there's a sofa, make it a modern sofa. Do not add furniture that doesn't belong (no sofas in bedrooms).

This is like replacing furniture in a photo - the room itself must look identical.
`,

  luxury: `
Look at this room photo carefully. I need you to create a version where ONLY the furniture changes to luxury style.

You MUST preserve EXACTLY:
- The exact room shape (including any slanted ceilings, angles)
- The exact wall colors and textures
- The exact window positions, sizes, and shapes
- The exact door positions
- The exact flooring
- Any artwork or frames on walls
- The exact camera angle and lighting

ONLY change the furniture style to luxury. If there's a bed, make it a luxury upholstered bed with premium bedding. If there's a sofa, make it an elegant velvet sofa. Do not add furniture that doesn't belong (no sofas in bedrooms).

This is like replacing furniture in a photo - the room itself must look identical.
`,

  scandinavian: `
Look at this room photo carefully. I need you to create a version where ONLY the furniture changes to Scandinavian style.

You MUST preserve EXACTLY:
- The exact room shape (including any slanted ceilings, angles)
- The exact wall colors and textures
- The exact window positions, sizes, and shapes
- The exact door positions
- The exact flooring
- Any artwork or frames on walls
- The exact camera angle and lighting

ONLY change the furniture style to Scandinavian. If there's a bed, make it a light wood Scandinavian bed. If there's a sofa, make it a minimal Scandinavian sofa. Do not add furniture that doesn't belong (no sofas in bedrooms).

This is like replacing furniture in a photo - the room itself must look identical.
`,

  rustic: `
Look at this room photo carefully. I need you to create a version where ONLY the furniture changes to rustic style.

You MUST preserve EXACTLY:
- The exact room shape (including any slanted ceilings, angles)
- The exact wall colors and textures
- The exact window positions, sizes, and shapes
- The exact door positions
- The exact flooring
- Any artwork or frames on walls
- The exact camera angle and lighting

ONLY change the furniture style to rustic. If there's a bed, make it a solid wood rustic bed. If there's a sofa, make it a leather rustic sofa. Do not add furniture that doesn't belong (no sofas in bedrooms).

This is like replacing furniture in a photo - the room itself must look identical.
`
};
