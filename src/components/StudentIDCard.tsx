"use client"

import React, { useState, useRef } from 'react'
import { Camera } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const StudentIDCard = () => {
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  // Image processing function
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) return

          // Calculate aspect ratio of target dimensions (ID card standard)
          const targetRatio = 54 / 85 // Standard ID card ratio (mm)
          
          // Calculate dimensions to maintain aspect ratio
          let targetWidth = img.width
          let targetHeight = img.height
          const imgRatio = img.width / img.height

          if (imgRatio > targetRatio) {
            // Image is wider than needed
            targetWidth = targetHeight * targetRatio
          } else {
            // Image is taller than needed
            targetHeight = targetWidth / targetRatio
          }

          // Set canvas size to desired output size
          canvas.width = 654  // About 3x standard ID card width in pixels
          canvas.height = 1040  // Maintains aspect ratio

          // Create temporary canvas for edge detection
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          tempCanvas.width = img.width
          tempCanvas.height = img.height
          
          if (!tempCtx) return

          // Draw image to temp canvas
          tempCtx.drawImage(img, 0, 0)
          
          // Get image data for edge detection
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
          const edges = detectEdges(imageData)
          
          // Find card boundaries
          const bounds = findCardBoundaries(edges, tempCanvas.width, tempCanvas.height)
          
          // Draw the cropped and processed image
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          // Draw the cropped region to maintain aspect ratio
          ctx.drawImage(
            img,
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
            0,
            0,
            canvas.width,
            canvas.height
          )

          // Apply subtle enhancement
          ctx.filter = 'contrast(1.05) brightness(1.02)'
          ctx.drawImage(canvas, 0, 0)

          resolve(canvas.toDataURL('image/jpeg', 0.95))
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // Helper function to detect edges in image
  const detectEdges = (imageData: ImageData) => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const edges = new Uint8Array(width * height)

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        const surrounding = [
          data[idx - width * 4 - 4],
          data[idx - width * 4],
          data[idx - width * 4 + 4],
          data[idx - 4],
          data[idx + 4],
          data[idx + width * 4 - 4],
          data[idx + width * 4],
          data[idx + width * 4 + 4]
        ]
        
        const center = data[idx]
        let edgeStrength = 0
        
        for (const pixel of surrounding) {
          edgeStrength += Math.abs(center - pixel)
        }
        
        edges[y * width + x] = edgeStrength > 100 ? 255 : 0
      }
    }
    
    return edges
  }

  // Helper function to find card boundaries
  const findCardBoundaries = (edges: Uint8Array, width: number, height: number) => {
    let minX = width
    let maxX = 0
    let minY = height
    let maxY = 0
    
    // Find the bounding box of strong edges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (edges[y * width + x] === 255) {
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y)
        }
      }
    }

    // Add padding
    const padding = 10
    minX = Math.max(0, minX - padding)
    maxX = Math.min(width, maxX + padding)
    minY = Math.max(0, minY - padding)
    maxY = Math.min(height, maxY + padding)

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0]
    if (file) {
      const processedImage = await processImage(file)
      if (side === 'front') {
        setFrontImage(processedImage)
      } else {
        setBackImage(processedImage)
      }
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAddToWallet = () => {
    // This is a placeholder for Apple Wallet integration
    alert('Adding to Apple Wallet feature would be implemented here')
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Image Upload Section */}
      <div className="flex gap-4 mb-4">
        <Button 
          onClick={() => frontInputRef.current?.click()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Take Front Photo
        </Button>
        <Button 
          onClick={() => backInputRef.current?.click()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Take Back Photo
        </Button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={frontInputRef}
          onChange={(e) => handleImageUpload(e, 'front')}
          capture="environment"
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={backInputRef}
          onChange={(e) => handleImageUpload(e, 'back')}
          capture="environment"
        />
      </div>

      {/* Card Display */}
      <Card 
        className="w-80 h-48 cursor-pointer relative"
        onClick={handleFlip}
        style={{
          perspective: '1000px',
        }}
      >
        <div 
          className="w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : '',
          }}
        >
          {/* Front */}
          <CardContent 
            className="absolute w-full h-full"
            style={{
              backfaceVisibility: 'hidden'
            }}
          >
            {frontImage ? (
              <img 
                src={frontImage} 
                alt="ID Front" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                Front of ID
              </div>
            )}
          </CardContent>
          
          {/* Back */}
          <CardContent 
            className="absolute w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {backImage ? (
              <img 
                src={backImage} 
                alt="ID Back" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                Back of ID
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Apple Wallet Button */}
      {frontImage && backImage && (
        <Button 
          onClick={handleAddToWallet}
          className="mt-4"
          variant="default"
        >
          Add to Apple Wallet
        </Button>
      )}
    </div>
  )
}

export default StudentIDCard