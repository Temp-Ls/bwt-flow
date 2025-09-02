import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, RotateCcw, Play, Pause } from 'lucide-react';
import { compressText, decompressText, CompressionStep } from '@/lib/bwt';
import { AlgorithmVisualization } from '@/components/AlgorithmVisualization';
import { CompressionStats } from '@/components/CompressionStats';
import { useToast } from '@/hooks/use-toast';

const BWT = () => {
  const [inputText, setInputText] = useState('banana');
  const [compressionSteps, setCompressionSteps] = useState<CompressionStep[]>([]);
  const [decompressedText, setDecompressedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('compress');
  const { toast } = useToast();

  // Sample texts for demonstration
  const sampleTexts = [
    { name: 'Simple', text: 'banana' },
    { name: 'Repeated', text: 'abracadabra' },
    { name: 'Lorem', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { name: 'Code', text: 'function bubbleSort(arr) { return arr.sort((a, b) => a - b); }' }
  ];

  const handleCompress = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to compress.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate processing delay for visualization
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const steps = compressText(inputText);
      setCompressionSteps(steps);
      
      toast({
        title: "Compression Complete",
        description: `Text compressed through ${steps.length} steps.`,
      });
    } catch (error) {
      toast({
        title: "Compression Error",
        description: "An error occurred during compression.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecompress = async () => {
    if (compressionSteps.length === 0) {
      toast({
        title: "No Compressed Data",
        description: "Please compress some text first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const decompressed = decompressText(compressionSteps);
      setDecompressedText(decompressed);
      
      const isSuccessful = decompressed === inputText;
      toast({
        title: isSuccessful ? "Decompression Successful" : "Decompression Warning",
        description: isSuccessful 
          ? "Text successfully decompressed to original form." 
          : "Decompressed text doesn't match original.",
        variant: isSuccessful ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Decompression Error",
        description: "An error occurred during decompression.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleText = (text: string) => {
    setInputText(text);
    setCompressionSteps([]);
    setDecompressedText('');
  };

  const handleReset = () => {
    setInputText('');
    setCompressionSteps([]);
    setDecompressedText('');
  };

  const totalCompressionRatio = useMemo(() => {
    if (compressionSteps.length === 0) return 1;
    const original = compressionSteps[0];
    const final = compressionSteps[compressionSteps.length - 1];
    return original.output.length / final.output.length;
  }, [compressionSteps]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BWT Compressor
              </h1>
              <p className="text-muted-foreground mt-1">
                Interactive Burrows-Wheeler Transform Pipeline
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-algorithm">
              <h2 className="text-xl font-semibold mb-4">Input Text</h2>
              
              {/* Sample Text Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sampleTexts.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSampleText(sample.text)}
                    className="text-xs"
                  >
                    {sample.name}
                  </Button>
                ))}
              </div>

              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to compress..."
                className="min-h-32 font-mono text-sm"
              />

              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleCompress}
                  disabled={isProcessing || !inputText.trim()}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Compress
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleDecompress}
                  disabled={isProcessing || compressionSteps.length === 0}
                >
                  Decompress
                </Button>
              </div>

              {/* Quick Stats */}
              {compressionSteps.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Original Size:</span>
                      <Badge variant="outline">{inputText.length} chars</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Compressed Size:</span>
                      <Badge variant="outline">
                        {compressionSteps[compressionSteps.length - 1]?.output.length || 0} chars
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ratio:</span>
                      <Badge 
                        variant={totalCompressionRatio > 1 ? "default" : "secondary"}
                      >
                        {totalCompressionRatio.toFixed(2)}x
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Decompressed Output */}
            {decompressedText && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Decompressed Output</h3>
                <div className="relative">
                  <Textarea
                    value={decompressedText}
                    readOnly
                    className="min-h-20 font-mono text-sm bg-muted"
                  />
                  <div className="absolute top-2 right-2">
                    {decompressedText === inputText ? (
                      <Badge className="bg-secondary text-secondary-foreground">
                        ✓ Match
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        ✗ No Match
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Visualization Section */}
          <div className="lg:col-span-2 space-y-6">
            {compressionSteps.length > 0 ? (
              <>
                <AlgorithmVisualization steps={compressionSteps} />
                <CompressionStats steps={compressionSteps} />
              </>
            ) : (
              <Card className="p-12 text-center shadow-data">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Transform</h3>
                  <p className="text-muted-foreground mb-6">
                    Enter some text and click "Compress" to see the Burrows-Wheeler Transform in action. 
                    The visualization will show each step of the compression pipeline.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-step-bwt"></div>
                      BWT Transform
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-step-mtf"></div>
                      Move-to-Front
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-step-rle"></div>
                      Run-Length Encoding
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      Final Output
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BWT;