import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, ArrowLeft, Clock } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { CalculatorHistory } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function History() {
  // استعلام للحصول على سجل الحاسبة
  const { data: history = [], isLoading, error } = useQuery({
    queryKey: ['/api/calculator/history'],
    queryFn: () => fetch('/api/calculator/history').then(res => res.json()) as Promise<CalculatorHistory[]>
  });

  const queryClient = useQueryClient();

  // طفرة لمسح السجل
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/calculator/history', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to clear history');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/history'] });
    },
  });

  const handleClearHistory = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع السجلات؟')) {
      clearHistoryMutation.mutate();
    }
  };

  const formatDateTime = (timestamp: string | Date) => {
    try {
      const date = new Date(timestamp);
      return format(date, 'PPP p', { locale: ar });
    } catch {
      return 'وقت غير معروف';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري تحميل السجل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-red-500">
          <p>حدث خطأ في تحميل السجل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-4">
      <div className="w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-secondary"
              data-testid="button-back-to-calculator"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-medium">سجل الحاسبة</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            disabled={history.length === 0 || clearHistoryMutation.isPending}
            className="p-2 hover:bg-destructive/10 hover:text-destructive"
            data-testid="button-clear-history"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        {/* History List */}
        <Card className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا توجد عمليات حسابية</p>
              <p className="text-sm mt-2">ابدأ بإجراء بعض العمليات الحسابية</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-3" data-testid="history-list">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-secondary/30 rounded-lg p-4 border border-border/50"
                    data-testid={`history-item-${index}`}
                  >
                    <div className="space-y-1">
                      {/* التعبير الرياضي */}
                      <div className="text-sm text-muted-foreground font-mono">
                        {item.expression}
                      </div>
                      {/* النتيجة */}
                      <div className="text-lg font-medium text-foreground font-mono">
                        = {item.result}
                      </div>
                      {/* الوقت */}
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(item.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link href="/">
            <Button 
              variant="outline" 
              className="w-full"
              data-testid="button-return-calculator"
            >
              العودة إلى الحاسبة
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}