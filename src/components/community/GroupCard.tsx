import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  FileText, 
  Lock, 
  Globe,
  Crown,
  TrendingUp
} from 'lucide-react';
import { Group } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';

interface GroupCardProps {
  group: Group;
  onJoin: (groupId: string) => void;
  onView: (groupId: string) => void;
  isJoining?: boolean;
  className?: string;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onJoin,
  onView,
  isJoining = false,
  className
}) => {
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'solo-travel': return 'เที่ยวคนเดียว';
      case 'family-travel': return 'เที่ยวครอบครัว';
      case 'backpacking': return 'แบกเป้';
      case 'luxury-travel': return 'เที่ยวหรู';
      case 'food-travel': return 'สายกิน';
      case 'adventure': return 'ผจญภัย';
      case 'cultural': return 'วัฒนธรรม';
      case 'photography': return 'ถ่ายภาพ';
      case 'budget-travel': return 'ประหยัด';
      default: return 'ทั่วไป';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'solo-travel': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'family-travel': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'backpacking': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'luxury-travel': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'food-travel': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'adventure': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cultural': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'photography': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'budget-travel': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow cursor-pointer", className)}>
      <div 
        className="relative h-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${group.coverImage})` }}
        onClick={() => onView(group.id)}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute top-3 left-3">
          <Badge className={cn("text-xs", getCategoryColor(group.category))}>
            {getCategoryText(group.category)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          {group.isPrivate ? (
            <Lock className="h-4 w-4 text-white" />
          ) : (
            <Globe className="h-4 w-4 text-white" />
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div 
          className="space-y-2 cursor-pointer"
          onClick={() => onView(group.id)}
        >
          <h3 className="font-semibold text-lg line-clamp-1">{group.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {group.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{formatNumber(group.memberCount)} สมาชิก</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>{formatNumber(group.postCount)} โพสต์</span>
          </div>
        </div>

        {/* Moderators */}
        {group.moderators.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Crown className="h-3 w-3" />
              <span>ผู้ดูแลกลุ่ม</span>
            </div>
            <div className="flex items-center space-x-2">
              {group.moderators.slice(0, 3).map((moderator, index) => (
                <Avatar key={moderator.id} className="h-6 w-6">
                  <AvatarImage src={moderator.avatar} alt={moderator.displayName} />
                  <AvatarFallback className="text-xs">{moderator.displayName[0]}</AvatarFallback>
                </Avatar>
              ))}
              {group.moderators.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{group.moderators.length - 3} คน
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(group.id)}
            className="flex items-center space-x-1"
          >
            <span>ดูกลุ่ม</span>
          </Button>
          
          <Button
            size="sm"
            onClick={() => onJoin(group.id)}
            disabled={isJoining}
            variant={group.isJoined ? "outline" : "default"}
            className={cn(
              "flex items-center space-x-1",
              group.isJoined && "text-green-600 border-green-600 hover:bg-green-50"
            )}
          >
            {group.isJoined ? (
              <>
                <Users className="h-4 w-4" />
                <span>เข้าร่วมแล้ว</span>
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                <span>{isJoining ? 'กำลังเข้าร่วม...' : 'เข้าร่วม'}</span>
              </>
            )}
          </Button>
        </div>

        {/* Recent Activity Indicator */}
        {group.postCount > 0 && (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>มีกิจกรรมล่าสุด</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};