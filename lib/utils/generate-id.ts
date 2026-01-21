import { customAlphabet } from 'nanoid';

// Custom alphabet for widget IDs (alphanumeric, easy to read)
const nanoid = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz', 8);

export function generateWidgetId(): string {
  return `wgt_${nanoid()}`;
}
