# Third-Party Components Documentation

## Overview

This document provides internal team documentation for third-party open-source components integrated into FutureSeer.

## Astrological Calculation Engine

### Source Project
- **Project**: VedAstro
- **Repository**: https://github.com/VedAstro/VedAstro
- **License**: MIT License
- **Integration Date**: 2024

### Components Integrated

#### 1. Nakshatra System
- **Purpose**: 27 lunar mansion calculations
- **Implementation**: `lib/futureSeerAstroService.ts`
- **User Experience**: Nakshatra tab with detailed analysis

#### 2. Shadbala Calculations
- **Purpose**: Six-fold planetary strength analysis
- **Implementation**: `lib/futureSeerAstroService.ts`
- **User Experience**: Strength tab with planetary power ratings

#### 3. Ashtakavarga System
- **Purpose**: Eight-fold house strength analysis
- **Implementation**: `lib/futureSeerAstroService.ts`
- **User Experience**: House strength visualization

#### 4. Panchanga System
- **Purpose**: Daily astrological calendar
- **Implementation**: `lib/futureSeerAstroService.ts`
- **User Experience**: Panchanga tab with daily timings

#### 5. Muhurtha System
- **Purpose**: Auspicious timing calculations
- **Implementation**: `lib/futureSeerAstroService.ts`
- **User Experience**: Muhurtha tab with event timing

#### 6. Dasa/Bhukti System
- **Purpose**: Life period predictions
- **Implementation**: `lib/futureSeerAstroService.ts`
- **User Experience**: Analysis tab with life period details

#### 7. Chart Image Generation
- **Purpose**: Visual chart representations
- **Implementation**: `lib/chartImageService.ts`
- **User Experience**: Divisional, Events, and Tarabala tabs

#### 8. Divisional Charts (D1-D60)
- **Purpose**: Detailed house analysis charts
- **Implementation**: `lib/chartImageService.ts`
- **User Experience**: Divisional tab with multiple chart types

#### 9. Event Prediction System
- **Purpose**: Life event forecasting
- **Implementation**: `lib/chartImageService.ts`
- **User Experience**: Events tab with predicted life events

#### 10. Tarabala System
- **Purpose**: Auspicious timing calculations
- **Implementation**: `lib/chartImageService.ts`
- **User Experience**: Tarabala tab with daily auspicious timings

### Legal Compliance

- ✅ MIT License compliance maintained
- ✅ Attribution included in source code comments
- ✅ No public exposure of external project names
- ✅ Commercial use fully compliant

### Branding Strategy

- **Public Branding**: "FutureSeer Advanced Astrological Engine"
- **Internal Attribution**: Maintained in source code and documentation
- **User Experience**: Clean, professional interface without external references

### Maintenance Notes

- All calculations are branded as FutureSeer features
- Attribution is maintained internally for legal compliance
- No external project names are exposed to users
- Documentation is for internal team reference only

---

**Access Level**: Internal Team Only
**Last Updated**: 2024
**Review Required**: Annual
