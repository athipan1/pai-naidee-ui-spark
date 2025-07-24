import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MediaProvider } from "@/shared/contexts/MediaProvider";
import Index from "./pages/Index";
import Explore from "../app/pages/Explore";
import Favorites from "../app/pages/Favorites";
import Profile from "../app/pages/Profile";
import CategoryPage from "./pages/CategoryPage";
import AccordionExamples from "./pages/AccordionExamples";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AttractionDetailPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 flex items-center justify-center h-12 w-12 rounded-full shadow-lg bg-white border hover:bg-gray-50 transition-colors"
      >
        ←
      </button>

      <div className="container mx-auto px-4 py-6 space-y-8 max-w-4xl">
        {/* Hero Image */}
        <div className="mt-16">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=500&fit=crop"
              alt="หมู่เกาะพีพี"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Place Details */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">หมู่เกาะพีพี</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <span className="text-lg font-semibold">4.8</span>
              <span className="text-gray-600">(2,450 รีวิว)</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">มรดกโลก</span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">ธรรมชาติ</span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">ทะเล</span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">ดำน้ำ</span>
          </div>

          {/* Description */}
          <div className="rounded-lg border bg-white shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3">📝 รายละเอียด</h3>
            <p className="text-gray-600 leading-relaxed">
              หมู่เกาะพีพีเป็นหมู่เกาะที่มีความงามตามธรรมชาติ ตั้งอยู่ในจังหวัดกระบี่ มีน้ำทะเลใสสีเขียวมรกต หาดทรายขาวสะอาด และภูเขาหินปูนที่สวยงาม เหมาะสำหรับการพักผ่อนและทำกิจกรรมทางน้ำต่างๆ เช่น ดำน้ำดูปะการัง สนอร์คเกลิ้ง และนั่งเรือชมวิวรอบเกาะ
            </p>
          </div>

          {/* Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-white shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="text-blue-600">🕒</div>
                <div>
                  <p className="font-medium">เวลาเปิด-ปิด</p>
                  <p className="text-sm text-gray-600">เปิดตลอด 24 ชั่วโมง</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="text-blue-600">📍</div>
                <div>
                  <p className="font-medium">ที่อยู่</p>
                  <p className="text-sm text-gray-600">อำเภอเมือง จังหวัดกระบี่ 81000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="rounded-lg border bg-white shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">🎯 กิจกรรมที่ทำได้</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                ดำน้ำดูปะการัง
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                สนอร์คเกลิ้ง
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                นั่งเรือชมวิว
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                อาบแดดชายหาด
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button 
              className="flex items-center justify-center gap-2 h-11 px-8 py-2 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=7.7407,98.7784', '_blank')}
            >
              🧭 นำทางไปที่นี่
            </button>
            <button className="flex items-center justify-center gap-2 h-11 px-8 py-2 text-base border border-gray-300 bg-white rounded-md hover:bg-gray-50 transition-colors">
              ➕ เพิ่มลงแผน
            </button>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center justify-center h-10 w-10 border border-gray-300 bg-white rounded-md hover:bg-gray-50 transition-colors">
              ❤️
            </button>
            <button 
              className="flex items-center justify-center h-10 w-10 border border-gray-300 bg-white rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('คัดลอกลิงก์แล้ว!');
              }}
            >
              🔗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [currentLanguage, setCurrentLanguage] = useState<'th' | 'en'>('en');

  return (
    <QueryClientProvider client={queryClient}>
      <MediaProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />} />
              <Route path="/explore" element={<Explore currentLanguage={currentLanguage} onBack={() => window.history.back()} />} />
              <Route path="/favorites" element={<Favorites currentLanguage={currentLanguage} />} />
              <Route path="/profile" element={<Profile currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} onBack={() => window.history.back()} />} />
              <Route path="/attraction/:id" element={<AttractionDetailPage />} />
              <Route path="/category/:categoryName" element={<CategoryPage currentLanguage={currentLanguage} />} />
              <Route path="/accordion-examples" element={<AccordionExamples />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MediaProvider>
    </QueryClientProvider>
  );
};

export default App;
