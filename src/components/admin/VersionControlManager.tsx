// Version Control Manager Component
import { useState, useEffect } from 'react';
import { History, GitBranch, RotateCcw, Eye, FileText, Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

import { versionControlService } from '@/shared/services/versionControlService';
import type { 
  MediaVersion, 
  PlaceVersion, 
  VersionHistory, 
  VersionComparison,
  RollbackRequest 
} from '@/shared/types/version';
import { ChangeType } from '@/shared/types/version';

interface VersionControlManagerProps {
  currentLanguage: 'th' | 'en';
}

const VersionControlManager = ({ currentLanguage }: VersionControlManagerProps) => {
  // Search and selection state
  const [searchType, setSearchType] = useState<'media' | 'place'>('media');
  const [searchId, setSearchId] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  
  // Version history state
  const [versionHistory, setVersionHistory] = useState<VersionHistory | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  
  // Rollback state
  const [rollbackTarget, setRollbackTarget] = useState<string>('');
  const [rollbackReason, setRollbackReason] = useState('');
  const [isRollingBack, setIsRollingBack] = useState(false);
  
  // Loading and status
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const content = {
    th: {
      // Main titles
      title: 'การจัดการเวอร์ชัน',
      description: 'ดูประวัติ เปรียบเทียบ และย้อนกลับเวอร์ชันของสื่อและสถานที่',
      
      // Tabs
      history: 'ประวัติเวอร์ชัน',
      compare: 'เปรียบเทียบ',
      rollback: 'ย้อนกลับ',
      
      // Search
      searchType: 'ประเภท',
      searchId: 'รหัส ID',
      search: 'ค้นหา',
      media: 'สื่อ',
      place: 'สถานที่',
      
      // Version history
      versionNumber: 'เวอร์ชัน',
      createdBy: 'สร้างโดย',
      createdAt: 'สร้างเมื่อ',
      changeType: 'ประเภทการเปลี่ยนแปลง',
      changeReason: 'เหตุผลการเปลี่ยนแปลง',
      currentVersion: 'เวอร์ชันปัจจุบัน',
      
      // Actions
      viewDetails: 'ดูรายละเอียด',
      compareVersions: 'เปรียบเทียบ',
      rollbackToVersion: 'ย้อนกลับเวอร์ชัน',
      selectVersion: 'เลือกเวอร์ชัน',
      
      // Comparison
      oldVersion: 'เวอร์ชันเก่า',
      newVersion: 'เวอร์ชันใหม่',
      differences: 'ความแตกต่าง',
      field: 'ฟิลด์',
      oldValue: 'ค่าเก่า',
      newValue: 'ค่าใหม่',
      
      // Rollback
      rollbackTitle: 'ย้อนกลับเวอร์ชัน',
      rollbackDescription: 'เลือกเวอร์ชันที่ต้องการย้อนกลับและระบุเหตุผล',
      rollbackReason: 'เหตุผลการย้อนกลับ',
      rollbackConfirm: 'ยืนยันการย้อนกลับ',
      
      // Status messages
      noHistory: 'ไม่พบประวัติเวอร์ชัน',
      selectTwoVersions: 'เลือก 2 เวอร์ชันเพื่อเปรียบเทียบ',
      rollbackSuccess: 'ย้อนกลับเวอร์ชันสำเร็จ',
      rollbackError: 'ย้อนกลับเวอร์ชันล้มเหลว'
    },
    en: {
      // Main titles
      title: 'Version Control Management',
      description: 'View history, compare, and rollback versions of media and places',
      
      // Tabs
      history: 'Version History',
      compare: 'Compare',
      rollback: 'Rollback',
      
      // Search
      searchType: 'Type',
      searchId: 'ID',
      search: 'Search',
      media: 'Media',
      place: 'Place',
      
      // Version history
      versionNumber: 'Version',
      createdBy: 'Created By',
      createdAt: 'Created At',
      changeType: 'Change Type',
      changeReason: 'Change Reason',
      currentVersion: 'Current Version',
      
      // Actions
      viewDetails: 'View Details',
      compareVersions: 'Compare Versions',
      rollbackToVersion: 'Rollback to Version',
      selectVersion: 'Select Version',
      
      // Comparison
      oldVersion: 'Old Version',
      newVersion: 'New Version',
      differences: 'Differences',
      field: 'Field',
      oldValue: 'Old Value',
      newValue: 'New Value',
      
      // Rollback
      rollbackTitle: 'Rollback Version',
      rollbackDescription: 'Select the version to rollback to and provide a reason',
      rollbackReason: 'Rollback Reason',
      rollbackConfirm: 'Confirm Rollback',
      
      // Status messages
      noHistory: 'No version history found',
      selectTwoVersions: 'Select 2 versions to compare',
      rollbackSuccess: 'Version rollback successful',
      rollbackError: 'Version rollback failed'
    }
  };

  const t = content[currentLanguage];

  const handleSearch = async () => {
    if (!searchId.trim()) return;

    setIsLoading(true);
    setStatusMessage('');
    
    try {
      let history: VersionHistory;
      
      if (searchType === 'media') {
        history = await versionControlService.getMediaVersionHistory(searchId);
      } else {
        history = await versionControlService.getPlaceVersionHistory(searchId);
      }
      
      setVersionHistory(history);
      setSelectedItem(searchId);
      setSelectedVersions([]);
      setComparison(null);
      
      if (history.totalVersions === 0) {
        setStatusMessage(t.noHistory);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length >= 2) {
        return [prev[1], versionId];
      } else {
        return [...prev, versionId];
      }
    });
  };

  const handleCompareVersions = async () => {
    if (selectedVersions.length !== 2) {
      setStatusMessage(t.selectTwoVersions);
      return;
    }

    setIsLoading(true);
    try {
      const comparison = await versionControlService.compareVersions(
        selectedVersions[0],
        selectedVersions[1],
        searchType
      );
      setComparison(comparison);
    } catch (error) {
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!rollbackTarget || !rollbackReason.trim()) return;

    setIsRollingBack(true);
    setStatusMessage('');

    try {
      const request: RollbackRequest = {
        targetId: selectedItem,
        targetType: searchType,
        targetVersionId: rollbackTarget,
        reason: rollbackReason,
        requestedBy: 'current_user' // In real implementation, get from auth service
      };

      const result = await versionControlService.rollbackToVersion(request);
      
      if (result.success) {
        setStatusMessage(t.rollbackSuccess);
        setRollbackReason('');
        setRollbackTarget('');
        // Refresh history
        await handleSearch();
      } else {
        setStatusMessage(`${t.rollbackError}: ${result.message}`);
      }
    } catch (error) {
      setStatusMessage(`${t.rollbackError}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRollingBack(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(currentLanguage === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getChangeTypeColor = (changeType: ChangeType) => {
    switch (changeType) {
      case ChangeType.CREATED:
        return 'bg-green-100 text-green-800';
      case ChangeType.UPDATED:
        return 'bg-blue-100 text-blue-800';
      case ChangeType.DELETED:
        return 'bg-red-100 text-red-800';
      case ChangeType.RESTORED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Form */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label>{t.searchType}</Label>
              <Select value={searchType} onValueChange={(value) => setSearchType(value as 'media' | 'place')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="media">{t.media}</SelectItem>
                  <SelectItem value="place">{t.place}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-2">
              <Label>{t.searchId}</Label>
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder={`Enter ${searchType} ID`}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Loading...' : t.search}
              </Button>
            </div>
          </div>

          {statusMessage && (
            <Alert className="mb-4">
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {versionHistory && (
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">{t.history}</TabsTrigger>
            <TabsTrigger value="compare">{t.compare}</TabsTrigger>
            <TabsTrigger value="rollback">{t.rollback}</TabsTrigger>
          </TabsList>

          {/* Version History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  {t.history} - {selectedItem}
                </CardTitle>
                <CardDescription>
                  Total versions: {versionHistory.totalVersions}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {versionHistory.versions.map((version) => (
                      <div
                        key={version.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedVersions.includes(version.id)
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleVersionSelect(version.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={version.isActive ? "default" : "secondary"}>
                              {t.versionNumber} {version.version}
                            </Badge>
                            {version.isActive && (
                              <Badge variant="outline">{t.currentVersion}</Badge>
                            )}
                            <Badge className={getChangeTypeColor(version.changeType)}>
                              {version.changeType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            {version.createdBy}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">{('title' in version) ? version.title : version.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(version.createdAt)}
                          </div>
                        </div>
                        
                        {version.changeReason && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {t.changeReason}: {version.changeReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedVersions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected: {selectedVersions.length} version(s)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCompareVersions}
                        disabled={selectedVersions.length !== 2}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t.compareVersions}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {t.compare}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comparison ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{t.oldVersion}</h4>
                        <Badge>{t.versionNumber} {comparison.oldVersion.version}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(comparison.oldVersion.createdAt)}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{t.newVersion}</h4>
                        <Badge>{t.versionNumber} {comparison.newVersion.version}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(comparison.newVersion.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">{t.differences}</h4>
                      {comparison.differences.length > 0 ? (
                        <div className="space-y-2">
                          {comparison.differences.map((diff, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{diff.field}</Badge>
                                <ArrowRight className="w-4 h-4" />
                                <Badge className={
                                  diff.changeType === 'added' ? 'bg-green-100 text-green-800' :
                                  diff.changeType === 'removed' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }>
                                  {diff.changeType}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">{t.oldValue}:</span>
                                  <p className="mt-1">{String(diff.oldValue || 'N/A')}</p>
                                </div>
                                <div>
                                  <span className="font-medium">{t.newValue}:</span>
                                  <p className="mt-1">{String(diff.newValue || 'N/A')}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No differences found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      {t.selectTwoVersions}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rollback Tab */}
          <TabsContent value="rollback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  {t.rollbackTitle}
                </CardTitle>
                <CardDescription>{t.rollbackDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>{t.selectVersion}</Label>
                    <Select value={rollbackTarget} onValueChange={setRollbackTarget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select version to rollback to" />
                      </SelectTrigger>
                      <SelectContent>
                        {versionHistory.versions
                          .filter(v => !v.isActive)
                          .map((version) => (
                            <SelectItem key={version.id} value={version.id}>
                              Version {version.version} - {formatDate(version.createdAt)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t.rollbackReason}</Label>
                    <Textarea
                      value={rollbackReason}
                      onChange={(e) => setRollbackReason(e.target.value)}
                      placeholder="Enter reason for rollback..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleRollback}
                    disabled={!rollbackTarget || !rollbackReason.trim() || isRollingBack}
                    variant="destructive"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isRollingBack ? 'Rolling back...' : t.rollbackConfirm}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default VersionControlManager;