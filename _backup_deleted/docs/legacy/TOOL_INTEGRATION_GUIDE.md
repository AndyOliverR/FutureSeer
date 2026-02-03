# Tool Integration Guide: Using Comprehensive Profile Data

This guide shows how to integrate existing tools with the comprehensive mystical profile data.

## 1. Enhanced Hook Pattern

Create an enhanced version of your tool's hook that uses `useToolData`:

```typescript
// hooks/use-[tool-name]-enhanced.tsx
import { useToolData } from "@/hooks/useToolData";

export function use[ToolName]Enhanced() {
  const { data: comprehensiveData, isLoading, error, refetch } = useToolData('[Tool Name]');
  
  // Legacy state for backward compatibility
  const [legacyData, setLegacyData] = useState(null);
  const [isLegacyLoading, setIsLegacyLoading] = useState(false);
  const [legacyError, setLegacyError] = useState(null);

  // Return comprehensive data if available, otherwise fall back to legacy data
  const toolData = comprehensiveData || legacyData;
  const loading = isLoading || isLegacyLoading;
  const errorMessage = error || legacyError;

  return {
    toolData,
    loading,
    error: errorMessage,
    refetch,
    // Legacy methods for backward compatibility
    ...legacyMethods
  };
}
```

## 2. Enhanced Component Pattern

Update your tool component to handle both comprehensive and legacy data:

```typescript
// components/[ToolName]Enhanced.tsx
export function [ToolName]Enhanced() {
  const { toolData, loading, error, refetch } = use[ToolName]Enhanced();
  
  // Check data type
  const isComprehensiveData = toolData?.comprehensiveField || toolData?.apiData;
  const isLegacyData = toolData?.legacyField || toolData?.userData;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
  if (!toolData) return <NoDataDisplay />;

  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500 text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            {isComprehensiveData ? 'COMPREHENSIVE DATA' : 'LEGACY DATA'}
          </Badge>
          <Badge variant="outline" className="border-blue-500 text-blue-300">
            <Zap className="w-3 h-3 mr-1" />
            {isComprehensiveData ? 'ASTROAPP API' : 'INTERNAL CALCULATION'}
          </Badge>
        </div>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Tool Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Display tool-specific data */}
        </TabsContent>

        <TabsContent value="analysis">
          {/* Display analysis data */}
        </TabsContent>

        <TabsContent value="coaching">
          {/* Link to Ask the Seer */}
          <Button onClick={() => window.location.href = '/ask-the-seer'}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask the Seer
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## 3. Tool-Specific Data Mapping

Each tool should map its comprehensive data appropriately:

### Astrology Tools (Vedic, Western, KP, etc.)
- `planetary_positions` → Planet cards with sign, house, degree
- `charts` → Chart images with high border radius
- `house_analysis` → House interpretation cards
- `personality_analysis` → Life purpose, career guidance
- `remedies` → Gemstone and mantra recommendations

### Numerology Tools
- `life_path` → Life path number and meaning
- `expression_number` → Expression number analysis
- `destiny_number` → Destiny number insights
- `angel_numbers` → Angel number messages

### Divination Tools (Tarot, Runes, I Ching)
- `daily_card` → Daily card display
- `spread` → Card/rune spread layout
- `interpretations` → Reading interpretations
- `guidance` → Personalized guidance

### Physiognomy Tools (Palmistry, Face Reading)
- `palm_analysis` / `face_analysis` → Analysis results
- `life_lines` / `facial_features` → Feature analysis
- `character_traits` → Personality traits
- `predictions` → Future predictions

## 4. Integration Steps

1. **Create Enhanced Hook**: Follow the pattern above
2. **Create Enhanced Component**: Use the component pattern
3. **Update Tool Page**: Replace the old component with the enhanced one
4. **Test Integration**: Verify both comprehensive and legacy data work
5. **Add Ask the Seer Link**: Include coaching tab with link to Ask the Seer

## 5. Example: Palmistry Integration

```typescript
// hooks/use-palmistry-enhanced.tsx
export function usePalmistryEnhanced() {
  const { data: comprehensiveData, isLoading, error, refetch } = useToolData('Palmistry');
  const { palmistryData, loading: legacyLoading, error: legacyError, analyzePalm } = usePalmistryData();
  
  const toolData = comprehensiveData || palmistryData;
  const loading = isLoading || legacyLoading;
  const errorMessage = error || legacyError;

  return {
    palmistryData: toolData,
    loading,
    error: errorMessage,
    refresh: refetch,
    analyzePalm // Legacy method
  };
}
```

## 6. Benefits of This Approach

- **Backward Compatibility**: Existing functionality continues to work
- **Progressive Enhancement**: Tools get better data when available
- **Consistent UX**: All tools follow the same pattern
- **Easy Migration**: Can be done tool by tool
- **Future-Proof**: Easy to add new data sources

## 7. Testing Checklist

- [ ] Tool loads with comprehensive data
- [ ] Tool falls back to legacy data when comprehensive data unavailable
- [ ] Data source indicators show correctly
- [ ] Refresh functionality works
- [ ] Ask the Seer link works
- [ ] All existing functionality preserved
- [ ] Error handling works for both data types
