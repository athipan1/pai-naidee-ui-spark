# useMediaQuery Hook และ MediaProvider

Custom React hooks และ context provider สำหรับจัดการ media queries และ responsive design ที่ปลอดภัยกับ SSR/Next.js

## useMediaQuery Hook

Hook ที่รับ media query string และส่งคืน boolean ที่บอกว่า media query ตรงกับ viewport ปัจจุบันหรือไม่

### การใช้งานพื้นฐาน

```tsx
import { useMediaQuery } from '@/shared/hooks/use-media-query'

function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const isLandscape = useMediaQuery('(orientation: landscape)')

  return (
    <div>
      {isMobile ? (
        <div>Mobile View</div>
      ) : (
        <div>Desktop View</div>
      )}
    </div>
  )
}
```

### คุณสมบัติ

- **SSR Safe**: ตรวจสอบ `typeof window !== 'undefined'` เพื่อป้องกันข้อผิดพลาดใน server-side rendering
- **รองรับ media query ทุกประเภท**: รับ CSS media query string ใดก็ได้
- **การอัปเดตแบบ real-time**: ฟัง media query changes และอัปเดต state โดยอัตโนมัติ
- **Performance optimized**: ใช้ native `window.matchMedia` API

### Parameters

| Parameter | Type   | Description                                    |
|-----------|--------|------------------------------------------------|
| query     | string | CSS media query string (เช่น "(max-width: 768px)") |

### Returns

| Type    | Description                                    |
|---------|------------------------------------------------|
| boolean | `true` ถ้า media query ตรงกับ viewport ปัจจุบัน, `false` ถ้าไม่ตรง |

## MediaProvider Context

Context provider ที่ให้ข้อมูล responsive breakpoints และ orientation สำหรับทั้งแอป

### การติดตั้งและใช้งาน

1. **Wrap แอปของคุณด้วย MediaProvider:**

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

2. **ใช้ useMedia hook ในคอมโพเนนต์:**

```tsx
import { useMedia } from '@/shared/contexts/MediaProvider'

function ResponsiveComponent() {
  const { isMobile, isTablet, isDesktop, orientation } = useMedia()

  return (
    <div>
      <h1>Device Information</h1>
      <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
      <p>Tablet: {isTablet ? 'Yes' : 'No'}</p>
      <p>Desktop: {isDesktop ? 'Yes' : 'No'}</p>
      <p>Orientation: {orientation}</p>
      
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  )
}
```

### Breakpoints

MediaProvider ใช้ breakpoints ดังนี้:

- **Mobile**: `(max-width: 767px)`
- **Tablet**: `(min-width: 768px) and (max-width: 1023px)`
- **Desktop**: `(min-width: 1024px)`
- **Orientation**: `portrait` หรือ `landscape`

### MediaContextType

```tsx
interface MediaContextType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
}
```

## ตัวอย่างการใช้งานขั้นสูง

### การสร้าง custom breakpoints

```tsx
function useCustomBreakpoints() {
  const isSmallMobile = useMediaQuery('(max-width: 480px)')
  const isLargeMobile = useMediaQuery('(min-width: 481px) and (max-width: 767px)')
  const isSmallTablet = useMediaQuery('(min-width: 768px) and (max-width: 991px)')
  const isLargeTablet = useMediaQuery('(min-width: 992px) and (max-width: 1023px)')
  
  return {
    isSmallMobile,
    isLargeMobile,
    isSmallTablet,
    isLargeTablet,
  }
}
```

### การตรวจสอบ device features

```tsx
function useDeviceFeatures() {
  const hasHover = useMediaQuery('(hover: hover)')
  const hasTouch = useMediaQuery('(pointer: coarse)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  
  return {
    hasHover,
    hasTouch,
    prefersReducedMotion,
    prefersDarkMode,
  }
}
```

### การใช้งานใน conditional rendering

```tsx
function AdaptiveNavigation() {
  const { isMobile, isDesktop } = useMedia()
  const isWideScreen = useMediaQuery('(min-width: 1440px)')

  if (isMobile) {
    return <MobileHamburgerMenu />
  }

  if (isDesktop && isWideScreen) {
    return <ExtendedDesktopNav />
  }

  return <StandardDesktopNav />
}
```

### การใช้งานใน styling

```tsx
function ResponsiveCard() {
  const { isMobile, orientation } = useMedia()
  const isLargeScreen = useMediaQuery('(min-width: 1200px)')

  const cardStyle = {
    width: isMobile ? '100%' : '50%',
    height: orientation === 'landscape' && isMobile ? '80vh' : 'auto',
    padding: isLargeScreen ? '2rem' : '1rem',
  }

  return (
    <div style={cardStyle}>
      <h2>Responsive Card</h2>
      <p>This card adapts to different screen sizes</p>
    </div>
  )
}
```

## ข้อกำหนดและข้อควรระวัง

### SSR Safety

- Hook จะคืนค่า `false` เสมอในระหว่าง server-side rendering
- คอมโพเนนต์ควรรองรับการแสดงผลเริ่มต้นที่ไม่ขึ้นกับ media query
- ใช้ `useEffect` หรือ conditional rendering เพื่อแสดงเนื้อหาที่เฉพาะเจาะจงหลังจาก hydration

### Performance

- Hook ใช้ `window.matchMedia` ซึ่งมีประสิทธิภาพสูง
- Event listeners จะถูกทำความสะอาดโดยอัตโนมัติเมื่อคอมโพเนนต์ unmount
- หลีกเลี่ยงการใช้ media queries ที่ซับซ้อนเกินไป

### Browser Support

- รองรับเบราว์เซอร์สมัยใหม่ที่มี `window.matchMedia` API
- สำหรับเบราว์เซอร์เก่า อาจต้องใช้ polyfill

## การ Migration จาก useIsMobile

หากคุณใช้ `useIsMobile` hook เดิมอยู่ สามารถ migrate ได้ดังนี้:

```tsx
// เดิม
import { useIsMobile } from '@/shared/hooks/use-mobile'
const isMobile = useIsMobile()

// ใหม่ - ใช้ useMediaQuery
import { useMediaQuery } from '@/shared/hooks/use-media-query'
const isMobile = useMediaQuery('(max-width: 767px)')

// หรือใช้ MediaProvider
import { useMedia } from '@/shared/contexts/MediaProvider'
const { isMobile } = useMedia()
```