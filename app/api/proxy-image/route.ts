import { NextRequest, NextResponse } from 'next/server'
import { devLog } from '@/lib/devLogger'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    devLog.debug('🖼️ Proxy request received:', { imageUrl, url: request.url }, 'proxy-image')
    
    if (!imageUrl || imageUrl === '' || imageUrl === 'null') {
      logger.error('❌ Invalid image URL:', imageUrl)
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }
    
    // Validate that it's an AstroApp URL for security
    if (!imageUrl.includes('astroapp.com')) {
      logger.error('❌ Invalid image source:', imageUrl)
      return NextResponse.json({ error: 'Invalid image source' }, { status: 400 })
    }
    
    devLog.debug('🖼️ Proxying image:', imageUrl, 'proxy-image')
    
    // Fetch the image from AstroApp
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'FutureSeer-App/1.0',
        'Accept': 'image/*',
      },
    })
    
    if (!response.ok) {
      logger.error('❌ Failed to fetch image:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    devLog.debug('✅ Successfully proxied image:', imageUrl, 'proxy-image')
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
    
  } catch (error) {
    logger.error('❌ Error proxying image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
