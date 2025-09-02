import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { CompressionStep } from '@/lib/bwt';

interface CompressionStatsProps {
  steps: CompressionStep[];
}

export const CompressionStats: React.FC<CompressionStatsProps> = ({ steps }) => {
  if (steps.length === 0) return null;

  const originalSize = steps[0].output.length;
  const finalSize = steps[steps.length - 1].output.length;
  const overallRatio = originalSize / finalSize;
  const compressionPercent = ((originalSize - finalSize) / originalSize) * 100;

  // Calculate step-by-step ratios
  const stepRatios = steps.slice(1).map((step, index) => ({
    name: step.name,
    ratio: steps[index].output.length / step.output.length,
    inputSize: steps[index].output.length,
    outputSize: step.output.length,
    color: getStepColor(step.name)
  }));

  function getStepColor(stepName: string) {
    switch (stepName.toLowerCase()) {
      case 'bwt': return 'hsl(var(--step-bwt))';
      case 'mtf': return 'hsl(var(--step-mtf))';
      case 'rle': return 'hsl(var(--step-rle))';
      default: return 'hsl(var(--primary))';
    }
  }

  const bestStep = stepRatios.reduce((best, current) => 
    current.ratio > best.ratio ? current : best, stepRatios[0]
  );

  const worstStep = stepRatios.reduce((worst, current) => 
    current.ratio < worst.ratio ? current : worst, stepRatios[0]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Statistics */}
      <Card className="p-6 shadow-data">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Overall Statistics</h3>
        </div>

        <div className="space-y-4">
          {/* Size Comparison */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Original Size</span>
              <Badge variant="outline">{originalSize} chars</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Final Size</span>
              <Badge variant="outline">{finalSize} chars</Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Compression Progress</span>
              <span className={compressionPercent > 0 ? 'text-secondary' : 'text-destructive'}>
                {compressionPercent > 0 ? '-' : '+'}{Math.abs(compressionPercent).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min((finalSize / originalSize) * 100, 100)} 
              className="h-2"
            />
          </div>

          {/* Overall Ratio */}
          <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {overallRatio > 1 ? (
                  <TrendingDown className="w-4 h-4 text-secondary" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-destructive" />
                )}
                <span className="font-medium">Overall Ratio</span>
              </div>
              <Badge variant={overallRatio > 1 ? "default" : "secondary"}>
                {overallRatio.toFixed(2)}x
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Step Performance */}
      <Card className="p-6 shadow-data">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold">Step Performance</h3>
        </div>

        <div className="space-y-3">
          {stepRatios.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
                <Badge 
                  variant={step.ratio > 1 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {step.ratio.toFixed(2)}x
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{step.inputSize} → {step.outputSize} chars</span>
                <span>
                  {step.ratio > 1 ? 'Compressed' : 'Expanded'} by {Math.abs(((step.inputSize - step.outputSize) / step.inputSize) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Best/Worst Performance Highlights */}
        <div className="mt-4 space-y-2">
          <div className="p-2 bg-secondary/10 rounded text-xs">
            <div className="flex items-center justify-between">
              <span className="text-secondary font-medium">Best Step: {bestStep.name}</span>
              <Badge variant="default" className="text-xs">
                {bestStep.ratio.toFixed(2)}x
              </Badge>
            </div>
          </div>
          
          {worstStep.ratio < 1 && (
            <div className="p-2 bg-destructive/10 rounded text-xs">
              <div className="flex items-center justify-between">
                <span className="text-destructive font-medium">Expanded: {worstStep.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {worstStep.ratio.toFixed(2)}x
                </Badge>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};