// File: /src/app/api/shopify/callback/route.js
import crypto from 'crypto';
import axios from 'axios';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client inside the handler to prevent build-time errors
const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

function validateHmac(searchParams, secret) {
  const params = {};
  let hmac;
  
  // Convert searchParams to object and get hmac
  searchParams.forEach((value, key) => {
    if (key === 'hmac') {
      hmac = value;
    } else {
      params[key] = value;
    }
  });

  const orderedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const hash = crypto
    .createHmac('sha256', secret)
    .update(orderedParams)
    .digest('hex');

  return hash === hmac;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const code = searchParams.get('code');
  const hmac = searchParams.get('hmac');
  const host = searchParams.get('host');

  if (!shop || !code) {
    return new NextResponse('Required parameters missing', { status: 400 });
  }

  // Verify HMAC
  const isHmacValid = validateHmac(searchParams, process.env.SHOPIFY_API_SECRET);
  if (!isHmacValid) {
    return new NextResponse('HMAC validation failed', { status: 400 });
  }

  try {
    const tokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenPayload = {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    };

    const tokenResponse = await axios.post(tokenRequestUrl, tokenPayload);
    const { access_token, scope } = tokenResponse.data;

    // Initialize Supabase inside the handler
    const supabase = getSupabase();
    
    // Save the token to Supabase
    const { error } = await supabase
      .from('shop_tokens')
      .upsert({ shop, access_token, scope });

    if (error) {
      console.error('Error saving token to Supabase:', error);
      return new NextResponse('Error saving access token', { status: 500 });
    }

    // Redirect merchant after successful installation
    const redirectUrl = `/?host=${host}&shop=${shop}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Access Token Request Error:', error);
    return new NextResponse('Error while exchanging code for access token', { 
      status: 500 
    });
  }
}