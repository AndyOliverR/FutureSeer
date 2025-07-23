// AstroApp API authentication and utility functions

interface AstroAppToken {
  token: string;
  expiresAt: number;
  usageCount: number;
}

// In-memory token cache (in production, you might want to use Redis or database)
let tokenCache: AstroAppToken | null = null;

// Get or refresh JWT token from AstroApp
export async function getAstroAppToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now() && tokenCache.usageCount < 100) {
    tokenCache.usageCount++;
    return tokenCache.token;
  }

  // Clear expired token
  tokenCache = null;

  try {
    const email = process.env.ASTROAPP_EMAIL;
    const password = process.env.ASTROAPP_PASSWORD;
    const apiKey = process.env.ASTROAPP_API_KEY;

    if (!email || !password || !apiKey) {
      throw new Error('Missing AstroApp credentials in environment variables');
    }

    // Log credential status (without exposing actual values)
    console.log('AstroApp credentials status:', {
      email: email ? '✅ Set' : '❌ Missing',
      password: password ? '✅ Set' : '❌ Missing',
      apiKey: apiKey ? '✅ Set' : '❌ Missing',
    });

    // Validate and clean credentials (remove leading/trailing spaces as suggested by support)
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanApiKey = apiKey.trim();

    console.log('AstroApp credentials validation:', {
      emailLength: cleanEmail.length,
      passwordLength: cleanPassword.length,
      apiKeyLength: cleanApiKey.length,
      emailHasSpaces: cleanEmail !== email,
      passwordHasSpaces: cleanPassword !== password,
      apiKeyHasSpaces: cleanApiKey !== apiKey,
    });

    // Create Basic Auth header (Base64 encoded email:password)
    const credentials = Buffer.from(`${cleanEmail}:${cleanPassword}`).toString('base64');

    const response = await fetch('https://astroapp.com/astro/apis/chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'key': cleanApiKey,
      },
      body: JSON.stringify({
        chart: {
          chartData: {
            chartName: "Token Request",
            chartDate: "1990-01-01T12:00:00",
            elevation: 0,
            lat: 40.7128,
            lng: -74.0060,
            elev: 1,
            tz: "America/New_York",
            zodiacID: 100,
            houseSystemID: 1,
            coordSys: "G",
            version: 1
          }
        },
        calcRequestProps: {
          needImage: "N",
          needAspects: "N"
        },
        params: {
          objects: [0, 1] // Sun and Moon only for token request
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AstroApp authentication failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Provide specific error messages based on status code
      if (response.status === 401) {
        throw new Error(`AstroApp authentication failed: Invalid email, password, or API key. Please verify your credentials.`);
      } else if (response.status === 403) {
        throw new Error(`AstroApp access denied: Your account may be suspended or inactive. Please contact AstroApp support.`);
      } else if (response.status === 500) {
        throw new Error(`AstroApp server error: Their servers are experiencing issues. Please try again later.`);
      } else {
        throw new Error(`AstroApp authentication failed: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    
    // AstroApp doesn't return a JWT token - it returns chart data directly
    // We'll use the API key for authentication instead
    if (!data.calcResultsAvailable) {
      console.error('AstroApp response structure:', data);
      throw new Error('AstroApp API returned invalid response. Please check your account status.');
    }

    // Cache the API key as "token" for compatibility
    tokenCache = {
      token: cleanApiKey, // Use API key as token
      expiresAt: Date.now() + (60 * 60 * 1000), // 60 minutes
      usageCount: 1,
    };

    console.log('Successfully authenticated with AstroApp API');
    return cleanApiKey;

  } catch (error) {
    console.error('Error getting AstroApp token:', error);
    throw error;
  }
}

// Get birth chart data using JWT token
export async function getBirthChart(birthDate: string, birthPlace: string = "New York") {
  try {
    const apiKey = process.env.ASTROAPP_API_KEY;
    const email = process.env.ASTROAPP_EMAIL;
    const password = process.env.ASTROAPP_PASSWORD;

    if (!apiKey || !email || !password) {
      throw new Error('Missing AstroApp credentials');
    }

    const cleanApiKey = apiKey.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Parse birth date
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    const hour = 12; // Default to noon if not specified
    const minute = 0;

    // Convert to ISO string format
    const chartDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

    // Create Basic Auth header (Base64 encoded email:password)
    const credentials = Buffer.from(`${cleanEmail}:${cleanPassword}`).toString('base64');

    const response = await fetch('https://astroapp.com/astro/apis/chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'key': cleanApiKey,
      },
      body: JSON.stringify({
        chart: {
          chartData: {
            chartName: "Birth Chart",
            chartDate: chartDate,
            elevation: 0,
            lat: 40.7128, // Default to New York coordinates
            lng: -74.0060,
            elev: 1,
            tz: "America/New_York",
            zodiacID: 100,
            houseSystemID: 1,
            coordSys: "G",
            version: 1
          }
        },
        calcRequestProps: {
          needImage: "N",
          needAspects: "Y"
        },
        params: {
          objects: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15] // All major planets + nodes + Chiron
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AstroApp chart request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Map planet IDs to names and extract relevant data
    const planetNames = {
      0: 'Sun', 1: 'Moon', 2: 'Mercury', 3: 'Venus', 4: 'Mars',
      5: 'Jupiter', 6: 'Saturn', 7: 'Uranus', 8: 'Neptune', 9: 'Pluto',
      10: 'Mean Node', 11: 'True Node', 15: 'Chiron'
    };

    const planets = data.objects?.map((obj: any) => ({
      name: planetNames[obj.id as keyof typeof planetNames] || `Planet ${obj.id}`,
      longitude: obj.lng,
      latitude: obj.lat,
      speed: obj.speed
    })) || [];

    // Extract house cusps
    const houses = data.houseCusps?.map((cusp: number, index: number) => ({
      house: index + 1,
      cusp: cusp
    })) || [];

    // Find Sun, Moon, and Ascendant (house 1 cusp)
    const sun = planets.find((p: any) => p.name === 'Sun');
    const moon = planets.find((p: any) => p.name === 'Moon');
    const ascendant = houses.find((h: any) => h.house === 1);

    // Convert longitude to zodiac sign
    const getZodiacSign = (longitude: number): string => {
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const signIndex = Math.floor(longitude / 30);
      return signs[signIndex] || 'Unknown';
    };

    return {
      sun_sign: sun ? getZodiacSign(sun.longitude) : 'Unknown',
      moon_sign: moon ? getZodiacSign(moon.longitude) : 'Unknown',
      rising_sign: ascendant ? getZodiacSign(ascendant.cusp) : 'Unknown',
      planets: planets,
      houses: houses,
      chart_data: data.chartData
    };

  } catch (error) {
    console.error('Error getting birth chart:', error);
    throw error;
  }
} 