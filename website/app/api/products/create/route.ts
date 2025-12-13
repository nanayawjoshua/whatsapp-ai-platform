import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/products/create
 * BUZZ: Create a new product listing
 *
 * Request body:
 * - vendorId: string (required, vendor UUID)
 * - title: string (required, product name/title)
 * - price: number (required, in Ghana cedis)
 * - category: string (required, product category)
 * - description?: string (optional, product description)
 * - quantity?: number (optional, default 1)
 * - imageUrls?: string[] (optional, array of image URLs)
 * - thumbnailUrl?: string (optional, main product image)
 *
 * Response:
 * - id: string (product UUID)
 * - vendorId: string
 * - title: string
 * - price: number
 * - category: string
 * - quantity: number
 * - status: 'active' | 'sold' | 'removed'
 * - createdAt: string (ISO timestamp)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId,
      title,
      price,
      category,
      description,
      quantity = 1,
      imageUrls = [],
      thumbnailUrl,
    } = body;

    // Validation
    if (!vendorId || typeof vendorId !== 'string') {
      return NextResponse.json(
        { error: 'vendorId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Product title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Verify vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Create product
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        vendor_id: vendorId,
        title: title.trim(),
        description: description?.trim() || null,
        price,
        category: category.trim(),
        quantity: Math.max(1, parseInt(String(quantity)) || 1),
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        thumbnail_url: thumbnailUrl || null,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Product creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    console.log(`✅ Product created: ${product.id} for vendor ${vendorId}`);

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        vendorId: product.vendor_id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        quantity: product.quantity,
        imageUrls: product.image_urls,
        thumbnailUrl: product.thumbnail_url,
        status: product.status,
        listedAt: product.listed_at,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
