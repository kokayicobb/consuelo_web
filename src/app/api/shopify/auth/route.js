//src/app/api/shopify/auth/route.js
import { NextResponse } from 'next/server';
import queryString from 'query-string';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");

    if (!shop) {
        return new NextResponse("Missing 'shop' parameter.", { status: 400 });
    }

    const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/shopify/callback`;
    const scopes = process.env.SHOPIFY_SCOPES;
    const apiKey = process.env.SHOPIFY_API_KEY;

    const authorizationUrl = queryString.stringifyUrl({
        url: `https://${shop}/admin/oauth/authorize`,
        query: {
            client_id: apiKey,
            scope: scopes,
            redirect_uri: redirectUri,
        },
    });

    return NextResponse.redirect(authorizationUrl);
}
