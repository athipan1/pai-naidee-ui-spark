import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAssistantConfig, defaultConfig, configPresets } from '../config/AIAssistantConfig';

interface AIAssistantAdminProps {
  config: AIAssistantConfig;
  onConfigChange: (config: AIAssistantConfig) => void;
  onClose: () => void;
}

const AIAssistantAdmin: React.FC<AIAssistantAdminProps> = ({ 
  config, 
  onConfigChange, 
  onClose 
}) => {
  const [localConfig, setLocalConfig] = useState<AIAssistantConfig>(config);

  const updateConfig = (section: keyof AIAssistantConfig, updates: any) => {
    const newConfig = {
      ...localConfig,
      [section]: { ...localConfig[section], ...updates }
    };
    setLocalConfig(newConfig);
  };

  const applyConfig = () => {
    onConfigChange(localConfig);
    onClose();
  };

  const loadPreset = (presetName: keyof typeof configPresets) => {
    const preset = configPresets[presetName];
    setLocalConfig(preset);
  };

  const resetToDefault = () => {
    setLocalConfig(defaultConfig);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Assistant Configuration
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="position" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="animation">Animation</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="gestures">Gestures</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
            </TabsList>

            {/* Position Settings */}
            <TabsContent value="position" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horizontal Position</Label>
                  <Select 
                    value={localConfig.model.position.x} 
                    onValueChange={(value) => updateConfig('model', { 
                      position: { ...localConfig.model.position, x: value } 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Vertical Position</Label>
                  <Select 
                    value={localConfig.model.position.y} 
                    onValueChange={(value) => updateConfig('model', { 
                      position: { ...localConfig.model.position, y: value } 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width: {localConfig.model.size.width}px</Label>
                  <Slider
                    value={[localConfig.model.size.width]}
                    onValueChange={(value) => updateConfig('model', { 
                      size: { ...localConfig.model.size, width: value[0] } 
                    })}
                    min={150}
                    max={400}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Height: {localConfig.model.size.height}px</Label>
                  <Slider
                    value={[localConfig.model.size.height]}
                    onValueChange={(value) => updateConfig('model', { 
                      size: { ...localConfig.model.size, height: value[0] } 
                    })}
                    min={200}
                    max={600}
                    step={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>X Offset: {localConfig.model.offset.x}px</Label>
                  <Slider
                    value={[localConfig.model.offset.x]}
                    onValueChange={(value) => updateConfig('model', { 
                      offset: { ...localConfig.model.offset, x: value[0] } 
                    })}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Y Offset: {localConfig.model.offset.y}px</Label>
                  <Slider
                    value={[localConfig.model.offset.y]}
                    onValueChange={(value) => updateConfig('model', { 
                      offset: { ...localConfig.model.offset, y: value[0] } 
                    })}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={localConfig.model.responsive}
                  onCheckedChange={(checked) => updateConfig('model', { responsive: checked })}
                />
                <Label>Responsive Design</Label>
              </div>
            </TabsContent>

            {/* Animation Settings */}
            <TabsContent value="animation" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.animations.idle}
                    onCheckedChange={(checked) => updateConfig('animations', { idle: checked })}
                  />
                  <Label>Idle Animations</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.animations.gestures}
                    onCheckedChange={(checked) => updateConfig('animations', { gestures: checked })}
                  />
                  <Label>Gesture Animations</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.animations.enableBreathing}
                    onCheckedChange={(checked) => updateConfig('animations', { enableBreathing: checked })}
                  />
                  <Label>Breathing Effect</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.animations.enableEyeMovement}
                    onCheckedChange={(checked) => updateConfig('animations', { enableEyeMovement: checked })}
                  />
                  <Label>Eye Movement</Label>
                </div>

                <div className="space-y-2">
                  <Label>Animation Quality</Label>
                  <Select 
                    value={localConfig.animations.quality} 
                    onValueChange={(value) => updateConfig('animations', { quality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Performance Settings */}
            <TabsContent value="performance" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localConfig.performance.autoOptimize}
                    onCheckedChange={(checked) => updateConfig('performance', { autoOptimize: checked })}
                  />
                  <Label>Auto Optimization</Label>
                </div>

                <div className="space-y-2">
                  <Label>Max Polygon Count: {localConfig.performance.maxPolycount}</Label>
                  <Slider
                    value={[localConfig.performance.maxPolycount]}
                    onValueChange={(value) => updateConfig('performance', { maxPolycount: value[0] })}
                    min={3000}
                    max={15000}
                    step={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Texture Size</Label>
                  <Select 
                    value={localConfig.performance.textureSize.toString()} 
                    onValueChange={(value) => updateConfig('performance', { textureSize: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="256">256px</SelectItem>
                      <SelectItem value="512">512px</SelectItem>
                      <SelectItem value="1024">1024px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target FPS: {localConfig.performance.maxFPS}</Label>
                  <Slider
                    value={[localConfig.performance.maxFPS]}
                    onValueChange={(value) => updateConfig('performance', { maxFPS: value[0] })}
                    min={30}
                    max={120}
                    step={10}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Gesture Settings */}
            <TabsContent value="gestures" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(localConfig.gestures).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace('_', ' ')}</Label>
                    <Select 
                      value={value} 
                      onValueChange={(newValue) => updateConfig('gestures', { [key]: newValue })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wave">Wave</SelectItem>
                        <SelectItem value="nod">Nod</SelectItem>
                        <SelectItem value="point_to_ui">Point to UI</SelectItem>
                        <SelectItem value="hand_gestures">Hand Gestures</SelectItem>
                        <SelectItem value="jump_slightly">Jump Slightly</SelectItem>
                        <SelectItem value="scratch_head">Scratch Head</SelectItem>
                        <SelectItem value="eating_gesture">Eating Gesture</SelectItem>
                        <SelectItem value="sleeping_gesture">Sleeping Gesture</SelectItem>
                        <SelectItem value="driving_gesture">Driving Gesture</SelectItem>
                        <SelectItem value="weather_gesture">Weather Gesture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Presets */}
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button onClick={() => loadPreset('mobile')} variant="outline">
                  Mobile Preset
                </Button>
                <Button onClick={() => loadPreset('desktop')} variant="outline">
                  Desktop Preset
                </Button>
                <Button onClick={() => loadPreset('performance')} variant="outline">
                  Performance Preset
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={resetToDefault} variant="outline">
                  Reset to Default
                </Button>
                <Button onClick={applyConfig} className="flex-1">
                  Apply Configuration
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantAdmin;