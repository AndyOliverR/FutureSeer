/**
 * Tool Routing Utility
 * Handles routing logic for tools using toolManager data
 * Replaces large switch statements with dynamic routing
 */

import { toolManager } from '@/lib/services/toolManager';

/**
 * Get the route for a tool based on its slug
 * Uses toolManager to check for redirects, then constructs route from slug
 * 
 * @param toolSlug - The slug of the tool to route to
 * @returns The route path for the tool (e.g., '/tools/vedic')
 */
export function getToolRoute(toolSlug: string): string {
  // Get tool configuration from toolManager
  const toolConfig = toolManager.getTool(toolSlug);
  
  // If tool has a redirectTo property, use that instead
  if (toolConfig?.redirectTo) {
    return `/tools/${toolConfig.redirectTo}`;
  }
  
  // Default: construct route from slug
  // Handle special cases where slug doesn't match route exactly
  const routeMap: Record<string, string> = {
    'vedic-astrology': '/tools/vedic',
    'thirteen-signs-zodiac': '/tools/13-signs-zodiac',
    'i-ching': '/tools/iching',
  };
  
  // Check if there's a special mapping
  if (routeMap[toolSlug]) {
    return routeMap[toolSlug];
  }
  
  // Standard route construction
  return `/tools/${toolSlug}`;
}

/**
 * Navigate to a tool page
 * This is a helper function that can be used with Next.js router
 * 
 * @param toolSlug - The slug of the tool to navigate to
 * @param router - Next.js router instance (optional, for direct navigation)
 * @returns The route path (for use with Link components)
 */
export function navigateToTool(toolSlug: string, router?: any): string {
  const route = getToolRoute(toolSlug);
  
  // If router is provided, navigate immediately
  if (router) {
    router.push(route);
  }
  
  return route;
}
