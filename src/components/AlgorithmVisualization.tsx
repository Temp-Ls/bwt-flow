import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Info } from 'lucide-react';
import { CompressionStep } from '@/lib/bwt';
import { cn } from '@/lib/utils';

interface AlgorithmVisualizationProps {
  steps: CompressionStep[];
}

export const AlgorithmVisualization: React.FC<AlgorithmVisualizationProps> = ({ steps }) => {
  const getStepColor = (stepName: string) => {
    switch (stepName.toLowerCase()) {
      case 'original': return 'bg-muted text-muted-foreground';
      case 'bwt': return 'bg-step-bwt text-white';
      case 'mtf': return 'bg-step-mtf text-white';
      case 'rle': return 'bg-step-rle text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const formatOutput = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStepDescription = (stepName: string) => {
    switch (stepName.toLowerCase()) {
      case 'original':
        return 'Starting with the original input text';
      case 'bwt':
        return 'Burrows-Wheeler Transform: Rearranges characters to group similar ones together';
      case 'mtf':
        return 'Move-to-Front: Converts frequently occurring characters to smaller indices';
      case 'rle':
        return 'Run-Length Encoding: Compresses consecutive repeated characters';
      default:
        return 'Processing step';
    }
  };

  return (
    <Card className="p-6 shadow-algorithm">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-semibold">Algorithm Pipeline</h2>
        <Badge variant="outline" className="ml-auto">
          {steps.length} Steps
        </Badge>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Step Card */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Step Badge */}
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium shrink-0",
                  getStepColor(step.name)
                )}>
                  {step.name}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{getStepDescription(step.name)}</h3>
                    {step.metadata && (
                      <Info className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Input/Output Display */}
                  <div className="space-y-2">
                    {index > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Input: </span>
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                          {formatOutput(step.input)}
                        </code>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="text-muted-foreground">Output: </span>
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        {formatOutput(step.output)}
                      </code>
                    </div>
                  </div>

                  {/* Metadata Display */}
                  {step.metadata && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(step.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-2 bg-muted/50 rounded">
                          <span className="capitalize text-muted-foreground">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-mono">
                            {typeof value === 'number' 
                              ? value.toFixed(2) 
                              : Array.isArray(value) 
                                ? `[${value.length} items]`
                                : String(value)
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Compression Ratio */}
                  {step.ratio && step.ratio !== 1 && (
                    <div className="mt-2">
                      <Badge 
                        variant={step.ratio > 1 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {step.ratio > 1 ? 'Expansion' : 'Compression'}: {step.ratio.toFixed(2)}x
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Arrow to next step */}
            {index < steps.length - 1 && (
              <div className="flex justify-center my-2">
                <div className="bg-muted rounded-full p-2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {steps.length > 1 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Pipeline Summary</h3>
              <p className="text-sm text-muted-foreground">
                {steps[0].output.length} → {steps[steps.length - 1].output.length} characters
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {(steps[0].output.length / steps[steps.length - 1].output.length).toFixed(2)}x
              </div>
              <div className="text-xs text-muted-foreground">
                Overall Ratio
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};