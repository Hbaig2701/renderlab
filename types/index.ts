export type SubscriptionTier = 'starter' | 'pro' | 'agency';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type WidgetTemplate = 'smile' | 'room_staging' | 'kitchen_remodel' | 'landscaping';
export type WidgetStatus = 'active' | 'inactive';

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
  widget_transform_count: number;
  enhancement_limit: number;
  widget_transform_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Widget {
  id: string;
  user_id: string;
  template: WidgetTemplate;
  client_name: string;
  brand_color: string;
  logo_url: string | null;
  cta_text: string;
  status: WidgetStatus;
  created_at: string;
  updated_at: string;
}

export interface WidgetUsage {
  id: string;
  widget_id: string;
  user_id: string;
  transformed_at: string;
  date: string;
}

export interface EnhancementUsage {
  id: string;
  user_id: string;
  enhancement_type: string;
  transformed_at: string;
  date: string;
}

// Tier limits configuration
export const TIER_LIMITS: Record<SubscriptionTier, {
  enhancement_limit: number;
  widget_transform_limit: number;
  active_widgets: number;
  overage_rate: number;
}> = {
  starter: {
    enhancement_limit: 200,
    widget_transform_limit: 50,
    active_widgets: 3,
    overage_rate: 0.25,
  },
  pro: {
    enhancement_limit: 500,
    widget_transform_limit: 200,
    active_widgets: 10,
    overage_rate: 0.25,
  },
  agency: {
    enhancement_limit: 1500,
    widget_transform_limit: 750,
    active_widgets: Infinity,
    overage_rate: 0.20,
  },
};

// Widget template display names and descriptions
export const WIDGET_TEMPLATES: Record<WidgetTemplate, {
  name: string;
  description: string;
  icon: string;
}> = {
  smile: {
    name: 'Smile Transformation',
    description: 'Show dental makeover results with whitening and alignment',
    icon: '😁',
  },
  room_staging: {
    name: 'Room Staging',
    description: 'Transform empty rooms into professionally staged spaces',
    icon: '🏠',
  },
  kitchen_remodel: {
    name: 'Kitchen/Bathroom Remodel',
    description: 'Visualize modern kitchen and bathroom renovations',
    icon: '🍳',
  },
  landscaping: {
    name: 'Landscaping',
    description: 'Show yard transformations with professional landscaping',
    icon: '🌳',
  },
};
