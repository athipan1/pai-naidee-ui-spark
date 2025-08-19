import React from 'react';
import { InstagramStyleFeed } from '@/components/community/InstagramStyleFeed';

const InstagramDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Instagram-Style Posts Demo</h1>
        <p className="text-muted-foreground">
          Showcasing the new Instagram-like posts feature with infinite scroll and mobile-first design
        </p>
      </div>

      {/* Instagram Feed */}
      <InstagramStyleFeed 
        initialFilter={{ type: 'all', sortBy: 'latest' }}
        authToken="demo-token"
      />
    </div>
  );
};

export default InstagramDemo;