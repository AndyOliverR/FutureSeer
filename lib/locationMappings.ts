/**
 * Location Mappings Utility
 * Consolidated location mappings for birth place formatting
 * Removes duplicate mappings and provides a clean lookup function
 */

export const locationMappings: { [key: string]: string } = {
  // India - Major cities with states
  'mysore': 'Mysore, Karnataka, India',
  'bangalore': 'Bangalore, Karnataka, India',
  'bengaluru': 'Bengaluru, Karnataka, India',
  'mumbai': 'Mumbai, Maharashtra, India',
  'delhi': 'Delhi, Delhi, India',
  'chennai': 'Chennai, Tamil Nadu, India',
  'kolkata': 'Kolkata, West Bengal, India',
  'hyderabad': 'Hyderabad, Telangana, India',
  'pune': 'Pune, Maharashtra, India',
  'jaipur': 'Jaipur, Rajasthan, India',
  'lucknow': 'Lucknow, Uttar Pradesh, India',
  'kanpur': 'Kanpur, Uttar Pradesh, India',
  'nagpur': 'Nagpur, Maharashtra, India',
  'indore': 'Indore, Madhya Pradesh, India',
  'thane': 'Thane, Maharashtra, India',
  'bhopal': 'Bhopal, Madhya Pradesh, India',
  'visakhapatnam': 'Visakhapatnam, Andhra Pradesh, India',
  'pimpri': 'Pimpri-Chinchwad, Maharashtra, India',
  'patna': 'Patna, Bihar, India',
  'vadodara': 'Vadodara, Gujarat, India',
  'ghaziabad': 'Ghaziabad, Uttar Pradesh, India',
  'ludhiana': 'Ludhiana, Punjab, India',
  'agra': 'Agra, Uttar Pradesh, India',
  'nashik': 'Nashik, Maharashtra, India',
  'faridabad': 'Faridabad, Haryana, India',
  'meerut': 'Meerut, Uttar Pradesh, India',
  'rajkot': 'Rajkot, Gujarat, India',
  'kalyan': 'Kalyan-Dombivali, Maharashtra, India',
  'vasai': 'Vasai-Virar, Maharashtra, India',
  'varanasi': 'Varanasi, Uttar Pradesh, India',
  'srinagar': 'Srinagar, Jammu and Kashmir, India',
  'aurangabad': 'Aurangabad, Maharashtra, India',
  'dhanbad': 'Dhanbad, Jharkhand, India',
  'amritsar': 'Amritsar, Punjab, India',
  'navi mumbai': 'Navi Mumbai, Maharashtra, India',
  'allahabad': 'Allahabad, Uttar Pradesh, India',
  'prayagraj': 'Prayagraj, Uttar Pradesh, India',
  'howrah': 'Howrah, West Bengal, India',
  'ranchi': 'Ranchi, Jharkhand, India',
  'gwalior': 'Gwalior, Madhya Pradesh, India',
  'jabalpur': 'Jabalpur, Madhya Pradesh, India',
  'coimbatore': 'Coimbatore, Tamil Nadu, India',
  'vijayawada': 'Vijayawada, Andhra Pradesh, India',
  'jodhpur': 'Jodhpur, Rajasthan, India',
  'madurai': 'Madurai, Tamil Nadu, India',
  'raipur': 'Raipur, Chhattisgarh, India',
  'kota': 'Kota, Rajasthan, India',
  'chandigarh': 'Chandigarh, Chandigarh, India',
  'guwahati': 'Guwahati, Assam, India',
  
  // USA - Major cities
  'new york': 'New York, New York, USA',
  'los angeles': 'Los Angeles, California, USA',
  'chicago': 'Chicago, Illinois, USA',
  'houston': 'Houston, Texas, USA',
  'phoenix': 'Phoenix, Arizona, USA',
  'philadelphia': 'Philadelphia, Pennsylvania, USA',
  'san antonio': 'San Antonio, Texas, USA',
  'san diego': 'San Diego, California, USA',
  'dallas': 'Dallas, Texas, USA',
  'san jose': 'San Jose, California, USA',
  'austin': 'Austin, Texas, USA',
  'jacksonville': 'Jacksonville, Florida, USA',
  'san francisco': 'San Francisco, California, USA',
  'columbus': 'Columbus, Ohio, USA',
  'fort worth': 'Fort Worth, Texas, USA',
  'charlotte': 'Charlotte, North Carolina, USA',
  'seattle': 'Seattle, Washington, USA',
  'denver': 'Denver, Colorado, USA',
  'boston': 'Boston, Massachusetts, USA',
  'el paso': 'El Paso, Texas, USA',
  'detroit': 'Detroit, Michigan, USA',
  'nashville': 'Nashville, Tennessee, USA',
  'portland': 'Portland, Oregon, USA',
  'memphis': 'Memphis, Tennessee, USA',
  'oklahoma city': 'Oklahoma City, Oklahoma, USA',
  'las vegas': 'Las Vegas, Nevada, USA',
  'louisville': 'Louisville, Kentucky, USA',
  'baltimore': 'Baltimore, Maryland, USA',
  'milwaukee': 'Milwaukee, Wisconsin, USA',
  'albuquerque': 'Albuquerque, New Mexico, USA',
  'tucson': 'Tucson, Arizona, USA',
  'fresno': 'Fresno, California, USA',
  'sacramento': 'Sacramento, California, USA',
  'kansas city': 'Kansas City, Missouri, USA',
  'mesa': 'Mesa, Arizona, USA',
  'atlanta': 'Atlanta, Georgia, USA',
  'omaha': 'Omaha, Nebraska, USA',
  'colorado springs': 'Colorado Springs, Colorado, USA',
  'raleigh': 'Raleigh, North Carolina, USA',
  'miami': 'Miami, Florida, USA',
  'virginia beach': 'Virginia Beach, Virginia, USA',
  'oakland': 'Oakland, California, USA',
  'minneapolis': 'Minneapolis, Minnesota, USA',
  'tulsa': 'Tulsa, Oklahoma, USA',
  'arlington': 'Arlington, Texas, USA',
  'new orleans': 'New Orleans, Louisiana, USA',
  'wichita': 'Wichita, Kansas, USA',
  
  // UK - Major cities
  'london': 'London, England, United Kingdom',
  'birmingham': 'Birmingham, England, United Kingdom',
  'manchester': 'Manchester, England, United Kingdom',
  'glasgow': 'Glasgow, Scotland, United Kingdom',
  'liverpool': 'Liverpool, England, United Kingdom',
  'leeds': 'Leeds, England, United Kingdom',
  'sheffield': 'Sheffield, England, United Kingdom',
  'edinburgh': 'Edinburgh, Scotland, United Kingdom',
  'bristol': 'Bristol, England, United Kingdom',
  'cardiff': 'Cardiff, Wales, United Kingdom',
  'belfast': 'Belfast, Northern Ireland, United Kingdom',
  'newcastle': 'Newcastle, England, United Kingdom',
  'nottingham': 'Nottingham, England, United Kingdom',
  'leicester': 'Leicester, England, United Kingdom',
  'coventry': 'Coventry, England, United Kingdom',
  'bradford': 'Bradford, England, United Kingdom',
  'stoke': 'Stoke-on-Trent, England, United Kingdom',
  'wolverhampton': 'Wolverhampton, England, United Kingdom',
  'plymouth': 'Plymouth, England, United Kingdom',
  'southampton': 'Southampton, England, United Kingdom',
  'reading': 'Reading, England, United Kingdom',
  'derby': 'Derby, England, United Kingdom',
  'luton': 'Luton, England, United Kingdom',
  'aberdeen': 'Aberdeen, Scotland, United Kingdom',
  'portsmouth': 'Portsmouth, England, United Kingdom',
  'york': 'York, England, United Kingdom',
  'peterborough': 'Peterborough, England, United Kingdom',
  'dundee': 'Dundee, Scotland, United Kingdom',
  'lancaster': 'Lancaster, England, United Kingdom',
  'oxford': 'Oxford, England, United Kingdom',
  'cambridge': 'Cambridge, England, United Kingdom',
  
  // Canada - Major cities
  'toronto': 'Toronto, Ontario, Canada',
  'montreal': 'Montreal, Quebec, Canada',
  'vancouver': 'Vancouver, British Columbia, Canada',
  'calgary': 'Calgary, Alberta, Canada',
  'edmonton': 'Edmonton, Alberta, Canada',
  'ottawa': 'Ottawa, Ontario, Canada',
  'winnipeg': 'Winnipeg, Manitoba, Canada',
  'quebec city': 'Quebec City, Quebec, Canada',
  'hamilton': 'Hamilton, Ontario, Canada',
  'kitchener': 'Kitchener, Ontario, Canada',
  'london ontario': 'London, Ontario, Canada',
  'victoria': 'Victoria, British Columbia, Canada',
  'halifax': 'Halifax, Nova Scotia, Canada',
  'oshawa': 'Oshawa, Ontario, Canada',
  'windsor': 'Windsor, Ontario, Canada',
  'saskatoon': 'Saskatoon, Saskatchewan, Canada',
  'regina': 'Regina, Saskatchewan, Canada',
  'st catharines': 'St. Catharines, Ontario, Canada',
  'barrie': 'Barrie, Ontario, Canada',
  'kelowna': 'Kelowna, British Columbia, Canada',
  'abbotsford': 'Abbotsford, British Columbia, Canada',
  'kingston': 'Kingston, Ontario, Canada',
  'sudbury': 'Sudbury, Ontario, Canada',
  'sherbrooke': 'Sherbrooke, Quebec, Canada',
  'saguenay': 'Saguenay, Quebec, Canada',
  'lévis': 'Lévis, Quebec, Canada',
  'trois-rivières': 'Trois-Rivières, Quebec, Canada',
  'guelph': 'Guelph, Ontario, Canada',
  'cambridge ontario': 'Cambridge, Ontario, Canada',
  'whitby': 'Whitby, Ontario, Canada',
  'saanich': 'Saanich, British Columbia, Canada',
  
  // Australia - Major cities
  'sydney': 'Sydney, New South Wales, Australia',
  'melbourne': 'Melbourne, Victoria, Australia',
  'brisbane': 'Brisbane, Queensland, Australia',
  'perth': 'Perth, Western Australia, Australia',
  'adelaide': 'Adelaide, South Australia, Australia',
  'gold coast': 'Gold Coast, Queensland, Australia',
  'newcastle australia': 'Newcastle, New South Wales, Australia',
  'canberra': 'Canberra, Australian Capital Territory, Australia',
  'sunshine coast': 'Sunshine Coast, Queensland, Australia',
  'wollongong': 'Wollongong, New South Wales, Australia',
  'hobart': 'Hobart, Tasmania, Australia',
  'geelong': 'Geelong, Victoria, Australia',
  'townsville': 'Townsville, Queensland, Australia',
  'cairns': 'Cairns, Queensland, Australia',
  'toowoomba': 'Toowoomba, Queensland, Australia',
  'darwin': 'Darwin, Northern Territory, Australia',
  'ballarat': 'Ballarat, Victoria, Australia',
  'bendigo': 'Bendigo, Victoria, Australia',
  'albury': 'Albury, New South Wales, Australia',
  'launceston': 'Launceston, Tasmania, Australia',
  'mackay': 'Mackay, Queensland, Australia',
  'rockhampton': 'Rockhampton, Queensland, Australia',
  'bundaberg': 'Bundaberg, Queensland, Australia',
  'bunbury': 'Bunbury, Western Australia, Australia',
  'coffs harbour': 'Coffs Harbour, New South Wales, Australia',
  'wagga wagga': 'Wagga Wagga, New South Wales, Australia',
  'hervey bay': 'Hervey Bay, Queensland, Australia',
  'mildura': 'Mildura, Victoria, Australia',
  'shepparton': 'Shepparton, Victoria, Australia',
  'port macquarie': 'Port Macquarie, New South Wales, Australia'
};

/**
 * Format birth place string with location mappings
 * Handles various input formats and enhances with proper City, State, Country format
 */
export function formatBirthPlace(placeString: string): string {
  if (!placeString) return "-";
  
  // Check if it's already in proper format (City, State, Country - 3 parts)
  const parts = placeString.split(',').map(part => part.trim());
  if (parts.length >= 3) {
    return placeString; // Already has City, State, Country
  }
  
  // If it has 2 parts (City, Country), try to enhance with state/region
  if (parts.length === 2) {
    const [city, country] = parts;
    const normalizedCity = city.toLowerCase().trim();
    
    // Try to enhance if it's India and we know the state
    if (country.toLowerCase().includes('india')) {
      const enhanced = locationMappings[normalizedCity];
      if (enhanced) {
        return enhanced;
      }
    }
    
    // If no enhancement found, return original
    return placeString;
  }
  
  // Try to find a match in location mappings (case insensitive)
  const normalizedInput = placeString.toLowerCase().trim();
  const mappedLocation = locationMappings[normalizedInput];
  
  if (mappedLocation) {
    return mappedLocation;
  }
  
  // If no mapping found, try to enhance with common patterns
  if (placeString.toLowerCase().includes('india')) {
    return placeString; // Already includes India
  } else if (/^[a-zA-Z\s]+$/.test(placeString) && !placeString.includes(',')) {
    // Single word/phrase that looks like a city name
    return `${placeString}, India`; // Default to India for single names
  }
  
  // Return as is if no enhancement possible
  return placeString;
}
