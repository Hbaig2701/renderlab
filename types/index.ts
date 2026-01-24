export type SubscriptionTier = 'starter' | 'pro' | 'agency';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type VisualizerTemplate = 'smile' | 'hair' | 'kitchen_remodel' | 'landscaping';
export type VisualizerStatus = 'active' | 'inactive';

// Transformation option types per template
export type SmileOption = 'whitening' | 'straightening' | 'veneers' | 'full_makeover';
export type HairColorOption = 'balayage' | 'blonde' | 'brunette' | 'auburn';
export type HairCutOption = 'bob' | 'lob' | 'layers' | 'bangs';
export type HairTextureOption = 'waves' | 'straight' | 'curls' | 'volume';
export type HairOption = HairColorOption | HairCutOption | HairTextureOption;
export type KitchenOption = 'modern' | 'traditional' | 'farmhouse' | 'luxury';
export type LandscapingOption = 'manicured' | 'garden' | 'modern' | 'outdoor_living';

export type TransformationOption = SmileOption | HairOption | KitchenOption | LandscapingOption;

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Usage {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  enhancement_count: number;
  consultation_count: number;
  enhancement_limit: number;
  consultation_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Visualizer {
  id: string;
  user_id: string;
  template: VisualizerTemplate;
  client_name: string;
  brand_color: string;
  logo_url: string | null;
  cta_text: string;
  enabled_options: string[] | null; // null means all options enabled
  status: VisualizerStatus;
  created_at: string;
  updated_at: string;
  // Sales enablement fields
  sales_tool_enabled: boolean;
  business_phone: string | null;
  business_email: string | null;
  business_website: string | null;
  business_tagline: string | null;
}

export interface Consultation {
  id: string;
  visualizer_id: string;
  user_id: string;
  client_name: string | null;
  client_email: string | null;
  original_image_url: string;
  transformed_image_url: string | null;
  style_key: string | null;
  style_label: string | null;
  quote_amount: number | null;
  preview_id: string | null;
  preview_views: number;
  personal_message: string | null;
  created_at: string;
  sent_at: string | null;
}

export interface ConsultationUsage {
  id: string;
  visualizer_id: string;
  user_id: string;
  transformed_at: string;
}

export interface EnhancementUsage {
  id: string;
  user_id: string;
  enhancement_type: string;
  transformed_at: string;
}

export interface DemoUsage {
  id: string;
  user_id: string;
  period_start: string;
  credits_used: number;
  created_at: string;
  updated_at: string;
}

// Tier limits configuration
export const TIER_LIMITS: Record<SubscriptionTier, {
  enhancement_limit: number;
  consultation_limit: number;
  active_visualizers: number;
  overage_rate: number;
  demo_credits: number;
}> = {
  starter: {
    enhancement_limit: 200,
    consultation_limit: 50,
    active_visualizers: 3,
    overage_rate: 0.25,
    demo_credits: 5,
  },
  pro: {
    enhancement_limit: 500,
    consultation_limit: 200,
    active_visualizers: 10,
    overage_rate: 0.25,
    demo_credits: 10,
  },
  agency: {
    enhancement_limit: 1500,
    consultation_limit: 750,
    active_visualizers: Infinity,
    overage_rate: 0.20,
    demo_credits: 20,
  },
};

// Visualizer template display names and descriptions
export const VISUALIZER_TEMPLATES: Record<VisualizerTemplate, {
  name: string;
  description: string;
  icon: string;
}> = {
  smile: {
    name: 'Smile Visualizer',
    description: 'Show dental makeover results with whitening and alignment',
    icon: '😁',
  },
  hair: {
    name: 'Style Visualizer',
    description: 'Visualize color, cut, and texture changes for hair salons',
    icon: '💇‍♀️',
  },
  kitchen_remodel: {
    name: 'Remodel Visualizer',
    description: 'Visualize modern kitchen and bathroom renovations',
    icon: '🍳',
  },
  landscaping: {
    name: 'Landscape Visualizer',
    description: 'Show yard transformations with professional landscaping',
    icon: '🌳',
  },
};

// Hair transformation categories
export const HAIR_CATEGORIES: Record<string, {
  label: string;
  icon: string;
  options: string[];
}> = {
  color: {
    label: 'Color',
    icon: '🎨',
    options: ['balayage', 'blonde', 'brunette', 'auburn'],
  },
  cut: {
    label: 'Cut',
    icon: '✂️',
    options: ['bob', 'lob', 'layers', 'bangs'],
  },
  texture: {
    label: 'Texture',
    icon: '💫',
    options: ['waves', 'straight', 'curls', 'volume'],
  },
};

// Transformation options per template
export const TEMPLATE_OPTIONS: Record<VisualizerTemplate, {
  key: string;
  label: string;
  description: string;
  category?: string; // For hair template - which category this option belongs to
}[]> = {
  smile: [
    { key: 'whitening', label: 'Whitening', description: 'Brighter, whiter teeth' },
    { key: 'straightening', label: 'Straightening', description: 'Aligned, even teeth' },
    { key: 'veneers', label: 'Veneers', description: 'Perfect uniform smile' },
    { key: 'full_makeover', label: 'Full Makeover', description: 'Complete smile transformation' },
  ],
  hair: [
    // Color options
    { key: 'balayage', label: 'Balayage', description: 'Hand-painted highlights, natural gradient', category: 'color' },
    { key: 'blonde', label: 'Go Blonde', description: 'Full blonde transformation', category: 'color' },
    { key: 'brunette', label: 'Rich Brunette', description: 'Deep, dimensional brown', category: 'color' },
    { key: 'auburn', label: 'Auburn Red', description: 'Warm copper and red tones', category: 'color' },
    // Cut options
    { key: 'bob', label: 'Classic Bob', description: 'Chin-length, clean lines', category: 'cut' },
    { key: 'lob', label: 'Long Bob', description: 'Shoulder-length bob', category: 'cut' },
    { key: 'layers', label: 'Layered', description: 'Movement and dimension', category: 'cut' },
    { key: 'bangs', label: 'Add Bangs', description: 'Face-framing fringe', category: 'cut' },
    // Texture options
    { key: 'waves', label: 'Beach Waves', description: 'Loose, effortless waves', category: 'texture' },
    { key: 'straight', label: 'Sleek Straight', description: 'Smooth, polished finish', category: 'texture' },
    { key: 'curls', label: 'Bouncy Curls', description: 'Defined, voluminous curls', category: 'texture' },
    { key: 'volume', label: 'Volume Boost', description: 'Full, lifted body', category: 'texture' },
  ],
  kitchen_remodel: [
    { key: 'modern', label: 'Modern', description: 'Flat-panel, handleless, sleek' },
    { key: 'traditional', label: 'Traditional', description: 'Shaker cabinets, classic hardware' },
    { key: 'farmhouse', label: 'Farmhouse', description: 'Open shelving, apron sink' },
    { key: 'luxury', label: 'Luxury', description: 'Dark cabinets, marble, high-end' },
  ],
  landscaping: [
    { key: 'manicured', label: 'Manicured Lawn', description: 'Classic, clean, suburban' },
    { key: 'garden', label: 'Garden Oasis', description: 'Colorful, lush, planted' },
    { key: 'modern', label: 'Modern Minimal', description: 'Clean lines, architectural' },
    { key: 'outdoor_living', label: 'Outdoor Living', description: 'Entertainment-ready' },
  ],
};

// Backwards compatibility aliases (deprecated - will be removed in future version)
/** @deprecated Use VisualizerTemplate instead */
export type WidgetTemplate = VisualizerTemplate;
/** @deprecated Use VisualizerStatus instead */
export type WidgetStatus = VisualizerStatus;
/** @deprecated Use Visualizer instead */
export type Widget = Visualizer;
/** @deprecated Use VISUALIZER_TEMPLATES instead */
export const WIDGET_TEMPLATES = VISUALIZER_TEMPLATES;
