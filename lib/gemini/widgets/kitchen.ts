export const kitchenPrompts: Record<string, string> = {
  modern: `
Transform this kitchen to show a modern style renovation.

STRICT PRESERVATION REQUIREMENTS:
- Room dimensions and layout must remain EXACTLY identical
- Window positions and sizes must remain EXACTLY identical
- Door positions must remain EXACTLY identical
- Ceiling height and structure must remain EXACTLY identical
- Floor plan and traffic flow must remain EXACTLY identical
- Perspective and photo angle must remain EXACTLY identical
- Lighting conditions must match the original

ONLY CHANGE:
- Cabinets: flat-panel or slab doors, handleless or minimal bar pulls, white/gray/navy colors
- Countertops: quartz or solid surface in white/gray tones
- Backsplash: large format tiles or seamless material
- Appliances: stainless steel, integrated/panel-ready where possible
- Hardware: minimal, modern pulls or push-to-open
- Lighting: recessed lights, linear pendants over island
- Clean, uncluttered surfaces

The result must be photorealistic and look like an actual kitchen renovation photo.
`,

  traditional: `
Transform this kitchen to show a traditional style renovation.

STRICT PRESERVATION REQUIREMENTS:
- Room dimensions and layout must remain EXACTLY identical
- Window positions and sizes must remain EXACTLY identical
- Door positions must remain EXACTLY identical
- Ceiling height and structure must remain EXACTLY identical
- Floor plan and traffic flow must remain EXACTLY identical
- Perspective and photo angle must remain EXACTLY identical
- Lighting conditions must match the original

ONLY CHANGE:
- Cabinets: shaker-style doors with visible frames, warm white or cream color
- Countertops: granite or marble with natural veining
- Backsplash: subway tiles or classic patterns
- Appliances: stainless steel or panel-matched
- Hardware: classic cup pulls, knobs in brushed nickel or brass
- Lighting: traditional pendants, under-cabinet lighting
- Crown molding on cabinets

The result must be photorealistic and look like an actual kitchen renovation photo.
`,

  farmhouse: `
Transform this kitchen to show a farmhouse style renovation.

STRICT PRESERVATION REQUIREMENTS:
- Room dimensions and layout must remain EXACTLY identical
- Window positions and sizes must remain EXACTLY identical
- Door positions must remain EXACTLY identical
- Ceiling height and structure must remain EXACTLY identical
- Floor plan and traffic flow must remain EXACTLY identical
- Perspective and photo angle must remain EXACTLY identical
- Lighting conditions must match the original

ONLY CHANGE:
- Cabinets: shaker or beadboard style in white, some open shelving
- Countertops: butcher block or white marble
- Backsplash: white subway tiles with dark grout
- Sink: farmhouse apron-front sink
- Appliances: stainless steel or retro-styled
- Hardware: black iron or antique brass pulls
- Lighting: industrial pendants, lantern-style fixtures
- Add warmth: wood cutting boards, plants, glass jars

The result must be photorealistic and look like an actual kitchen renovation photo.
`,

  luxury: `
Transform this kitchen to show a luxury style renovation.

STRICT PRESERVATION REQUIREMENTS:
- Room dimensions and layout must remain EXACTLY identical
- Window positions and sizes must remain EXACTLY identical
- Door positions must remain EXACTLY identical
- Ceiling height and structure must remain EXACTLY identical
- Floor plan and traffic flow must remain EXACTLY identical
- Perspective and photo angle must remain EXACTLY identical
- Lighting conditions must match the original

ONLY CHANGE:
- Cabinets: dark wood or deep navy/black, floor-to-ceiling, custom look
- Countertops: thick marble slab with dramatic veining, waterfall edges
- Backsplash: full-height marble or statement tile
- Appliances: professional-grade, integrated panels, built-in coffee/wine
- Hardware: high-end brass or polished nickel, substantial size
- Lighting: designer statement pendants, layered lighting
- Add luxury touches: pot filler, double islands if space permits

The result must be photorealistic and look like an actual high-end kitchen renovation photo.
`
};

// Default prompt (for backwards compatibility)
export const kitchenRemodelPrompt = (style: string = 'modern') => kitchenPrompts[style] || kitchenPrompts.modern;
