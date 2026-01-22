import { foodEnhancementPrompt } from './food';
import { productEnhancementPrompts } from './product';
import { stagingEnhancementPrompts } from './staging';

export { foodEnhancementPrompt } from './food';
export { productEnhancementPrompts } from './product';
export { stagingEnhancementPrompts } from './staging';

export type EnhancementCategory = 'food' | 'product' | 'staging';
export type ProductOption = 'white_studio' | 'lifestyle' | 'dramatic';
export type StagingOption = 'modern' | 'luxury' | 'scandinavian' | 'rustic';

export const enhancementPrompts = {
  food: foodEnhancementPrompt,
  product: productEnhancementPrompts,
  staging: stagingEnhancementPrompts,
};

export const enhancementCategories: Record<EnhancementCategory, {
  key: EnhancementCategory;
  label: string;
  description: string;
  icon: string;
  hasOptions: boolean;
  options?: { key: string; label: string }[];
}> = {
  food: {
    key: 'food',
    label: 'Restaurant & Food',
    description: 'Transform food photos into Instagram-ready images',
    icon: '🍔',
    hasOptions: false,
  },
  product: {
    key: 'product',
    label: 'Product Photography',
    description: 'Studio-quality product shots for e-commerce',
    icon: '📦',
    hasOptions: true,
    options: [
      { key: 'white_studio', label: 'White Studio' },
      { key: 'lifestyle', label: 'Lifestyle Context' },
      { key: 'dramatic', label: 'Dramatic Lighting' },
    ],
  },
  staging: {
    key: 'staging',
    label: 'Real Estate Staging',
    description: 'Virtual staging for property listings',
    icon: '🏠',
    hasOptions: true,
    options: [
      { key: 'modern', label: 'Modern' },
      { key: 'luxury', label: 'Luxury' },
      { key: 'scandinavian', label: 'Scandinavian' },
      { key: 'rustic', label: 'Rustic' },
    ],
  },
};
