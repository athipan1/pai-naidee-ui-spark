# Developer Dashboard Documentation

## Overview

The Developer Dashboard is a comprehensive frontend interface for monitoring and managing backend services in the PaiNaiDee tourism application. It provides developers with real-time insights into system health, process management capabilities, log monitoring, and performance metrics.

## Access

The dashboard is available at `/dashboard` route:
- **Local Development**: `http://localhost:8080/dashboard`
- **Production**: `https://your-domain.com/dashboard`

## Features

### 🔧 Service Status Monitoring
- **Real-time health checks** for all backend services
- **Response time tracking** and uptime statistics
- **Status indicators** (Healthy, Warning, Error)
- **Service endpoints** visibility
- **Manual refresh** capability

**Services Monitored:**
- API Gateway
- Database Service
- Authentication Service
- File Storage Service
- Cache Service

### ⚡ Process Control
- **Start, stop, and restart** backend processes
- **Resource monitoring** (CPU and Memory usage)
- **Process status tracking** with timestamps
- **Bulk operations** for multiple processes
- **Real-time status updates**

**Managed Processes:**
- Data Synchronization Service
- Image Processing Service
- Database Backup Service
- Notification Service

### 📋 System Logs
- **Real-time log streaming** from backend services
- **Advanced filtering** by log level, source, and search terms
- **Auto-refresh** capability (5-second intervals)
- **Log export** functionality (JSON format)
- **Metadata display** for detailed debugging

**Log Levels:**
- Info (🔵)
- Warning (🟡)
- Error (🔴)
- Debug (⚪)

### 📊 System Metrics
- **Key performance indicators** (KPIs)
- **Real-time charts** for performance trends
- **System health monitoring** (CPU, Memory, Disk usage)
- **Request volume analytics**
- **24-hour performance history**

**Metrics Displayed:**
- Total Users / Active Users
- Request Volume / Response Times
- System Resource Usage
- Performance Trends

## Technical Implementation

### Architecture
```
src/
├── app/pages/Dashboard.tsx          # Main dashboard page
├── components/dashboard/            # Dashboard components
│   ├── ServiceStatus.tsx           # Service health monitoring
│   ├── ProcessControl.tsx          # Backend process management
│   ├── LogsViewer.tsx              # System logs interface
│   └── SystemMetrics.tsx           # Performance metrics
└── shared/utils/dashboardAPI.ts    # Backend API integration
```

### API Integration

The dashboard communicates with backend services through RESTful APIs:

```typescript
// Service Status
GET /api/dashboard/services/status

// Process Management
POST /api/dashboard/processes/{id}/start
POST /api/dashboard/processes/{id}/stop
POST /api/dashboard/processes/{id}/restart

// System Logs
GET /api/dashboard/logs?level={level}&source={source}&limit={limit}

// System Metrics
GET /api/dashboard/metrics
```

### Error Handling

The dashboard gracefully handles backend connectivity issues:
- **Fallback to mock data** when APIs are unavailable
- **User notifications** for failed operations
- **Retry mechanisms** for temporary failures
- **Clear error messages** for troubleshooting

## Usage Guide

### 1. Monitoring Service Health

1. Navigate to the **Service Status** tab
2. View the health status of all backend services
3. Check response times and uptime percentages
4. Click **Refresh Status** to update manually
5. Review service endpoints and last check timestamps

**Status Indicators:**
- 🟢 **Healthy**: Service operating normally
- 🟡 **Warning**: Service experiencing issues
- 🔴 **Error**: Service unavailable or failing

### 2. Managing Backend Processes

1. Go to the **Process Control** tab
2. View all running and stopped processes
3. Use individual controls:
   - **Start**: Launch a stopped process
   - **Stop**: Terminate a running process
   - **Restart**: Restart any process
4. Monitor resource usage (CPU/Memory)
5. Use bulk actions for multiple processes

### 3. Viewing System Logs

1. Select the **Logs** tab
2. Use filters to narrow down logs:
   - **Search**: Find specific messages
   - **Level**: Filter by log severity
   - **Source**: Filter by service
3. Enable **Auto Refresh** for real-time monitoring
4. **Download Logs** for offline analysis

### 4. Analyzing System Metrics

1. Access the **System Metrics** tab
2. Review key performance indicators
3. Analyze system health indicators
4. Examine performance charts for trends
5. Monitor resource usage progress bars

## Multi-language Support

The dashboard supports both English and Thai languages:
- Interface automatically adapts to user's language preference
- All text, labels, and messages are localized
- Maintains consistent functionality across languages

## Responsive Design

The dashboard is optimized for various screen sizes:
- **Desktop**: Full-featured experience with side-by-side layouts
- **Tablet**: Adjusted grid layouts and touch-friendly controls
- **Mobile**: Stacked components and simplified navigation

## Security Considerations

- **Access Control**: Implement authentication for dashboard access
- **API Security**: Secure backend endpoints with proper authorization
- **Data Privacy**: Sensitive information is masked in logs
- **Rate Limiting**: Prevent abuse of refresh and control operations

## Troubleshooting

### Common Issues

**Dashboard Not Loading**
- Check if development server is running (`npm run dev`)
- Verify the `/dashboard` route is accessible
- Check browser console for JavaScript errors

**Backend API Errors**
- Ensure backend services are running
- Verify API endpoints are configured correctly
- Check network connectivity and CORS settings

**Charts Not Displaying**
- Confirm Recharts library is properly installed
- Check for JavaScript errors in browser console
- Verify data format matches chart requirements

**Mobile Layout Issues**
- Test on various screen sizes
- Check CSS breakpoints in Tailwind configuration
- Verify responsive design classes are applied

### Getting Help

1. Check browser developer console for errors
2. Review network requests in DevTools
3. Verify backend service logs
4. Test API endpoints independently
5. Create GitHub issues for bugs or feature requests

## Development

### Setup for Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access dashboard
http://localhost:8080/dashboard
```

### Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

### Customization

**Adding New Metrics:**
1. Update `SystemMetrics.tsx` component
2. Add new API endpoints in `dashboardAPI.ts`
3. Extend data interfaces as needed

**Adding New Services:**
1. Update service list in `ServiceStatus.tsx`
2. Configure backend health check endpoints
3. Add service-specific monitoring logic

**Customizing Themes:**
1. Modify Tailwind CSS classes
2. Update component styling
3. Ensure responsive design is maintained

## API Documentation

### Service Status Endpoint
```typescript
GET /api/dashboard/services/status
Response: ServiceStatus[]

interface ServiceStatus {
  id: string;
  name: string;
  status: "healthy" | "warning" | "error";
  lastCheck: string;
  responseTime: number;
  uptime: string;
  endpoint: string;
}
```

### Process Control Endpoints
```typescript
POST /api/dashboard/processes/{processId}/start
POST /api/dashboard/processes/{processId}/stop
POST /api/dashboard/processes/{processId}/restart

Response: {
  success: boolean;
  message: string;
}
```

### Logs Endpoint
```typescript
GET /api/dashboard/logs?level={level}&source={source}&limit={limit}
Response: LogEntry[]

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  source: string;
  message: string;
  metadata?: Record<string, any>;
}
```

### Metrics Endpoint
```typescript
GET /api/dashboard/metrics
Response: SystemMetricsResponse

interface SystemMetricsResponse {
  metrics: MetricData[];
  stats: SystemStats;
}
```

---

## Support

For technical support or questions about the Developer Dashboard:
- 📧 **Email**: dev-support@painaidee.com
- 🐛 **Issues**: GitHub repository issues section
- 📖 **Documentation**: This guide and inline code comments
- 💬 **Community**: Developer Slack channel

---

*Last updated: July 28, 2025*
*Version: 1.0.0*