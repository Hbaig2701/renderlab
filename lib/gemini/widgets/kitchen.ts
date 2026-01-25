// Kitchen Prompts - Fixed for accurate image editing
export const kitchenPrompts: Record<string, string> = {

  modern: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Remodel this kitchen to modern style.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The room dimensions and layout
- The position of windows and doors
- The floor plan and where walls are
- The ceiling height and shape
- The overall lighting direction
- The image dimensions and aspect ratio

ONLY REPLACE/MODIFY:
- Cabinets → modern flat-panel style in white, gray, or navy
- Countertops → quartz or solid surface in light color
- Backsplash → clean subway tile or simple modern tile
- Appliances → stainless steel, in their CURRENT POSITIONS
- Hardware → modern bar pulls or minimal handles
- Light fixtures → modern pendants if visible
- Remove clutter from counters for clean look

CRITICAL: This must be recognizable as THE SAME KITCHEN from THE SAME ANGLE. The layout is identical - only the finishes and style change. Someone familiar with this kitchen must recognize the space.
`,

  traditional: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Remodel this kitchen to traditional style.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The room dimensions and layout
- The position of windows and doors
- The floor plan and where walls are
- The ceiling height and shape
- The overall lighting direction
- The image dimensions and aspect ratio

ONLY REPLACE/MODIFY:
- Cabinets → traditional raised-panel style in warm white or wood tone
- Countertops → granite or marble with movement
- Backsplash → classic subway tile or decorative tile
- Appliances → panel-ready or stainless, in their CURRENT POSITIONS
- Hardware → traditional cup pulls and knobs
- Add crown molding to cabinets if appropriate
- Remove clutter from counters

CRITICAL: This must be recognizable as THE SAME KITCHEN from THE SAME ANGLE. The layout is identical - only the finishes and style change. Someone familiar with this kitchen must recognize the space.
`,

  farmhouse: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Remodel this kitchen to farmhouse style.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The room dimensions and layout
- The position of windows and doors
- The floor plan and where walls are
- The ceiling height and shape
- The overall lighting direction
- The image dimensions and aspect ratio

ONLY REPLACE/MODIFY:
- Cabinets → shaker style in white or soft sage/blue
- Countertops → butcher block or light quartz
- Backsplash → white subway tile or beadboard
- Appliances → white or stainless, in their CURRENT POSITIONS
- Hardware → black iron or antique brass
- Sink → farmhouse apron sink if sink is visible
- Add open shelving if appropriate
- Remove clutter, add minimal farmhouse decor

CRITICAL: This must be recognizable as THE SAME KITCHEN from THE SAME ANGLE. The layout is identical - only the finishes and style change. Someone familiar with this kitchen must recognize the space.
`,

  luxury: `
You are an IMAGE EDITOR. You must EDIT the provided photo, NOT generate a new image.

TASK: Remodel this kitchen to luxury style.

ABSOLUTELY DO NOT CHANGE:
- The camera angle and perspective - must be EXACTLY the same viewpoint
- The room dimensions and layout
- The position of windows and doors
- The floor plan and where walls are
- The ceiling height and shape
- The overall lighting direction
- The image dimensions and aspect ratio

ONLY REPLACE/MODIFY:
- Cabinets → high-end custom look in rich color (navy, emerald, or warm wood)
- Countertops → marble, quartzite, or premium stone with veining
- Backsplash → marble slab or high-end tile
- Appliances → professional-grade stainless or integrated panels, in their CURRENT POSITIONS
- Hardware → polished brass, gold, or premium nickel
- Fixtures → high-end faucet and lighting
- Remove all clutter, style with minimal luxury accessories

CRITICAL: This must be recognizable as THE SAME KITCHEN from THE SAME ANGLE. The layout is identical - only the finishes and style change. Someone familiar with this kitchen must recognize the space.
`
};

// Default prompt (for backwards compatibility)
export const kitchenRemodelPrompt = (style: string = 'modern') => kitchenPrompts[style] || kitchenPrompts.modern;
