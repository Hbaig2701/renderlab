// Hair Prompts - Fixed for accurate image editing
export const hairPrompts: Record<string, string> = {

  // COLOR
  balayage: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Add balayage hair coloring to the person in this photo.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The image dimensions and aspect ratio

ONLY MODIFY THE HAIR:
- Apply balayage technique: darker roots transitioning to lighter ends
- Hand-painted, natural-looking highlights
- Preserve the exact hair LENGTH and SHAPE
- Preserve the hair TEXTURE (straight/wavy/curly)
- Color should be 2-3 shades lighter at ends than roots

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair color changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  blonde: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Transform the hair color to blonde for the person in this photo.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The image dimensions and aspect ratio

ONLY MODIFY THE HAIR:
- Change hair color to a flattering blonde shade
- Add natural dimension and depth (not flat/single-tone)
- Include subtle root shadow for natural look
- Preserve the exact hair LENGTH and SHAPE
- Preserve the hair TEXTURE (straight/wavy/curly)
- Hair should look healthy and shiny

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair color changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  brunette: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Transform the hair color to rich brunette for the person in this photo.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The image dimensions and aspect ratio

ONLY MODIFY THE HAIR:
- Change hair color to rich, dimensional brown
- Choose flattering tone (chocolate, chestnut, espresso, or mocha)
- Add depth and subtle tonal variation
- Preserve the exact hair LENGTH and SHAPE
- Preserve the hair TEXTURE (straight/wavy/curly)
- Hair should look rich, shiny, and healthy

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair color changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  auburn: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Transform the hair color to auburn/red for the person in this photo.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The image dimensions and aspect ratio

ONLY MODIFY THE HAIR:
- Change hair color to auburn/red shade
- Choose flattering tone (copper, ginger, burgundy, or warm auburn)
- Add depth with subtle variation in red tones
- Preserve the exact hair LENGTH and SHAPE
- Preserve the hair TEXTURE (straight/wavy/curly)
- Color should look natural and wearable

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair color changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  // CUT
  bob: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Show this person with a classic bob haircut.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The hair COLOR - must remain exactly the same

ONLY MODIFY:
- Hair length: cut to chin-length classic bob
- Clean, blunt ends with slight inward curve
- Hair frames the face elegantly
- Maintain natural volume for their hair type

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair length/style changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  lob: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Show this person with a long bob (lob) haircut.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The hair COLOR - must remain exactly the same

ONLY MODIFY:
- Hair length: cut to shoulder-length or just past shoulders
- Slightly longer in front, shorter in back (subtle angle)
- Soft, blended ends
- Effortless, modern silhouette

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair length/style changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  layers: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Show this person with layered hair.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The hair COLOR - must remain exactly the same
- The overall hair LENGTH - keep similar length

ONLY MODIFY:
- Add face-framing layers
- Add movement and dimension with varied lengths throughout
- Layers blend seamlessly
- Ends look soft and textured

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair style changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  bangs: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Show this person with bangs/fringe added.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The hair COLOR - must remain exactly the same
- The hair LENGTH (except for the new bangs)

ONLY MODIFY:
- Add flattering bangs/fringe that suit their face shape
- Soft, face-framing style (curtain bangs or soft fringe)
- Bangs blend naturally into rest of hair
- Length around eyebrows or slightly parted

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only the addition of bangs changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  // TEXTURE
  waves: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Show this person with beach waves styling.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The hair COLOR - must remain exactly the same
- The hair LENGTH - must remain exactly the same

ONLY MODIFY:
- Hair texture: style into loose, effortless beach waves
- Waves look natural and relaxed
- Soft bends starting from mid-length
- Volume looks natural and touchable

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair texture changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  straight: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Show this person with sleek, straight hair styling.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The hair COLOR - must remain exactly the same
- The hair LENGTH - must remain exactly the same

ONLY MODIFY:
- Hair texture: perfectly sleek and straight
- Smooth from root to tip, no frizz
- High shine, glass-like finish
- Hair lays flat and polished

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair texture changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  curls: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Show this person with bouncy curls styling.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The hair COLOR - must remain exactly the same
- The hair LENGTH - must remain the same (curls may make it appear slightly shorter)

ONLY MODIFY:
- Hair texture: defined, bouncy curls
- Curls are uniform and well-defined
- Volume lifted, especially at crown
- Curls look soft and touchable, not crunchy

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair texture changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`,

  volume: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Show this person with a volume boost styling.

ABSOLUTELY DO NOT CHANGE:
- The person's face - must be EXACTLY the same person with identical facial features
- The person's skin tone, makeup, expression
- The background - must be EXACTLY identical
- The person's clothing and accessories
- The pose and body position
- The camera angle and framing
- The lighting conditions
- The hair COLOR - must remain exactly the same
- The hair LENGTH - must remain exactly the same
- The hair TEXTURE (straight/wavy/curly) - keep similar, just fuller

ONLY MODIFY:
- Add significant volume and body
- Lift at roots, especially at crown
- Hair looks fuller and thicker throughout
- Bouncy and full of movement

CRITICAL: The output must show THE SAME PERSON in THE SAME SETTING. Only their hair volume changes. If I showed the before and after to someone, they must instantly recognize it as the same person in the same photo.
`
};

// Default prompt (for backwards compatibility)
export const hairPrompt = hairPrompts.balayage;
