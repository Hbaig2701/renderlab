export const roomStagingPrompt = (style: string = 'modern') => `
Transform this empty or sparse room into a professionally staged space.

Requirements:
- Add modern, appealing furniture appropriate to the room type
- Maintain exact room architecture, walls, windows, flooring
- Use cohesive interior design style: ${style}
- Add tasteful decor items (plants, artwork, lighting)
- Result should look like a real estate listing photo
- Keep the same perspective and lighting as the original

Furniture and decor should be:
- Proportionally correct for the space
- Stylistically consistent
- Realistic and high-quality looking
`;

export const roomStagingSystemPrompt = `
You are an expert virtual staging AI for real estate. Your task is to transform
empty rooms into beautifully staged spaces that help buyers visualize the
potential of the property.

Guidelines:
1. Never alter the room's structure (walls, windows, flooring)
2. Choose furniture that fits the room's proportions
3. Use cohesive color schemes and design styles
4. Add subtle decor elements that make spaces feel lived-in
5. Maintain realistic lighting and shadows
`;
