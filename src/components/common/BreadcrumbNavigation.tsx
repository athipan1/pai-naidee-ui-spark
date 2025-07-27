import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbNavigationProps {
  currentLanguage: "th" | "en";
  items?: BreadcrumbItem[];
}

const BreadcrumbNavigation = ({ currentLanguage, items }: BreadcrumbNavigationProps) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { 
        label: currentLanguage === 'th' ? 'หน้าแรก' : 'Home', 
        path: '/' 
      }
    ];

    if (pathSegments.length === 0) return breadcrumbs;

    // Handle specific routes
    if (pathSegments[0] === 'attraction') {
      breadcrumbs.push({
        label: currentLanguage === 'th' ? 'สถานที่ท่องเที่ยว' : 'Attractions',
        path: '/'
      });
      if (pathSegments[1]) {
        breadcrumbs.push({
          label: currentLanguage === 'th' ? 'รายละเอียด' : 'Details'
        });
      }
    } else if (pathSegments[0] === 'category') {
      breadcrumbs.push({
        label: currentLanguage === 'th' ? 'หมวดหมู่' : 'Categories',
        path: '/'
      });
      if (pathSegments[1]) {
        breadcrumbs.push({
          label: pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1)
        });
      }
    } else if (pathSegments[0] === 'explore') {
      breadcrumbs.push({
        label: currentLanguage === 'th' ? 'สำรวจ' : 'Explore'
      });
    } else if (pathSegments[0] === 'favorites') {
      breadcrumbs.push({
        label: currentLanguage === 'th' ? 'รายการโปรด' : 'Favorites'
      });
    } else if (pathSegments[0] === 'profile') {
      breadcrumbs.push({
        label: currentLanguage === 'th' ? 'โปรไฟล์' : 'Profile'
      });
    } else if (pathSegments[0] === 'map') {
      breadcrumbs.push({
        label: currentLanguage === 'th' ? 'แผนที่' : 'Map'
      });
    }

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't show breadcrumbs on homepage
  if (location.pathname === '/' && !items) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="py-2 px-4 bg-background/80 backdrop-blur-sm border-b border-border/30">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
              )}
              
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                  {isFirst && <Home className="w-4 h-4 mr-1" />}
                  {item.label}
                </Link>
              ) : (
                <span className={`flex items-center ${isLast ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {isFirst && <Home className="w-4 h-4 mr-1" />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;