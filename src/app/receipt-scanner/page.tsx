
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Camera, Upload, Loader2, Wand2, ArrowRight, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { scanReceipt } from '@/lib/actions';
import type { ScanReceiptOutput } from '@/ai/flows/scan-receipt';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBusiness } from '@/hooks/use-business';
import { useInventory } from '@/hooks/use-inventory';
import type { Supplier } from '@/lib/types';

export default function ReceiptScannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeBranch } = useBusiness();
  const { items, suppliers } = useInventory(activeBranch?.id);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ScanReceiptOutput | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }, []);
  
  useEffect(() => {
    // This effect handles attaching the stream to the video element
    if (isCameraOn && hasCameraPermission && videoRef.current && videoRef.current.srcObject) {
      const video = videoRef.current;
      video.play().catch(err => {
        console.error("Video play failed:", err);
        toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not start the camera feed.' });
      });
    }
  }, [isCameraOn, hasCameraPermission, toast]);

  useEffect(() => {
    // This is a cleanup effect to ensure the camera is stopped when the component unmounts.
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  
  const handleStartCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({ variant: 'destructive', title: 'Camera not supported', description: 'Your browser does not support camera access.' });
        return;
    }
    setScannedImage(null);
    setExtractedData(null);
    setScanError(null);
    stopCamera(); 

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
        setIsCameraOn(true);
    } catch (err) {
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
        });
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        toast({ variant: "destructive", title: "Canvas Error", description: "Could not get rendering context." });
        return;
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setScannedImage(dataUrl);
      stopCamera();
      handleScan(dataUrl);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setScannedImage(dataUrl);
        handleScan(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (imageData: string) => {
    setIsLoading(true);
    setExtractedData(null);
    setScanError(null);
    try {
      const result = await scanReceipt({ receiptImage: imageData });
      setExtractedData(result);
      toast({ title: 'Receipt Scanned Successfully!' });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setScanError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreatePO = () => {
    if (!extractedData) return;

    // Find the best matching supplier
    const lowercasedSupplierName = extractedData.supplierName.toLowerCase();
    const matchedSupplier = (suppliers || []).find(s => s.name.toLowerCase().includes(lowercasedSupplierName));

    const components = items.filter(i => i.itemType === 'Component');

    const prefillData = {
        supplierId: matchedSupplier?.id || null, // Will be handled on the PO page
        supplierName: extractedData.supplierName,
        items: extractedData.lineItems
          .filter(item => item.price >= 0) // Ignore negative price items like promotions
          .map(item => {
            // Find best matching component in inventory
            const lowercasedItemName = item.name.toLowerCase();
            const matchedComponent = components.find(c => c.name.toLowerCase().includes(lowercasedItemName));
            
            return {
                itemId: matchedComponent?.id || null, // Will be handled on PO page as a 'new' item
                itemName: item.name,
                quantity: item.quantity,
                price: item.price,
                isNew: !matchedComponent, // Flag to indicate if this is a new item
            };
        }),
        orderDate: extractedData.transactionDate
    };
    
    sessionStorage.setItem('poPrefillData', JSON.stringify(prefillData));
    router.push('/purchase-orders?fromScanner=true');
  };

  const reset = () => {
    setScannedImage(null);
    setExtractedData(null);
    setScanError(null);
    setHasCameraPermission(null);
    stopCamera();
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="flex flex-col items-center justify-center text-center gap-4 py-12">
          <Wand2 className="h-10 w-10 animate-pulse text-primary" />
          <h3 className="text-xl font-semibold">Scanning Receipt...</h3>
          <p className="text-muted-foreground">The AI is analyzing your receipt. This may take a moment.</p>
        </Card>
      );
    }
    
    if (scanError) {
      return (
        <Card>
          <CardHeader>
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Scan Failed</AlertTitle>
                <AlertDescription>
                    {scanError}
                </AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent>
             {scannedImage && (
                <Image
                    src={scannedImage}
                    alt="Failed receipt scan"
                    width={400}
                    height={600}
                    className="rounded-md mx-auto object-contain max-h-[400px]"
                />
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={reset}><RefreshCw className="mr-2 h-4 w-4"/>Try Again</Button>
          </CardFooter>
        </Card>
      );
    }
    
    if (extractedData) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Information</CardTitle>
            <CardDescription>Review the data scanned from your receipt. You can now create a Purchase Order from this data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <p><strong>Supplier:</strong> {extractedData.supplierName || 'N/A'}</p>
                    <p><strong>Date:</strong> {extractedData.transactionDate || 'N/A'}</p>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {extractedData.lineItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{item.price ? formatCurrency(item.price) : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {extractedData.total && (
                    <div className="text-right font-bold text-lg">
                        Total: {formatCurrency(extractedData.total)}
                    </div>
                )}
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={reset}>Scan Another</Button>
            <Button onClick={handleCreatePO}>Create Purchase Order <ArrowRight className="ml-2 h-4 w-4"/></Button>
          </CardFooter>
        </Card>
      );
    }
    
    if (isCameraOn) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Live Camera Feed</CardTitle>
            <CardDescription>Position your receipt within the frame and capture.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex w-full justify-between">
                <Button variant="ghost" onClick={stopCamera}><X className="mr-2 h-4 w-4"/>Cancel</Button>
                <Button onClick={handleCapture}><Camera className="mr-2 h-4 w-4"/>Capture</Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
        <Card>
          <CardHeader>
            <CardTitle>Scan a New Receipt</CardTitle>
            <CardDescription>Use your camera to take a photo of a receipt or upload an existing image file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={handleStartCamera} className="w-full sm:w-auto">
                <Camera className="mr-2 h-5 w-5" />
                Use Camera
                </Button>
                <div className="text-sm text-muted-foreground">or</div>
                 <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                    <label>
                        <Upload className="mr-2 h-5 w-5" />
                        Upload Image
                        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} />
                    </label>
                </Button>
            </div>
             <Card className="bg-muted/50 border-dashed">
                <CardHeader className="flex-row items-center gap-4">
                     <Image
                      src="https://storage.googleapis.com/static.aiforge.co/misc/receipt-example.png"
                      alt="Example of a good receipt for scanning"
                      width={100}
                      height={150}
                      className="rounded-md border-2 border-border"
                    />
                    <div>
                        <CardTitle className="text-lg">For Best Results</CardTitle>
                        <CardDescription className="mt-1">
                          Use a clear, flat, well-lit image of a standard printed receipt. Avoid handwriting, glare, and strong shadows.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
          </CardContent>
        </Card>
    );
  };

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Smart Receipt Scanner</h1>
          <p className="text-muted-foreground">
            Automatically create purchase orders by scanning your receipts with AI.
          </p>
        </header>
        {renderContent()}
      </div>
    </SidebarLayout>
  );
}
