// Landscaping Prompts - Fixed for accurate image editing
export const landscapingPrompts: Record<string, string> = {

  manicured: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Transform this yard to show a manicured lawn result.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The house - same structure, color, windows, doors, everything
- The driveway - same position, material, shape
- Property boundaries and fence positions
- The sky and weather conditions
- Neighboring properties if visible
- The overall image dimensions and aspect ratio

ONLY MODIFY THE LANDSCAPING:
- Lawn → lush, green, perfectly manicured grass
- Remove all debris, dead plants, weeds, clutter
- Edge beds and lawn borders crisply
- Existing trees and large shrubs → healthy, trimmed versions
- Garden beds → neat, mulched, well-maintained
- Driveway/walkways → clean and clear

CRITICAL: This must be recognizable as THE SAME PROPERTY from THE SAME ANGLE. The house and hardscape are identical - only the lawn and plants change. Someone who lives here must recognize their home.
`,

  garden: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Transform this yard to show a garden oasis result.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The house - same structure, color, windows, doors, everything
- The driveway - same position, material, shape
- Property boundaries and fence positions
- The sky and weather conditions
- Neighboring properties if visible
- The overall image dimensions and aspect ratio

ONLY MODIFY THE LANDSCAPING:
- Lawn → healthy green grass where appropriate
- Add flowering plants and colorful garden beds
- Add mature shrubs and ornamental plants
- Include variety: perennials, annuals, ornamental grasses
- Add garden paths if space allows
- Remove all debris, dead plants, weeds, clutter
- Create layered, abundant planting design

CRITICAL: This must be recognizable as THE SAME PROPERTY from THE SAME ANGLE. The house and hardscape are identical - only the landscaping changes. Someone who lives here must recognize their home.
`,

  // Alias for garden_oasis
  garden_oasis: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Transform this yard to show a garden oasis result.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The house - same structure, color, windows, doors, everything
- The driveway - same position, material, shape
- Property boundaries and fence positions
- The sky and weather conditions
- Neighboring properties if visible
- The overall image dimensions and aspect ratio

ONLY MODIFY THE LANDSCAPING:
- Lawn → healthy green grass where appropriate
- Add flowering plants and colorful garden beds
- Add mature shrubs and ornamental plants
- Include variety: perennials, annuals, ornamental grasses
- Add garden paths if space allows
- Remove all debris, dead plants, weeds, clutter
- Create layered, abundant planting design

CRITICAL: This must be recognizable as THE SAME PROPERTY from THE SAME ANGLE. The house and hardscape are identical - only the landscaping changes. Someone who lives here must recognize their home.
`,

  modern: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Transform this yard to show a modern minimal landscape result.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The house - same structure, color, windows, doors, everything
- The driveway - same position, material, shape
- Property boundaries and fence positions
- The sky and weather conditions
- Neighboring properties if visible
- The overall image dimensions and aspect ratio

ONLY MODIFY THE LANDSCAPING:
- Lawn → clean, minimal lawn area or artificial turf
- Add architectural plants: ornamental grasses, agaves, boxwood
- Include hardscape: gravel, pavers, concrete stepping stones
- Clean lines and geometric shapes
- Remove all clutter and debris
- Minimal but intentional plant selection
- Emphasis on structure and negative space

CRITICAL: This must be recognizable as THE SAME PROPERTY from THE SAME ANGLE. The house and hardscape are identical - only the landscaping changes. Someone who lives here must recognize their home.
`,

  // Alias for modern_minimal
  modern_minimal: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Transform this yard to show a modern minimal landscape result.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The house - same structure, color, windows, doors, everything
- The driveway - same position, material, shape
- Property boundaries and fence positions
- The sky and weather conditions
- Neighboring properties if visible
- The overall image dimensions and aspect ratio

ONLY MODIFY THE LANDSCAPING:
- Lawn → clean, minimal lawn area or artificial turf
- Add architectural plants: ornamental grasses, agaves, boxwood
- Include hardscape: gravel, pavers, concrete stepping stones
- Clean lines and geometric shapes
- Remove all clutter and debris
- Minimal but intentional plant selection
- Emphasis on structure and negative space

CRITICAL: This must be recognizable as THE SAME PROPERTY from THE SAME ANGLE. The house and hardscape are identical - only the landscaping changes. Someone who lives here must recognize their home.
`,

  outdoor_living: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Transform this yard to show an outdoor living space result.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The house - same structure, color, windows, doors, everything
- The driveway - same position, material, shape
- Property boundaries and fence positions
- The sky and weather conditions
- Neighboring properties if visible
- The overall image dimensions and aspect ratio

ONLY MODIFY THE LANDSCAPING:
- Lawn → healthy, maintained grass
- Add patio or deck area appropriate to space
- Include outdoor furniture: seating, dining area
- Add ambient elements: string lights, fire pit, planters
- Healthy plants framing the outdoor living space
- Remove all debris, dead plants, clutter
- Create inviting, livable outdoor space

CRITICAL: This must be recognizable as THE SAME PROPERTY from THE SAME ANGLE. The house is identical - only the yard and landscaping change. Someone who lives here must recognize their home.
`
};

// Default prompt (for backwards compatibility)
export const landscapingPrompt = landscapingPrompts.manicured;
