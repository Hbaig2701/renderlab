export const smilePrompts: Record<string, string> = {
  whitening: `
Transform this photo to show a teeth whitening result.

STRICT PRESERVATION REQUIREMENTS:
- The person's face, skin, eyes, hair, and all facial features must remain EXACTLY identical
- Teeth shape, size, alignment, and position must remain EXACTLY the same
- Background must remain EXACTLY identical
- Lighting and photo quality must match the original
- Expression and lip position must remain EXACTLY the same

ONLY CHANGE:
- Teeth color: make them naturally whiter (not artificial bright white)
- Remove any visible staining or yellowing
- Result should look like a professional whitening treatment (2-3 shades brighter)

The result must be photorealistic and believable as a real before/after whitening photo.
`,

  straightening: `
Transform this photo to show teeth straightening/alignment results.

STRICT PRESERVATION REQUIREMENTS:
- The person's face, skin, eyes, hair, and all facial features must remain EXACTLY identical
- Teeth color must remain EXACTLY the same
- Background must remain EXACTLY identical
- Lighting and photo quality must match the original
- Expression and lip position must remain EXACTLY the same
- Overall mouth shape must remain natural to this person

ONLY CHANGE:
- Align teeth to be straighter and more even
- Close any visible gaps between teeth naturally
- Correct any overlapping or crooked teeth
- Result should look like post-orthodontic treatment (braces or Invisalign)

The result must be photorealistic and believable as a real orthodontic result photo.
`,

  veneers: `
Transform this photo to show a porcelain veneers result.

STRICT PRESERVATION REQUIREMENTS:
- The person's face, skin, eyes, hair, and all facial features must remain EXACTLY identical
- Background must remain EXACTLY identical
- Lighting and photo quality must match the original
- Expression and lip position must remain EXACTLY the same

ONLY CHANGE:
- Transform teeth to show uniform, symmetrical porcelain veneers
- Teeth should be bright white but not unnaturally so
- Teeth should have perfect alignment and consistent shape
- Teeth should have natural-looking texture (not flat or plastic)
- Result should look like high-quality dental veneers ("Hollywood smile")

The result must be photorealistic and believable as a real veneer transformation photo.
`,

  full_makeover: `
Transform this photo to show a complete smile makeover result.

STRICT PRESERVATION REQUIREMENTS:
- The person's face, skin, eyes, hair, and all facial features must remain EXACTLY identical
- Background must remain EXACTLY identical
- Lighting and photo quality must match the original
- Expression and lip position must remain EXACTLY the same

ONLY CHANGE:
- Whiten teeth to a bright, natural white
- Straighten and align all teeth
- Create uniform, symmetrical tooth shapes
- Close any gaps
- Result should look like comprehensive cosmetic dentistry

The result must be photorealistic and believable as a real smile makeover photo.
`
};

// Default prompt (for backwards compatibility)
export const smileTransformPrompt = smilePrompts.full_makeover;
