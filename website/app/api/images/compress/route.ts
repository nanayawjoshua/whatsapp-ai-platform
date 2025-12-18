import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

/**
 * POST /api/images/compress
 * Compress and optimize product images
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const vendorId = formData.get('vendorId') as string;

    if (!file || !vendorId) {
      return NextResponse.json(
        { error: 'Image file and vendorId are required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compress image
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    // Upload to Supabase Storage
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;

    // Upload to vendor's folder
    const filePath = `${vendorId}/${uniqueFilename}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, compressedBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      originalSize: buffer.length,
      compressedSize: compressedBuffer.length,
      compressionRatio: ((buffer.length - compressedBuffer.length) / buffer.length * 100).toFixed(1)
    });

  } catch (error: any) {
    console.error('Image compression error:', error);
    return NextResponse.json(
      { error: 'Image processing failed' },
      { status: 500 }
    );
  }
}

// Route segment config for file uploads
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds timeout for image processing