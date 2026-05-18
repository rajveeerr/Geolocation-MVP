import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export type MarketAlertType = 'SUPPLIER_FORECAST' | 'COMMODITY_WATCH' | 'PRICE_SPIKE';

export interface ReasoningFactor {
  factor: string;
  detail: string;
  weight: 'high' | 'medium' | 'low';
}

export interface MarketAlert {
  id: number;
  merchantId: number;
  type: MarketAlertType;
  title: string;
  body: string;
  recommendedAction: string | null;
  confidenceScore: number | null;
  affectedIngredients: string[];
  reasoning: ReasoningFactor[] | null;
  source: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
}

export interface IngredientRecipeLink {
  id: number;
  menuItemId: number;
  menuItemName: string | null;
  quantityPerUnit: number;
}

export type UsageSource = 'orders' | 'manual' | null;

export interface Ingredient {
  id: number;
  name: string;
  slug: string;
  category: string;
  unitType: string;
  currentCost: number;
  stockLevel: number;
  avgDailyUsage: number | null;
  computedDailyUsage: number | null;
  effectiveDailyUsage: number | null;
  usageSource: UsageSource;
  supplierName: string | null;
  supplierUrl: string | null;
  trendPct: number | null;
  daysLeft: number | null;
  recipeLinks: IngredientRecipeLink[];
  createdAt: string;
  updatedAt: string;
}

export interface IngredientInput {
  name: string;
  category: string;
  unitType: string;
  currentCost: number;
  stockLevel: number;
  avgDailyUsage?: number | null;
  supplierName?: string | null;
  supplierUrl?: string | null;
}

const INGREDIENTS_KEY = ['merchant', 'ingredients'] as const;
const ALERTS_KEY = ['merchant', 'ingredients', 'alerts'] as const;

export const useIngredients = () => {
  return useQuery({
    queryKey: INGREDIENTS_KEY,
    queryFn: async () => {
      const response = await apiGet<{ ingredients: Ingredient[] }>('/merchant/ingredients');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load ingredients');
      }
      return response.data.ingredients;
    },
  });
};

export const useCreateIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: IngredientInput) => {
      const response = await apiPost<{ ingredient: Ingredient }, IngredientInput>(
        '/merchant/ingredients',
        input,
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create ingredient');
      }
      return response.data.ingredient;
    },
    onSuccess: (ingredient) => {
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_KEY });
      toast({ title: 'Ingredient added', description: `${ingredient.name} is now tracked.` });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not add ingredient', description: err.message, variant: 'destructive' });
    },
  });
};

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: Partial<IngredientInput> }) => {
      const response = await apiPatch<{ ingredient: Ingredient }, Partial<IngredientInput>>(
        `/merchant/ingredients/${id}`,
        input,
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update ingredient');
      }
      return response.data.ingredient;
    },
    onSuccess: (ingredient) => {
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_KEY });
      toast({ title: 'Saved', description: `${ingredient.name} updated.` });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not save', description: err.message, variant: 'destructive' });
    },
  });
};

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiDelete<{ ok: boolean }>(`/merchant/ingredients/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete ingredient');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_KEY });
      toast({ title: 'Ingredient removed' });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not delete', description: err.message, variant: 'destructive' });
    },
  });
};

// Per-menu-item recipe — the inverse view of MenuItemIngredient

export interface MenuItemRecipeLink {
  ingredientId: number;
  ingredientName: string | null;
  ingredientUnit: string | null;
  ingredientCategory: string | null;
  quantityPerUnit: number;
}

export const useMenuItemRecipe = (menuItemId: number | null | undefined) => {
  return useQuery({
    enabled: !!menuItemId,
    queryKey: ['merchant', 'menu-item', menuItemId, 'recipe'] as const,
    queryFn: async () => {
      const response = await apiGet<{ links: MenuItemRecipeLink[] }>(
        `/merchant/ingredients/by-menu-item/${menuItemId}/recipe`,
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load recipe');
      }
      return response.data.links;
    },
  });
};

export const useUpdateMenuItemRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      menuItemId: number;
      links: { ingredientId: number; quantityPerUnit: number }[];
    }) => {
      const response = await apiPut<{ ok: boolean; count: number }, { links: typeof params.links }>(
        `/merchant/ingredients/by-menu-item/${params.menuItemId}/recipe`,
        { links: params.links },
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update menu item recipe');
      }
      return response.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'menu-item', vars.menuItemId, 'recipe'] });
    },
  });
};

export const useUpdateIngredientRecipe = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: {
      id: number;
      links: { menuItemId: number; quantityPerUnit: number }[];
    }) => {
      const response = await apiPut<{ ingredient: Ingredient }, { links: typeof params.links }>(
        `/merchant/ingredients/${params.id}/recipe`,
        { links: params.links },
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update recipe');
      }
      return response.data.ingredient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_KEY });
      toast({ title: 'Recipe updated' });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not update recipe', description: err.message, variant: 'destructive' });
    },
  });
};

// ─── ALERTS ─────────────────────────────────────────────

export const useMarketAlerts = () => {
  return useQuery({
    queryKey: ALERTS_KEY,
    queryFn: async () => {
      const response = await apiGet<{ alerts: MarketAlert[] }>('/merchant/ingredients/alerts/list');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load alerts');
      }
      return response.data.alerts;
    },
  });
};

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiPost<{ alert: MarketAlert }, Record<string, never>>(
        `/merchant/ingredients/alerts/${id}/acknowledge`,
        {} as Record<string, never>,
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to acknowledge');
      }
      return response.data.alert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
    },
  });
};

interface GenerateAlertResponse {
  alert: MarketAlert;
  cached: boolean;
}

export const useGenerateSupplierForecast = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (opts?: { force?: boolean }) => {
      const response = await apiPost<GenerateAlertResponse, { force?: boolean }>(
        '/merchant/ingredients/alerts/generate/supplier-forecast',
        { force: !!opts?.force },
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate forecast');
      }
      return response.data;
    },
    onSuccess: ({ cached }) => {
      queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
      toast({
        title: cached ? 'Showing recent forecast' : 'New supplier forecast generated',
        description: cached ? 'Generated within the last 6 hours.' : undefined,
      });
    },
    onError: (err: Error) => {
      toast({ title: 'Forecast failed', description: err.message, variant: 'destructive' });
    },
  });
};

export const useGenerateCommodityWatch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (opts?: { force?: boolean }) => {
      const response = await apiPost<GenerateAlertResponse, { force?: boolean }>(
        '/merchant/ingredients/alerts/generate/commodity-watch',
        { force: !!opts?.force },
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate commodity watch');
      }
      return response.data;
    },
    onSuccess: ({ cached }) => {
      queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
      toast({
        title: cached ? 'Showing recent update' : 'New commodity update generated',
        description: cached ? 'Generated within the last 6 hours.' : undefined,
      });
    },
    onError: (err: Error) => {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    },
  });
};

export const useScanPriceSpikes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const response = await apiPost<{ created: number; details: string[] }, Record<string, never>>(
        '/merchant/ingredients/alerts/scan',
        {} as Record<string, never>,
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to scan');
      }
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
      if (result.created > 0) {
        toast({
          title: `${result.created} new price spike alert(s)`,
          description: result.details.join(', '),
        });
      } else {
        toast({ title: 'No new price spikes', description: 'All ingredients are within range.' });
      }
    },
    onError: (err: Error) => {
      toast({ title: 'Scan failed', description: err.message, variant: 'destructive' });
    },
  });
};
