import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Gift, 
  Star, 
  Crown, 
  Percent,
  Award,
  Clock
} from 'lucide-react';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { Reward } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';

interface RewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePoints: number;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  open,
  onOpenChange,
  availablePoints
}) => {
  const { rewards, isLoadingRewards, redeemReward, isRedeemingReward } = useCommunity();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return <Percent className="h-5 w-5 text-green-500" />;
      case 'badge': return <Award className="h-5 w-5 text-purple-500" />;
      case 'privilege': return <Crown className="h-5 w-5 text-yellow-500" />;
      default: return <Gift className="h-5 w-5" />;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'discount': return 'ส่วนลด';
      case 'badge': return 'แบดจ์';
      case 'privilege': return 'สิทธิพิเศษ';
      default: return 'รางวัล';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'badge': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'privilege': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleRedeem = (reward: Reward) => {
    if (availablePoints >= reward.pointsCost && reward.isAvailable) {
      redeemReward(reward.id);
    }
  };

  if (isLoadingRewards) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5" />
              <span>รางวัลที่แลกได้</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">กำลังโหลดรางวัล...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5" />
              <span>รางวัลที่แลกได้</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>คะแนนของคุณ: {availablePoints.toLocaleString()}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const canAfford = availablePoints >= reward.pointsCost;
              const isExpiring = reward.expiresAt && new Date(reward.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              return (
                <Card 
                  key={reward.id} 
                  className={cn(
                    "overflow-hidden transition-all",
                    canAfford && reward.isAvailable ? "hover:shadow-lg" : "opacity-60"
                  )}
                >
                  <div className="relative">
                    <img 
                      src={reward.image} 
                      alt={reward.name}
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={cn("text-xs", getCategoryColor(reward.category))}>
                        {getCategoryText(reward.category)}
                      </Badge>
                    </div>

                    {/* Expiring Soon */}
                    {isExpiring && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="text-xs flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>ใกล้หมดเขต</span>
                        </Badge>
                      </div>
                    )}

                    {/* Not Available Overlay */}
                    {!reward.isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Badge variant="secondary">ไม่พร้อมใช้งาน</Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1">{reward.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {reward.description}
                      </p>
                    </div>

                    {/* Points Cost */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(reward.category)}
                        <span className="text-lg font-bold text-primary">
                          {reward.pointsCost.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">คะแนน</span>
                      </div>
                    </div>

                    {/* Expiry Date */}
                    {reward.expiresAt && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          หมดเขต: {new Date(reward.expiresAt).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    )}

                    {/* Redeem Button */}
                    <Button
                      size="sm"
                      onClick={() => handleRedeem(reward)}
                      disabled={
                        !canAfford || 
                        !reward.isAvailable || 
                        isRedeemingReward
                      }
                      className={cn(
                        "w-full",
                        canAfford && reward.isAvailable 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
                          : ""
                      )}
                    >
                      {!reward.isAvailable ? (
                        'ไม่พร้อมใช้งาน'
                      ) : !canAfford ? (
                        `ต้องการอีก ${(reward.pointsCost - availablePoints).toLocaleString()} คะแนน`
                      ) : isRedeemingReward ? (
                        'กำลังแลก...'
                      ) : (
                        'แลกเลย!'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {rewards.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-medium">ยังไม่มีรางวัล</h3>
                <p className="text-sm text-muted-foreground">
                  รางวัลใหม่จะมาเร็วๆ นี้!
                </p>
              </div>
            </div>
          )}

          {/* How to Earn Points */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>วิธีการได้คะแนน</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-blue-500" />
                <span>โพสต์เรื่องราว: 50-100 คะแนน</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>คอมเมนต์ที่มีประโยชน์: 10-25 คะแนน</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="h-4 w-4 text-purple-500" />
                <span>ได้รับไลก์จากโพสต์: 5 คะแนน</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-orange-500" />
                <span>เชิญเพื่อนเข้าร่วม: 25 คะแนน</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};