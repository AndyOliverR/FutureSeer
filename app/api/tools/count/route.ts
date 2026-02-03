import { NextResponse } from 'next/server';
import { toolManager } from '@/lib/services/toolManager';

export async function GET() {
  try {
    const totalTools = toolManager.getToolsCount();
    const premiumTools = toolManager.getPremiumToolsCount();
    const categories = toolManager.getCategories();
    const allTools = toolManager.getAllTools();

    return NextResponse.json({
      success: true,
      data: {
        totalTools,
        premiumTools,
        categories,
        tools: allTools.map(tool => ({
          name: tool.name,
          slug: tool.slug,
          category: tool.category,
          isPremium: tool.isPremium,
          isComingSoon: tool.isComingSoon
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get tools count'
    }, { status: 500 });
  }
}
