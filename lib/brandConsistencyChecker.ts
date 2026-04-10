/* eslint-disable security/detect-non-literal-regexp */
/**
 * FutureSeer Brand Consistency Checker
 * Automatically enforces brand guidelines before any code changes
 * Prevents "sleeping off" on brand consistency
 */

import { devLog } from '@/lib/devLogger';

export interface BrandViolation {
  type: 'color' | 'typography' | 'spacing' | 'component'
  severity: 'critical' | 'warning' | 'info'
  message: string
  suggestion: string
  file?: string
  line?: number
}

export class BrandConsistencyChecker {
  private brandGuidelines = {
    colors: {
      primary: '#1e40af', // Darkest blue
      secondary: '#fbbf24', // Golden yellow
      gradient: 'linear-gradient(135deg, #1e40af 0%, #fbbf24 100%)',
      forbidden: ['orange', '#ff6b6b', '#4ecdc4', 'slate', 'gray', '#64748b', '#475569']
    },
    typography: {
      font: 'Arial, sans-serif',
      sizes: ['12px', '14px', '16px', '18px', '24px'],
      weights: ['400', '500', '600', '700']
    },
    components: {
      buttons: 'bg-blue-600 hover:bg-blue-700 text-white',
      cards: 'bg-white rounded-lg shadow-lg',
      forms: 'border border-gray-300 rounded-lg'
    }
  }

  /**
   * Check code for brand violations
   */
  checkCode(code: string, fileName: string): BrandViolation[] {
    const violations: BrandViolation[] = []
    
    // Check for forbidden colors
    this.brandGuidelines.colors.forbidden.forEach(forbiddenColor => {
      if (code.toLowerCase().includes(forbiddenColor.toLowerCase())) {
        violations.push({
          type: 'color',
          severity: 'critical',
          message: `❌ FORBIDDEN COLOR DETECTED: "${forbiddenColor}"`,
          suggestion: `Use FutureSeer brand colors: #1e40af (darkest blue) or #fbbf24 (golden yellow)`,
          file: fileName
        })
      }
    })

    // Check for missing brand colors
    if (!code.includes('#1e40af') && !code.includes('#fbbf24')) {
      violations.push({
        type: 'color',
        severity: 'warning',
        message: `⚠️ BRAND COLORS MISSING: No FutureSeer brand colors detected`,
        suggestion: `Add FutureSeer brand colors: #1e40af (darkest blue) and #fbbf24 (golden yellow)`,
        file: fileName
      })
    }

    // Check for orange buttons (common mistake)
    if (code.includes('bg-orange') || code.includes('orange')) {
      violations.push({
        type: 'component',
        severity: 'critical',
        message: `❌ ORANGE BUTTONS DETECTED: Orange is forbidden in FutureSeer`,
        suggestion: `Replace with: bg-blue-600 hover:bg-blue-700 text-white (FutureSeer brand)`,
        file: fileName
      })
    }

    // Check for slate colors
    if (code.includes('slate') || code.includes('#64748b') || code.includes('#475569')) {
      violations.push({
        type: 'color',
        severity: 'critical',
        message: `❌ SLATE COLORS DETECTED: Slate is forbidden in FutureSeer`,
        suggestion: `Replace with: #1e40af (darkest blue) or #fbbf24 (golden yellow)`,
        file: fileName
      })
    }

    return violations
  }

  /**
   * Get brand-compliant alternatives
   */
  getBrandAlternatives(): { [key: string]: string } {
    return {
      'bg-orange-500': 'bg-blue-600',
      'bg-orange-600': 'bg-blue-600',
      'bg-orange-700': 'bg-blue-700',
      'bg-slate-500': 'bg-blue-600',
      'bg-slate-600': 'bg-blue-600',
      'bg-slate-700': 'bg-blue-700',
      'text-orange-500': 'text-yellow-400',
      'text-orange-600': 'text-yellow-400',
      'text-slate-500': 'text-blue-600',
      'text-slate-600': 'text-blue-600',
      'border-orange': 'border-blue-600',
      'border-slate': 'border-blue-600',
      'hover:bg-orange': 'hover:bg-blue-700',
      'hover:bg-slate': 'hover:bg-blue-700'
    }
  }

  /**
   * Auto-fix common brand violations
   */
  autoFixBrandViolations(code: string): string {
    let fixedCode = code
    const alternatives = this.getBrandAlternatives()
    
    Object.entries(alternatives).forEach(([forbidden, replacement]) => {
      const regex = new RegExp(forbidden, 'g')
      fixedCode = fixedCode.replace(regex, replacement)
    })

    return fixedCode
  }

  /**
   * Validate brand compliance
   */
  validateBrandCompliance(code: string, fileName: string): boolean {
    const violations = this.checkCode(code, fileName)
    const criticalViolations = violations.filter(v => v.severity === 'critical')
    
    if (criticalViolations.length > 0) {
      devLog.error(`\n🚨 BRAND COMPLIANCE FAILED for ${fileName}:`, undefined, 'brandConsistencyChecker')
      criticalViolations.forEach(violation => {
        devLog.error(`   ${violation.message}`, undefined, 'brandConsistencyChecker')
        devLog.error(`   💡 ${violation.suggestion}`, undefined, 'brandConsistencyChecker')
      })
      return false
    }
    
    return true
  }

  /**
   * Get FutureSeer brand guidelines
   */
  getBrandGuidelines(): string {
    return `
🎨 FUTURESEER BRAND GUIDELINES:

COLORS (CRITICAL):
✅ Primary: #1e40af (Darkest Blue)
✅ Secondary: #fbbf24 (Golden Yellow)
✅ Gradient: linear-gradient(135deg, #1e40af 0%, #fbbf24 100%)

❌ FORBIDDEN COLORS:
- orange, #ff6b6b, #4ecdc4
- slate, #64748b, #475569
- gray, #6b7280

COMPONENTS:
✅ Buttons: bg-blue-600 hover:bg-blue-700 text-white
✅ Cards: bg-white rounded-lg shadow-lg
✅ Forms: border border-gray-300 rounded-lg

TYPOGRAPHY:
✅ Font: Arial, sans-serif
✅ Sizes: 12px, 14px, 16px, 18px, 24px
✅ Weights: 400, 500, 600, 700

REMEMBER: FutureSeer uses glossy, shiny dark blue and gold colors!
    `.trim()
  }
}

// Export singleton instance
export const brandChecker = new BrandConsistencyChecker()
