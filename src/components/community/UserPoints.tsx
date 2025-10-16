import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Gift, 
  TrendingUp, 
  Calendar,
  Crown,
  Zap,
  Award
} from 'lucide-react';
import { UserPoints as UserPointsType, PointsTransaction } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';

interface UserPointsProps {
  userPoints: UserPointsType;
  className?: string;
}

export const UserPoints: React.FC<UserPointsProps> = ({
  userPoints,
  className
}) => {
  const getLevelInfo = (points: number) => {
    if (points >= 5000) return { level: 'legend', name: 'ตำนาน', next: null, progress: 100, color: 'from-yellow-400 to-orange-500' };
    if (points >= 1501) return { level: 'expert', name: 'ผู้เชี่ยวชาญ', next: 5000, progress: ((points - 1501) / (5000 - 1501)) * 100, color: 'from-purple-400 to-pink-500' };
    if (points >= 501) return { level: 'adventurer', name: 'นักผจญภัย', next: 1501, progress: ((points - 501) / (1501 - 501)) * 100, color: 'from-blue-400 to-cyan-500' };
    if (points >= 101) return { level: 'explorer', name: 'นักสำรวจ', next: 501, progress: ((points - 101) / (501 - 101)) * 100, color: 'from-green-400 to-emerald-500' };
    return { level: 'newbie', name: 'มือใหม่', next: 101, progress: (points / 101) * 100, color: 'from-gray-400 to-gray-500' };
  };

  const levelInfo = getLevelInfo(userPoints.total);

  const getTransactionIcon = (reason: string) => {
    if (reason.includes('โพสต์')) return <Award className="h-4 w-4 text-blue-500" />;
    if (reason.includes('คอมเมนต์')) return <Star className="h-4 w-4 text-yellow-500" />;
    if (reason.includes('แลก')) return <Gift className="h-4 w-4 text-red-500" />;
    return <Zap className="h-4 w-4 text-purple-500" />;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <>
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>คะแนนของคุณ</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowRewards(true)}
              className="flex items-center space-x-1"
            >
              <Gift className="h-4 w-4" />
              <span>รางวัล</span>
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Level */}
          <div className="text-center space-y-3">
            <div className={cn(
              "inline-flex items-center justify-center w-20 h-20 rounded-full text-white text-xl font-bold bg-gradient-to-r",
              levelInfo.color
            )}>
              {userPoints.total >= 1000 ? `${(userPoints.total / 1000).toFixed(1)}k` : userPoints.total}
            </div>
            
            <div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-white border-0 bg-gradient-to-r",
                  levelInfo.color
                )}
              >
                {levelInfo.name}
              </Badge>
              {levelInfo.next && (
                <p className="text-xs text-muted-foreground mt-1">
                  อีก {levelInfo.next - userPoints.total} คะแนน เพื่อเลื่อนระดับ
                </p>
              )}
            </div>

            {/* Progress to next level */}
            {levelInfo.next && (
              <div className="space-y-2">
                <Progress 
                  value={levelInfo.progress} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round(levelInfo.progress)}% สู่ระดับถัดไป
                </p>
              </div>
            )}
          </div>

          {/* Points Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {userPoints.available.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">คะแนนที่ใช้ได้</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {userPoints.earned.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">คะแนนที่ได้รับ</div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>กิจกรรมล่าสุด</span>
            </h4>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {userPoints.history.slice(0, 5).map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center space-x-2">
                    {getTransactionIcon(transaction.reason)}
                    <div>
                      <p className="text-xs font-medium line-clamp-1">
                        {transaction.reason}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(transaction.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "text-xs font-bold",
                    transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-1"
            >
              <Star className="h-4 w-4" />
              <span>วิธีได้คะแนน</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};