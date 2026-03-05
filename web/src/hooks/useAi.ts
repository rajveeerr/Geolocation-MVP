import { useQuery, useMutation } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';

// --- Types mirrored from backend AI docs ---

export interface AiStatusResponse {
  aiEnabled: boolean;
}

export interface MerchantOnboardingSuggestionRequest {
  description: string;
}

export interface MerchantOnboardingSuggestion {
  businessType?: 'LOCAL' | 'NATIONAL';
  description?: string;
  vibeTags?: string[];
  amenities?: string[];
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  suggestedCategory?: string;
  keywords?: string[];
}

export interface MerchantOnboardingSuggestionResponse {
  suggestion: MerchantOnboardingSuggestion;
}

export interface DealGeneratorRequest {
  intent: string;
}

export interface DealGeneratorSuggestion {
  title: string;
  description: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  isFlashSale: boolean;
  redemptionInstructions: string;
  suggestedDurationHours?: number | null;
  suggestedTags?: string[];
  bestDayOfWeek?: string;
  bestTimeSlot?: string;
}

export interface DealGeneratorResponse {
  suggestion: DealGeneratorSuggestion;
}

export type AiChatRole = 'user' | 'model';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

export interface AiChatRequest {
  message: string;
  lat?: number;
  lng?: number;
  history?: AiChatMessage[];
}

export interface AiChatResponse {
  reply: string;
}

export interface AiMenuParseRequest {
  text: string;
}

export interface AiParsedMenuItem {
  name: string;
  description?: string;
  price: number;
  category?: string;
  isAvailable?: boolean;
  preparationTime?: number;
}

export interface AiMenuParseResponse {
  items: AiParsedMenuItem[];
  count: number;
}

export interface AiMerchantInsightRecommendation {
  type: string;
  title: string;
  description: string;
}

export interface AiMerchantInsightsPayload {
  summary: string;
  topInsights: string[];
  recommendations: AiMerchantInsightRecommendation[];
  bestPerformingDealType?: string;
  growthOpportunity?: string;
}

export interface AiMerchantInsightsResponse {
  insights: AiMerchantInsightsPayload;
}

export type AiNudgeType =
  | 'INACTIVITY'
  | 'NEARBY_DEAL'
  | 'STREAK_REMINDER'
  | 'HAPPY_HOUR_ALERT'
  | 'WEATHER_BASED';

export interface AiNudgeDealContext {
  title: string;
  merchant: string;
  discount: string;
}

export interface AiNudgePersonalizeRequest {
  userId: number;
  nudgeType: AiNudgeType;
  deal?: AiNudgeDealContext;
}

export interface AiNudgeContent {
  title: string;
  body: string;
  emoji?: string;
}

export interface AiNudgePersonalizeResponse {
  nudge: AiNudgeContent;
}

// --- Hooks ---

export const useAiStatus = () => {
  return useQuery({
    queryKey: ['ai-status'],
    queryFn: async () => {
      const res = await apiGet<AiStatusResponse>('/ai/status');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to check AI status');
      }
      return res.data;
    },
    staleTime: 60_000,
  });
};

export const useAiMerchantSuggestion = () => {
  return useMutation({
    mutationKey: ['ai-merchant-suggest'],
    mutationFn: async (payload: MerchantOnboardingSuggestionRequest) => {
      const res = await apiPost<MerchantOnboardingSuggestionResponse, MerchantOnboardingSuggestionRequest>(
        '/ai/merchant/suggest',
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to generate merchant suggestion');
      }
      return res.data;
    },
  });
};

export const useAiDealGenerator = () => {
  return useMutation({
    mutationKey: ['ai-deals-generate'],
    mutationFn: async (payload: DealGeneratorRequest) => {
      const res = await apiPost<DealGeneratorResponse, DealGeneratorRequest>('/ai/deals/generate', payload);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to generate deal suggestion');
      }
      return res.data;
    },
  });
};

export const useAiChat = () => {
  return useMutation({
    mutationKey: ['ai-chat'],
    mutationFn: async (payload: AiChatRequest) => {
      const res = await apiPost<AiChatResponse, AiChatRequest>('/ai/chat', payload);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to get AI reply');
      }
      return res.data;
    },
  });
};

export const useAiMenuParse = () => {
  return useMutation({
    mutationKey: ['ai-menu-parse'],
    mutationFn: async (payload: AiMenuParseRequest) => {
      const res = await apiPost<AiMenuParseResponse, AiMenuParseRequest>('/ai/menu/parse', payload);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to parse menu text');
      }
      return res.data;
    },
  });
};

export const useAiMerchantInsights = () => {
  return useQuery({
    queryKey: ['ai-merchant-insights'],
    queryFn: async () => {
      const res = await apiGet<AiMerchantInsightsResponse>('/ai/merchant/insights');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load AI merchant insights');
      }
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
};

export const useAiNudgePersonalize = () => {
  return useMutation({
    mutationKey: ['ai-nudge-personalize'],
    mutationFn: async (payload: AiNudgePersonalizeRequest) => {
      const res = await apiPost<AiNudgePersonalizeResponse, AiNudgePersonalizeRequest>(
        '/ai/nudge/personalize',
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to personalize nudge');
      }
      return res.data;
    },
  });
};

