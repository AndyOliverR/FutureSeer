/**
 * FutureSeer Brand Reminder System
 * Prevents "sleeping off" on brand consistency
 * Runs before any code changes to enforce brand guidelines
 */

import { devLog } from '@/lib/devLogger';

export class BrandReminder {
  private static instance: BrandReminder
  private reminders: string[] = []

  private constructor() {
    this.initializeReminders()
  }

  static getInstance(): BrandReminder {
    if (!BrandReminder.instance) {
      BrandReminder.instance = new BrandReminder()
    }
    return BrandReminder.instance
  }

  private initializeReminders(): void {
    this.reminders = [
      "🎨 FUTURESEER BRAND COLORS: #1e40af (darkest blue) and #fbbf24 (golden yellow)",
      "❌ FORBIDDEN COLORS: orange, #ff6b6b, #4ecdc4, slate, gray",
      "✅ BUTTONS: bg-blue-600 hover:bg-blue-700 text-white",
      "✅ CARDS: bg-white rounded-lg shadow-lg",
      "✅ TYPOGRAPHY: Arial, sans-serif",
      "🔍 CHECK: Are you using FutureSeer brand colors consistently?",
      "🚨 ALERT: Orange buttons are FORBIDDEN in FutureSeer!",
      "💡 REMINDER: FutureSeer uses glossy, shiny dark blue and gold colors!"
    ]
  }

  /**
   * Get random brand reminder
   */
  getRandomReminder(): string {
    const randomIndex = Math.floor(Math.random() * this.reminders.length)
    return this.reminders[randomIndex]
  }

  /**
   * Get all brand reminders
   */
  getAllReminders(): string[] {
    return [...this.reminders]
  }

  /**
   * Check if code follows brand guidelines
   */
  checkBrandCompliance(code: string): { compliant: boolean; violations: string[] } {
    const violations: string[] = []
    
    // Check for forbidden colors
    const forbiddenColors = ['orange', '#ff6b6b', '#4ecdc4', 'slate', 'gray', '#64748b', '#475569']
    forbiddenColors.forEach(color => {
      if (code.toLowerCase().includes(color.toLowerCase())) {
        violations.push(`❌ Forbidden color "${color}" detected`)
      }
    })

    // Check for missing brand colors
    if (!code.includes('#1e40af') && !code.includes('#fbbf24')) {
      violations.push(`⚠️ Missing FutureSeer brand colors`)
    }

    return {
      compliant: violations.length === 0,
      violations
    }
  }

  /**
   * Get brand-compliant code suggestions
   */
  getBrandSuggestions(): { [key: string]: string } {
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
   * Display brand reminder before code changes
   */
  displayBrandReminder(): void {
    devLog.debug('\n🎨 FUTURESEER BRAND REMINDER:')
    devLog.debug('✅ Primary Color: #1e40af (Darkest Blue)')
    devLog.debug('✅ Secondary Color: #fbbf24 (Golden Yellow)')
    devLog.debug('❌ FORBIDDEN: orange, #ff6b6b, #4ecdc4, slate, gray')
    devLog.debug('💡 Remember: FutureSeer uses glossy, shiny dark blue and gold colors!')
    devLog.debug('')
  }

  /**
   * Validate brand compliance before changes
   */
  validateBeforeChanges(code: string, fileName: string): boolean {
    this.displayBrandReminder()
    
    const compliance = this.checkBrandCompliance(code)
    
    if (!compliance.compliant) {
      devLog.error(`\n🚨 BRAND VIOLATIONS DETECTED in ${fileName}:`, undefined, 'brandReminder')
      compliance.violations.forEach(violation => {
        devLog.error(`   ${violation}`, undefined, 'brandReminder')
      })
      devLog.error('\n💡 Please fix brand violations before proceeding!', undefined, 'brandReminder')
      return false
    }
    
    devLog.debug(`✅ Brand compliance verified for ${fileName}`)
    return true
  }
}

// Export singleton instance
export const brandReminder = BrandReminder.getInstance()
