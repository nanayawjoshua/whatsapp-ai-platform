import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { getVendorFromSession } from '../../../../../lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vendor/products/[productId] - Get a specific product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const vendorId = await getVendorFromSession(request);
    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', params.productId)
      .eq('vendor_id', vendorId)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error in GET /api/vendor/products/[productId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/vendor/products/[productId] - Update a product
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const vendorId = await getVendorFromSession(request);
    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: any = {};

    // Only update fields that are provided
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = parseFloat(body.price);
    if (body.quantity !== undefined) updates.quantity = parseInt(body.quantity);
    if (body.image_url !== undefined) updates.image_url = body.image_url;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.low_stock_threshold !== undefined) updates.low_stock_threshold = parseInt(body.low_stock_threshold);

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('product_id', params.productId)
      .eq('vendor_id', vendorId)
      .select()
      .single();

    if (error || !product) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error in PATCH /api/vendor/products/[productId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/vendor/products/[productId] - Delete a product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const vendorId = await getVendorFromSession(request);
    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', params.productId)
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/vendor/products/[productId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
