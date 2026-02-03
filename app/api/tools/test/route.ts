import { NextResponse } from 'next/server';
import { toolManager } from '@/lib/services/toolManager';

export async function GET() {
  try {
    const tools = toolManager.getAllTools();
    const categories = toolManager.getCategories();
    const toolsCount = toolManager.getToolsCount();
    const premiumCount = toolManager.getPremiumToolsCount();

    return NextResponse.json({
      success: true,
      data: {
        toolsCount,
        premiumCount,
        categories,
        tools: tools.map(tool => ({
          name: tool.name,
          slug: tool.slug,
          category: tool.category,
          isPremium: tool.isPremium,
          isComingSoon: tool.isComingSoon
        }))
      },
      message: 'Tool management system is working correctly'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Tool management system test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}



