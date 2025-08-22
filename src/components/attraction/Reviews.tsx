import * as React from 'react';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockReviews = [
  {
    id: '1',
    author: 'นักเดินทางสายชิล',
    avatar: 'https://github.com/shadcn.png',
    rating: 5,
    comment: 'เป็นสถานที่ที่สวยงามมาก น้ำทะเลใส หาดทรายขาวสะอาด เหมาะกับการพักผ่อนจริงๆ ค่ะ ประทับใจมาก!',
    date: '2 สัปดาห์ที่แล้ว',
  },
  {
    id: '2',
    author: 'AdventureSeeker',
    avatar: 'https://github.com/shadcn.png',
    rating: 4,
    comment: 'กิจกรรมดำน้ำสนุกมากครับ ได้เห็นปลาเยอะเลย แต่คนค่อนข้างเยอะช่วงสุดสัปดาห์ แนะนำให้มาวันธรรมดา',
    date: '1 เดือนที่แล้ว',
  },
];

const Reviews: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>รีวิวจากนักท่องเที่ยว</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {mockReviews.map((review) => (
          <div key={review.id} className="flex gap-4">
            <Avatar>
              <AvatarImage src={review.avatar} alt={review.author} />
              <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{review.author}</p>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-muted-foreground">{review.comment}</p>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          ดูรีวิวทั้งหมด
        </Button>
      </CardContent>
    </Card>
  );
};

export default Reviews;
