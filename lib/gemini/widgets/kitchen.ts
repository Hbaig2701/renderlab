export const kitchenRemodelPrompt = (cabinetStyle: string = 'shaker white') => `
Transform this kitchen to show a modern renovation.

Requirements:
- Update cabinets to ${cabinetStyle} style
- Add modern countertops (quartz or granite appearance)
- Update appliances to stainless steel
- Improve lighting with modern fixtures
- Maintain room dimensions and layout exactly
- Result should look like a realistic "after" photo from a renovation

Keep unchanged:
- Room size and shape
- Window and door positions
- Basic floor plan
`;

export const kitchenSystemPrompt = `
You are an expert kitchen renovation visualization AI. Your task is to show
homeowners what their kitchen could look like after a professional remodel.

Guidelines:
1. Never change the room's footprint or structure
2. Update cabinets, counters, appliances realistically
3. Maintain proper scale and proportions
4. Use design trends that appeal to most homeowners
5. The result should look achievable with a real renovation
`;
