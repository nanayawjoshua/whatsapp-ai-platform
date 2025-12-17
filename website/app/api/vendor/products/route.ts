import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase';
import { getVendorFromSession } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vendor/products - List all products for the vendor
 */
export async function GET(request: NextRequest) {
  try {
    const vendorId = await getVendorFromSession(request);
    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    // Get query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error in GET /api/vendor/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/vendor/products - Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    const vendorId = await getVendorFromSession(request);
    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, quantity, image_url, low_stock_threshold } = body;

    // Validation
    if (!name || !price || quantity === undefined) {
      return NextResponse.json(
        { error: 'Name, price, and quantity are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        vendor_id: vendorId,
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        image_url,
        low_stock_threshold: low_stock_threshold || 5,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/vendor/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
