import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface Phase {
  id?: string;
  title: string;
  description: string;
  orderIndex: number;
}

interface PhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase?: Phase | null;
  onSave: (phase: Omit<Phase, 'id'>) => Promise<void>;
}

export const PhaseDialog: React.FC<PhaseDialogProps> = ({
  open,
  onOpenChange,
  phase,
  onSave
}) => {
  const [formData, setFormData] = useState<Omit<Phase, 'id'>>({
    title: '',
    description: '',
    orderIndex: 1
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!phase;

  useEffect(() => {
    if (phase) {
      setFormData({
        title: phase.title,
        description: phase.description,
        orderIndex: phase.orderIndex
      });
    } else {
      setFormData({
        title: '',
        description: '',
        orderIndex: 1
      });
    }
    setErrors({});
  }, [phase, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.orderIndex < 1) {
      newErrors.orderIndex = 'Order index must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save phase:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const suggestedEmojis = ['📚', '📘', '📖', '📝', '🎯', '🏆', '⭐', '🌟', '💡', '🎓'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Phase' : 'Create New Phase'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the phase information below.'
              : 'Create a new learning phase. Add an emoji to make it more engaging!'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Phase Title</Label>
            <div className="space-y-2">
              <Input
                id="title"
                placeholder="e.g., 📚 Phase 1: Bahagi ng Pananalita"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {!isEditing && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground mr-2">Quick emojis:</span>
                  {suggestedEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-lg hover:bg-muted rounded px-1"
                      onClick={() => {
                        const currentTitle = formData.title;
                        const newTitle = currentTitle.startsWith(emoji) 
                          ? currentTitle 
                          : `${emoji} ${currentTitle.replace(/^[^\w\s]*\s*/, '')}`;
                        handleInputChange('title', newTitle);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this phase..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderIndex">Order Index</Label>
            <Input
              id="orderIndex"
              type="number"
              min="1"
              placeholder="1"
              value={formData.orderIndex}
              onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value) || 1)}
              className={errors.orderIndex ? 'border-red-500' : ''}
            />
            {errors.orderIndex && (
              <p className="text-sm text-red-500">{errors.orderIndex}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Determines the order in which phases appear to students
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-primary"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Phase' : 'Create Phase'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
