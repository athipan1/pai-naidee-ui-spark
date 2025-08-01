// Testing and simulation types
export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  createdAt: Date;
  lastRunAt?: Date;
  isActive: boolean;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  type: TestType;
  config: TestConfig;
  expectedResult: any;
  actualResult?: any;
  status: TestStatus;
  duration?: number; // milliseconds
  error?: string;
  logs: string[];
  createdAt: Date;
  lastRunAt?: Date;
}

export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  LOAD = 'load',
  STRESS = 'stress',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  NETWORK_FAILURE = 'network_failure',
  LARGE_FILE_UPLOAD = 'large_file_upload',
  CONCURRENT_USERS = 'concurrent_users'
}

export enum TestStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  TIMEOUT = 'timeout'
}

export interface TestConfig {
  [key: string]: any;
  timeout?: number;
  retries?: number;
  concurrency?: number;
  fileSize?: number;
  userCount?: number;
  duration?: number;
  networkDelay?: number;
  errorRate?: number;
}

export interface LoadTestConfig extends TestConfig {
  rampUpTime: number; // seconds
  sustainTime: number; // seconds
  rampDownTime: number; // seconds
  virtualUsers: number;
  requestsPerSecond: number;
  endpoints: LoadTestEndpoint[];
}

export interface LoadTestEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  weight: number; // 0-100 percentage of requests
  headers?: Record<string, string>;
  body?: any;
  expectedStatusCode: number;
}

export interface ConcurrentUserSimulation {
  id: string;
  name: string;
  virtualUsers: VirtualUser[];
  duration: number; // seconds
  scenario: UserScenario;
  metrics: SimulationMetrics;
  status: TestStatus;
  startedAt?: Date;
  completedAt?: Date;
}

export interface VirtualUser {
  id: string;
  name: string;
  role: string;
  actions: UserAction[];
  currentAction?: number;
  status: 'active' | 'idle' | 'error' | 'completed';
  error?: string;
}

export interface UserAction {
  type: ActionType;
  delay: number; // milliseconds
  data?: any;
  expectedDuration: number;
  weight: number; // probability 0-1
}

export enum ActionType {
  LOGIN = 'login',
  BROWSE = 'browse',
  SEARCH = 'search',
  VIEW_PLACE = 'view_place',
  UPLOAD_MEDIA = 'upload_media',
  EDIT_PLACE = 'edit_place',
  DELETE_MEDIA = 'delete_media',
  SYNC_DATA = 'sync_data',
  LOGOUT = 'logout'
}

export interface UserScenario {
  name: string;
  description: string;
  actions: UserAction[];
  loops: number;
  randomization: boolean;
}

export interface SimulationMetrics {
  totalUsers: number;
  activeUsers: number;
  completedUsers: number;
  errorUsers: number;
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  peakMemoryUsage: number;
  peakCpuUsage: number;
  networkUtilization: number;
}

export interface TestReport {
  id: string;
  testSuiteId: string;
  testCases: TestCaseResult[];
  summary: TestSummary;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  generatedAt: Date;
  generatedBy: string;
}

export interface TestCaseResult {
  testCaseId: string;
  name: string;
  status: TestStatus;
  duration: number;
  error?: string;
  metrics?: any;
  logs: string[];
}

export interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  successRate: number;
  averageDuration: number;
  criticalFailures: string[];
}