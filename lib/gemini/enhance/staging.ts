export const stagingEnhancementPrompts: Record<string, string> = {
  modern: `
CRITICAL: First identify what type of room this is (bedroom, living room, dining room, kitchen, office, bathroom, etc.). The room type MUST NOT change.

You MUST preserve EXACTLY:
- THE ROOM TYPE - if it's a dining room, it stays a dining room. If it's a bedroom, it stays a bedroom. NEVER convert one room type to another.
- The exact room shape (including any slanted ceilings, angles)
- The exact wall colors and textures
- The exact window positions, sizes, and shapes
- The exact door positions
- The exact flooring
- Any artwork or frames on walls
- The exact camera angle and lighting

ONLY replace existing furniture with modern style furniture APPROPRIATE FOR THAT ROOM TYPE:
- Dining room: modern dining table and chairs
- Bedroom: modern bed and nightstands
- Living room: modern sofa and coffee table
- Office: modern desk and chair

NEVER add beds to dining rooms. NEVER add dining tables to bedrooms. Keep the same furniture FUNCTION, just change the STYLE to modern.
`,

  luxury: `
CRITICAL: First identify what type of room this is (bedroom, living room, dining room, kitchen, office, bathroom, etc.). The room type MUST NOT change.

You MUST preserve EXACTLY:
- THE ROOM TYPE - if it's a dining room, it stays a dining room. If it's a bedroom, it stays a bedroom. NEVER convert one room type to another.
- The exact room shape (including any slanted ceilings, angles)
- The exact wall colors and textures
- The exact window positions, sizes, and shapes
- The exact door positions
- The exact flooring
- Any artwork or frames on walls
- The exact camera angle and lighting

ONLY replace existing furniture with luxury style furniture APPROPRIATE FOR THAT ROOM TYPE:
- Dining room: elegant dining table with upholstered chairs
- Bedroom: luxury upholstered bed with premium bedding
- Living room: elegant velvet sofa and ornate coffee table
- Office: executive desk and leather chair

NEVER add beds to dining rooms. NEVER add dining tables to bedrooms. Keep the same furniture FUNCTION, just change the STYLE to luxury.
`,

  scandinavian: `
CRITICAL: First identify what type of room this is (bedroom, living room, dining room, kitchen, office, bathroom, etc.). The room type MUST NOT change.

You MUST preserve EXACTLY:
- THE ROOM TYPE - if it's a dining room, it stays a dining room. If it's a bedroom, it stays a bedroom. NEVER convert one room type to another.
- The exact room shape (including any slanted ceilings, angles)
- The exact wall colors and textures
- The exact window positions, sizes, and shapes
- The exact door positions
- The exact flooring
- Any artwork or frames on walls
- The exact camera angle and lighting

ONLY replace existing furniture with Scandinavian style furniture APPROPRIATE FOR THAT ROOM TYPE:
- Dining room: light wood dining table with minimal chairs
- Bedroom: light wood bed frame with clean lines
- Living room: minimal Scandinavian sofa in neutral tones
- Office: simple wood desk with ergonomic chair

NEVER add beds to dining rooms. NEVER add dining tables to bedrooms. Keep the same furniture FUNCTION, just change the STYLE to Scandinavian.
`,

  rustic: `
CRITICAL: First identify what type of room this is (bedroom, living room, dining room, kitchen, office, bathroom, etc.). The room type MUST NOT change.

You MUST preserve EXACTLY:
- THE ROOM TYPE - if it's a dining room, it stays a dining room. If it's a bedroom, it stays a bedroom. NEVER convert one room type to another.
- The exact room shape (including any slanted ceilings, angles)
- The exact wall colors and textures
- The exact window positions, sizes, and shapes
- The exact door positions
- The exact flooring
- Any artwork or frames on walls
- The exact camera angle and lighting

ONLY replace existing furniture with rustic style furniture APPROPRIATE FOR THAT ROOM TYPE:
- Dining room: farmhouse dining table with wooden chairs
- Bedroom: solid wood bed frame with rustic bedding
- Living room: leather sofa with reclaimed wood coffee table
- Office: rustic wood desk with vintage chair

NEVER add beds to dining rooms. NEVER add dining tables to bedrooms. Keep the same furniture FUNCTION, just change the STYLE to rustic.
`
};
