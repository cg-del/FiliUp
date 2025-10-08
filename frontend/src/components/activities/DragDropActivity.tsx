import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface DragDropItem {
  id: string;
  text: string;
  correctCategory: string;
  orderIndex: number;
}

interface Category {
  id: string;
  categoryId: string;
  name: string;
  colorClass: string;
  orderIndex: number;
}

interface DragDropActivityProps {
  items: DragDropItem[];
  categories: Category[];
  title: string;
  instructions: string;
  onComplete: (score: number, percentage: number, answers?: (string | number | string[])[], timeSpentSeconds?: number) => void;
}

export const DragDropActivity: React.FC<DragDropActivityProps> = ({
  items,
  categories,
  title,
  instructions,
  onComplete
}) => {
  useEffect(() => {
    document.body.classList.add('no-select');

    type FsEl = HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
      mozRequestFullScreen?: () => Promise<void> | void;
    };
    const el = document.documentElement as FsEl;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen;
    try {
      if (req) {
        const res = req.call(el);
        if (res && typeof (res as Promise<void>).catch === 'function') {
          (res as Promise<void>).catch(() => {/* ignore */});
        }
      }
    } catch (e) { /* noop */ }

    return () => {
      document.body.classList.remove('no-select');
      type FsDoc = Document & {
        webkitExitFullscreen?: () => Promise<void> | void;
        msExitFullscreen?: () => Promise<void> | void;
        mozCancelFullScreen?: () => Promise<void> | void;
      };
      const d = document as FsDoc;
      const exit = document.exitFullscreen || d.webkitExitFullscreen || d.msExitFullscreen || d.mozCancelFullScreen;
      try {
        if (exit) {
          const res = exit.call(document);
          if (res && typeof (res as Promise<void>).catch === 'function') {
            (res as Promise<void>).catch(() => {/* ignore */});
          }
        }
      } catch (e) { /* noop */ }
    };
  }, []);
  const [droppedItems, setDroppedItems] = useState<{[key: string]: DragDropItem[]}>({});
  const [availableItems, setAvailableItems] = useState<DragDropItem[]>(items);
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  const handleDragStart = (item: DragDropItem) => {
    setDraggedItem(item);
  };

  const handleDrop = (categoryId: string) => {
    if (!draggedItem) return;

    setDroppedItems(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), draggedItem]
    }));
    
    setAvailableItems(prev => prev.filter(item => item.id !== draggedItem.id));
    setDraggedItem(null);
  };

  const handleRemoveItem = (categoryId: string, itemId: string) => {
    const item = droppedItems[categoryId]?.find(i => i.id === itemId);
    if (!item) return;

    setDroppedItems(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(i => i.id !== itemId)
    }));
    
    setAvailableItems(prev => [...prev, item]);
  };

  const checkAnswers = () => {
    setShowResults(true);
    
    let correctCount = 0;
    let totalItems = 0;

    Object.entries(droppedItems).forEach(([categoryId, categoryItems]) => {
      categoryItems.forEach(item => {
        totalItems++;
        if (item.correctCategory === categoryId) {
          correctCount++;
        }
      });
    });

    const percentage = Math.round((correctCount / items.length) * 100);
    
    // Build answers array in the SAME order as the incoming items prop
    // Each answer should be the selected categoryId for that item
    const itemIdToCategory: Record<string, string> = {};
    Object.entries(droppedItems).forEach(([categoryId, categoryItems]) => {
      categoryItems.forEach((it) => {
        itemIdToCategory[it.id] = categoryId;
      });
    });
    const answers: string[] = items.map((it) => itemIdToCategory[it.id] ?? "");
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);

    setTimeout(() => {
      onComplete(correctCount, percentage, answers, timeSpentSeconds);
    }, 3000);
  };

  const resetActivity = () => {
    setDroppedItems({});
    setAvailableItems(items);
    setShowResults(false);
    setDraggedItem(null);
  };

  const isItemCorrect = (item: DragDropItem, categoryId: string) => {
    return showResults && item.correctCategory === categoryId;
  };

  const isItemIncorrect = (item: DragDropItem, categoryId: string) => {
    return showResults && item.correctCategory !== categoryId;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="learning-card">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-muted-foreground">{instructions}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Items */}
          <div className="space-y-2">
            <h3 className="font-medium">Mga Salita:</h3>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  className="drag-item bg-card border border-border rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  onClick={() => handleDragStart(item)}
                >
                  {item.text}
                </div>
              ))}
              {availableItems.length === 0 && (
                <div className="text-muted-foreground text-sm">
                  Lahat ng salita ay nailagay na sa mga kahon
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <h3 className={`font-medium text-center p-2 rounded-lg text-black ${category.colorClass}`}>
                  {category.name}
                </h3>
                <div
                  className="drop-zone min-h-[120px] p-3 space-y-2 border-2 border-dashed border-muted-foreground/30 rounded-lg"
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(category.categoryId);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => {
                    if (draggedItem) {
                      handleDrop(category.categoryId);
                    }
                  }}
                >
                  {(droppedItems[category.categoryId] || []).map((item) => (
                    <div
                      key={item.id}
                      className={`
                        p-2 rounded-lg border cursor-pointer transition-all duration-200
                        ${isItemCorrect(item, category.categoryId) ? 'bg-success-light border-success' : ''}
                        ${isItemIncorrect(item, category.categoryId) ? 'bg-destructive/10 border-destructive' : 'bg-muted border-border hover:bg-muted/80'}
                      `}
                      onClick={() => !showResults && handleRemoveItem(category.categoryId, item.id)}
                      title={showResults ? undefined : "I-click para ibalik"}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{item.text}</span>
                        {showResults && isItemCorrect(item, category.categoryId) && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </div>
                  ))}
                  {(droppedItems[category.categoryId]?.length || 0) === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      I-drag ang mga salita dito
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={resetActivity}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Ulitin
            </Button>
            
            <Button 
              variant="activity" 
              onClick={checkAnswers}
              disabled={availableItems.length > 0 || showResults}
              className="btn-bounce"
            >
              Suriin ang Sagot
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
