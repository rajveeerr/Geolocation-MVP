import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Tag, Package, Award } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SkeletonList } from '@/components/common/Skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAdminDealTypes,
  useCreateDealType,
  useUpdateDealType,
  useDeleteDealType,
  useAdminPointEventTypes,
  useCreatePointEventType,
  useUpdatePointEventType,
  useDeletePointEventType,
  type Category,
  type DealType,
  type PointEventType,
  type CreateCategoryData,
  type UpdateCategoryData,
  type CreateDealTypeData,
  type UpdateDealTypeData,
  type CreatePointEventTypeData,
  type UpdatePointEventTypeData,
} from '@/hooks/useAdminMasterData';

type TabType = 'categories' | 'deal-types' | 'point-events';
type EditMode = 'create' | 'edit' | null;

export const AdminMasterDataManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  // Category state
  const [categoryForm, setCategoryForm] = useState<CreateCategoryData>({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    sortOrder: 0,
    active: true,
  });

  // Deal Type state
  const [dealTypeForm, setDealTypeForm] = useState<CreateDealTypeData>({
    name: '',
    description: '',
    sortOrder: 0,
    active: true,
  });

  // Point Event Type state
  const [pointEventForm, setPointEventForm] = useState<CreatePointEventTypeData>({
    name: '',
    description: '',
    points: 0,
    sortOrder: 0,
    active: true,
  });

  // Category hooks
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Deal Type hooks
  const { data: dealTypes, isLoading: dealTypesLoading } = useAdminDealTypes();
  const createDealType = useCreateDealType();
  const updateDealType = useUpdateDealType();
  const deleteDealType = useDeleteDealType();

  // Point Event Type hooks
  const { data: pointEventTypes, isLoading: pointEventTypesLoading } = useAdminPointEventTypes();
  const createPointEventType = useCreatePointEventType();
  const updatePointEventType = useUpdatePointEventType();
  const deletePointEventType = useDeletePointEventType();

  const resetForms = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      sortOrder: 0,
      active: true,
    });
    setDealTypeForm({
      name: '',
      description: '',
      sortOrder: 0,
      active: true,
    });
    setPointEventForm({
      name: '',
      description: '',
      points: 0,
      sortOrder: 0,
      active: true,
    });
    setEditMode(null);
    setEditingId(null);
  };

  const handleCreate = async () => {
    try {
      if (activeTab === 'categories') {
        await createCategory.mutateAsync(categoryForm);
      } else if (activeTab === 'deal-types') {
        await createDealType.mutateAsync(dealTypeForm);
      } else if (activeTab === 'point-events') {
        await createPointEventType.mutateAsync(pointEventForm);
      }
      resetForms();
    } catch (error) {
      // Error is handled by the mutation hooks
    }
  };

  const handleEdit = (item: Category | DealType | PointEventType) => {
    setEditingId(item.id);
    setEditMode('edit');
    
    if (activeTab === 'categories') {
      const category = item as Category;
      setCategoryForm({
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
        active: category.active,
      });
    } else if (activeTab === 'deal-types') {
      const dealType = item as DealType;
      setDealTypeForm({
        name: dealType.name,
        description: dealType.description,
        sortOrder: dealType.sortOrder,
        active: dealType.active,
      });
    } else if (activeTab === 'point-events') {
      const pointEvent = item as PointEventType;
      setPointEventForm({
        name: pointEvent.name,
        description: pointEvent.description,
        points: pointEvent.points,
        sortOrder: pointEvent.sortOrder,
        active: pointEvent.active,
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      if (activeTab === 'categories') {
        await updateCategory.mutateAsync({ id: editingId, data: categoryForm as UpdateCategoryData });
      } else if (activeTab === 'deal-types') {
        await updateDealType.mutateAsync({ id: editingId, data: dealTypeForm as UpdateDealTypeData });
      } else if (activeTab === 'point-events') {
        await updatePointEventType.mutateAsync({ id: editingId, data: pointEventForm as UpdatePointEventTypeData });
      }
      resetForms();
    } catch (error) {
      // Error is handled by the mutation hooks
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'categories') {
        await deleteCategory.mutateAsync(id);
      } else if (activeTab === 'deal-types') {
        await deleteDealType.mutateAsync(id);
      } else if (activeTab === 'point-events') {
        await deletePointEventType.mutateAsync(id);
      }
    } catch (error) {
      // Error is handled by the mutation hooks
    }
  };

  const renderForm = () => {
    if (activeTab === 'categories') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category-name">Name *</Label>
            <Input
              id="category-name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="Category name"
            />
          </div>
          <div>
            <Label htmlFor="category-icon">Icon</Label>
            <Input
              id="category-icon"
              value={categoryForm.icon}
              onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
              placeholder="🍽️"
            />
          </div>
          <div>
            <Label htmlFor="category-color">Color</Label>
            <Input
              id="category-color"
              type="color"
              value={categoryForm.color}
              onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="category-sort">Sort Order</Label>
            <Input
              id="category-sort"
              type="number"
              value={categoryForm.sortOrder}
              onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="category-description">Description</Label>
            <Input
              id="category-description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Category description"
            />
          </div>
        </div>
      );
    } else if (activeTab === 'deal-types') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deal-type-name">Name *</Label>
            <Input
              id="deal-type-name"
              value={dealTypeForm.name}
              onChange={(e) => setDealTypeForm({ ...dealTypeForm, name: e.target.value })}
              placeholder="Deal type name"
            />
          </div>
          <div>
            <Label htmlFor="deal-type-sort">Sort Order</Label>
            <Input
              id="deal-type-sort"
              type="number"
              value={dealTypeForm.sortOrder}
              onChange={(e) => setDealTypeForm({ ...dealTypeForm, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="deal-type-description">Description</Label>
            <Input
              id="deal-type-description"
              value={dealTypeForm.description}
              onChange={(e) => setDealTypeForm({ ...dealTypeForm, description: e.target.value })}
              placeholder="Deal type description"
            />
          </div>
        </div>
      );
    } else if (activeTab === 'point-events') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="point-event-name">Name *</Label>
            <Input
              id="point-event-name"
              value={pointEventForm.name}
              onChange={(e) => setPointEventForm({ ...pointEventForm, name: e.target.value })}
              placeholder="Point event name"
            />
          </div>
          <div>
            <Label htmlFor="point-event-points">Points *</Label>
            <Input
              id="point-event-points"
              type="number"
              value={pointEventForm.points}
              onChange={(e) => setPointEventForm({ ...pointEventForm, points: parseInt(e.target.value) || 0 })}
              placeholder="Points to award"
            />
          </div>
          <div>
            <Label htmlFor="point-event-sort">Sort Order</Label>
            <Input
              id="point-event-sort"
              type="number"
              value={pointEventForm.sortOrder}
              onChange={(e) => setPointEventForm({ ...pointEventForm, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="point-event-description">Description</Label>
            <Input
              id="point-event-description"
              value={pointEventForm.description}
              onChange={(e) => setPointEventForm({ ...pointEventForm, description: e.target.value })}
              placeholder="Point event description"
            />
          </div>
        </div>
      );
    }
    return null;
  };

  const renderList = () => {
    const isLoading = activeTab === 'categories' ? categoriesLoading : 
                     activeTab === 'deal-types' ? dealTypesLoading : 
                     pointEventTypesLoading;

    if (isLoading) {
      return <SkeletonList items={5} />;
    }

    const items = activeTab === 'categories' ? categories :
                  activeTab === 'deal-types' ? dealTypes :
                  pointEventTypes;

    if (!items || items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-neutral-500">No {activeTab.replace('-', ' ')} found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg"
          >
            <div className="flex items-center gap-4">
              {activeTab === 'categories' && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: (item as Category).color + '20', color: (item as Category).color }}
                >
                  {(item as Category).icon || <Tag className="h-5 w-5" />}
                </div>
              )}
              {activeTab === 'deal-types' && (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              )}
              {activeTab === 'point-events' && (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-neutral-900">{item.name}</h3>
                <p className="text-sm text-neutral-500">{item.description}</p>
                {activeTab === 'point-events' && (
                  <p className="text-sm text-green-600 font-medium">
                    {(item as PointEventType).points} points
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.active ? 'Active' : 'Inactive'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(item)}
                disabled={editMode === 'edit' && editingId === item.id}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Master Data Management</h2>
          <p className="text-neutral-600 mt-1">Manage categories, deal types, and point event types.</p>
        </div>
        <Button
          onClick={() => {
            resetForms();
            setEditMode('create');
          }}
          disabled={editMode !== null}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {[
            { key: 'categories', label: 'Categories', icon: Tag },
            { key: 'deal-types', label: 'Deal Types', icon: Package },
            { key: 'point-events', label: 'Point Events', icon: Award },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key as TabType);
                resetForms();
              }}
              className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-brand-primary-500 text-brand-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {editMode && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              {editMode === 'create' ? 'Create New' : 'Edit'} {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <Button variant="outline" size="sm" onClick={resetForms}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {renderForm()}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={editMode === 'create' ? handleCreate : handleUpdate}
              disabled={
                (activeTab === 'categories' && !categoryForm.name) ||
                (activeTab === 'deal-types' && !dealTypeForm.name) ||
                (activeTab === 'point-events' && (!pointEventForm.name || pointEventForm.points <= 0))
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {editMode === 'create' ? 'Create' : 'Update'}
            </Button>
            <Button variant="outline" onClick={resetForms}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} List
        </h3>
        {renderList()}
      </div>
    </div>
  );
};
