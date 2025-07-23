# useMediaQuery Hook และ MediaProvider

ฟีเจอร์สำหรับการจัดการ media query และ responsive design ใน React แบบปลอดภัยกับ SSR/Next.js

## useMediaQuery Hook

Custom hook สำหรับเช็ค media query แบบ custom ที่รองรับ SSR

### การใช้งาน

```tsx
import { useMediaQuery } from '@/shared/hooks/use-media-query'

function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isLargeScreen = useMediaQuery('(min-width: 1200px)')
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  
  return (
    <div>
      {isMobile && <p>Mobile view</p>}
      {isTablet && <p>Tablet view</p>}
      {isLargeScreen && <p>Large screen view</p>}
      {isDarkMode && <p>Dark mode is preferred</p>}
    </div>
  )
}
```

### คุณสมบัติ

- **SSR Safe**: เช็ค `typeof window !== 'undefined'` ก่อนใช้ `window.matchMedia`
- **Reactive**: อัปเดตค่าอัตโนมัติเมื่อ media query เปลี่ยน
- **Type Safe**: รองรับ TypeScript
- **Performance**: ใช้ event listener แบบ efficient

## MediaProvider และ useMedia

Context provider สำหรับจัดการ breakpoint และ orientation ของแอป

### การใช้งาน

#### 1. ตั้งค่า Provider

```tsx
import { MediaProvider } from '@/shared/contexts/MediaProvider'

function App() {
  return (
    <MediaProvider>
      <YourAppContent />
    </MediaProvider>
  )
}
```

#### 2. ใช้งานใน Components

```tsx
import { useMedia } from '@/shared/contexts/MediaProvider'

function ResponsiveComponent() {
  const { isMobile, isTablet, isDesktop, orientation } = useMedia()
  
  return (
    <div>
      <p>Device type:</p>
      {isMobile && <span>📱 Mobile</span>}
      {isTablet && <span>📱 Tablet</span>}
      {isDesktop && <span>💻 Desktop</span>}
      
      <p>Orientation: {orientation}</p>
      
      <div className={`
        ${isMobile ? 'p-2' : 'p-4'}
        ${isTablet ? 'grid-cols-2' : ''}
        ${isDesktop ? 'grid-cols-3' : ''}
      `}>
        Content with responsive styling
      </div>
    </div>
  )
}
```

### Breakpoints

MediaProvider ใช้ breakpoint มาตรฐาน:

- **Mobile**: `< 768px`
- **Tablet**: `768px - 1023px` 
- **Desktop**: `≥ 1024px`

### Orientation

- **portrait**: หน้าจอแนวตั้ง
- **landscape**: หน้าจอแนวนอน
- **unknown**: ไม่สามารถตรวจสอบได้ (เช่น ใน SSR)

## ตัวอย่างการใช้งานขั้นสูง

### Conditional Rendering

```tsx
function Navigation() {
  const { isMobile, isDesktop } = useMedia()
  
  return (
    <nav>
      {isMobile ? (
        <MobileMenu />
      ) : (
        <DesktopMenu />
      )}
      
      {isDesktop && <SearchBar />}
    </nav>
  )
}
```

### Dynamic Styling

```tsx
function Card() {
  const { isMobile, isTablet, orientation } = useMedia()
  
  const cardStyle = {
    padding: isMobile ? '1rem' : '2rem',
    maxWidth: isTablet ? '500px' : '300px',
    flexDirection: orientation === 'portrait' ? 'column' : 'row'
  }
  
  return <div style={cardStyle}>Card content</div>
}
```

### Custom Media Queries

```tsx
function AdvancedComponent() {
  // ใช้ useMediaQuery สำหรับ custom queries
  const isRetina = useMediaQuery('(-webkit-min-device-pixel-ratio: 2)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isLandscapePhone = useMediaQuery(
    '(max-width: 767px) and (orientation: landscape)'
  )
  
  // ใช้ useMedia สำหรับ standard breakpoints
  const { isMobile } = useMedia()
  
  return (
    <div>
      {isRetina && <img src="high-res-image.jpg" alt="High res" />}
      {!prefersReducedMotion && <AnimatedComponent />}
      {isLandscapePhone && <LandscapePhoneLayout />}
    </div>
  )
}
```

## ข้อควรระวัง

1. **SSR Hydration**: ในช่วง hydration ค่าจะเป็น `false` ก่อน จึงควรใช้ progressive enhancement
2. **Performance**: หลีกเลี่ยงการใช้ media query ที่ซับซ้อนเกินไป
3. **Testing**: ใน test environment ค่าจะเป็น `false` เสมอ เนื่องจากไม่มี `window.matchMedia`

## TypeScript Support

```tsx
import type { MediaContextType } from '@/shared/contexts/MediaProvider'

// Type สำหรับ component props
interface ResponsiveComponentProps {
  media?: MediaContextType
}

// Type guard
function isMobileDevice(media: MediaContextType): boolean {
  return media.isMobile && media.orientation === 'portrait'
}
```