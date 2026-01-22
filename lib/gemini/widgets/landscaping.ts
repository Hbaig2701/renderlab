export const landscapingPrompts: Record<string, string> = {
  manicured: `
Transform this yard to show a manicured lawn landscaping result.

STRICT PRESERVATION REQUIREMENTS:
- House structure must remain EXACTLY identical (siding, windows, doors, roof)
- Driveway must remain EXACTLY identical (position, material, shape)
- Property boundaries and dimensions must remain EXACTLY identical
- Any permanent hardscape (concrete paths, retaining walls) must remain EXACTLY identical
- Perspective and photo angle must remain EXACTLY identical
- Sky and lighting conditions must match the original
- Neighboring properties must remain unchanged

ONLY CHANGE:
- Lawn: lush, green, evenly cut grass throughout
- Edges: clean, defined borders between lawn and beds
- Foundation plantings: neat shrubs and bushes along house
- Trees: healthy, well-maintained if existing, or add appropriate shade trees
- Minimal flower beds with simple, organized plantings
- Clean, edged walkways
- Overall: tidy, well-maintained, classic suburban appearance

The result must be photorealistic and look like an actual landscaping project completion photo.
`,

  garden: `
Transform this yard to show a garden oasis landscaping result.

STRICT PRESERVATION REQUIREMENTS:
- House structure must remain EXACTLY identical (siding, windows, doors, roof)
- Driveway must remain EXACTLY identical (position, material, shape)
- Property boundaries and dimensions must remain EXACTLY identical
- Any permanent hardscape (concrete paths, retaining walls) must remain EXACTLY identical
- Perspective and photo angle must remain EXACTLY identical
- Sky and lighting conditions must match the original
- Neighboring properties must remain unchanged

ONLY CHANGE:
- Add layered garden beds with variety of plants at different heights
- Include colorful flowering plants (perennials, annuals)
- Add ornamental grasses and textural plants
- Include flowering shrubs and small ornamental trees
- Add garden paths (stepping stones, mulched paths)
- Include garden accents (birdbath, garden art, decorative stones)
- Lush, abundant, cottage-garden feel

The result must be photorealistic and look like an actual landscaping project completion photo.
`,

  modern: `
Transform this yard to show a modern minimal landscaping result.

STRICT PRESERVATION REQUIREMENTS:
- House structure must remain EXACTLY identical (siding, windows, doors, roof)
- Driveway must remain EXACTLY identical (position, material, shape)
- Property boundaries and dimensions must remain EXACTLY identical
- Any permanent hardscape (concrete paths, retaining walls) must remain EXACTLY identical
- Perspective and photo angle must remain EXACTLY identical
- Sky and lighting conditions must match the original
- Neighboring properties must remain unchanged

ONLY CHANGE:
- Clean geometric lawn shapes or artificial turf sections
- Gravel or decomposed granite areas with defined edges
- Architectural plants: ornamental grasses, agaves, sculptural shrubs
- Concrete or large format paver pathways
- Minimalist planting in neat rows or clusters
- Modern planters (corten steel, concrete)
- Landscape lighting (uplights, path lights)
- Overall: clean lines, intentional negative space, contemporary feel

The result must be photorealistic and look like an actual landscaping project completion photo.
`,

  outdoor_living: `
Transform this yard to show an outdoor living space landscaping result.

STRICT PRESERVATION REQUIREMENTS:
- House structure must remain EXACTLY identical (siding, windows, doors, roof)
- Driveway must remain EXACTLY identical (position, material, shape)
- Property boundaries and dimensions must remain EXACTLY identical
- Any permanent hardscape (concrete paths, retaining walls) must remain EXACTLY identical
- Perspective and photo angle must remain EXACTLY identical
- Sky and lighting conditions must match the original
- Neighboring properties must remain unchanged

ONLY CHANGE:
- Add patio or deck area with outdoor furniture (dining set, lounge seating)
- Include fire pit or outdoor fireplace if space allows
- Add string lights or landscape lighting
- Include outdoor kitchen elements or BBQ area if appropriate
- Privacy plantings (hedges, tall grasses) where needed
- Healthy lawn areas for open space
- Container plants and planters on patio
- Overall: entertainment-ready, livable outdoor extension of home

The result must be photorealistic and look like an actual landscaping project completion photo.
`
};

// Default prompt (for backwards compatibility)
export const landscapingPrompt = landscapingPrompts.manicured;
