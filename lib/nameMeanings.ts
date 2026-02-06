// Name Meanings Database
// Comprehensive dictionary of name meanings, origins, and variations
// References patterns from name analysis research (South Asian and global names)

export interface NameData {
  meaning: string;
  origin?: string; // e.g., "Greek", "Hebrew", "English", "Spanish", "Indian", "Arabic"
  variations?: string[]; // e.g., ["Andrew", "Andreas"]
  culturalContext?: string; // Additional context if relevant
  gender?: 'male' | 'female' | 'unisex'; // Gender association
  countries?: string[]; // Countries where name is popular (ISO country codes or country names)
  popularity?: 'very_common' | 'common' | 'uncommon' | 'rare'; // Popularity level
  frequency?: number; // Popularity count/frequency when available
}

// Comprehensive name meanings dictionary
const NAME_MEANINGS: Record<string, NameData> = {
  // Common First Names - Western
  "ANDY": { 
    meaning: "Manly, warrior", 
    origin: "Greek", 
    variations: ["Andrew", "Andreas", "Andre", "Andrej"]
  },
  "ANDREW": { 
    meaning: "Manly, warrior", 
    origin: "Greek",
    variations: ["Andy", "Andreas", "Andre", "Drew"]
  },
  "OLIVER": { 
    meaning: "Olive tree, peace", 
    origin: "Latin",
    variations: ["Ollie", "Olivier", "Oliviero"]
  },
  "ALEX": {
    meaning: "Defender of mankind",
    origin: "Greek",
    variations: ["Alexander", "Alexandra", "Alexis", "Alec", "Alexandre"]
  },
  "ALEXANDER": {
    meaning: "Defender of mankind",
    origin: "Greek",
    variations: ["Alex", "Alec", "Xander", "Sandro", "Alejandro"]
  },
  "JAMES": {
    meaning: "Supplanter, one who follows",
    origin: "Hebrew",
    variations: ["Jim", "Jimmy", "Jamie", "Diego", "Seamus"]
  },
  "JOHN": {
    meaning: "God is gracious",
    origin: "Hebrew",
    variations: ["Jon", "Johnny", "Jack", "Ian", "Sean", "Juan", "Giovanni"]
  },
  "MICHAEL": {
    meaning: "Who is like God?",
    origin: "Hebrew",
    variations: ["Mike", "Mikey", "Mick", "Miguel", "Michele"]
  },
  "DAVID": {
    meaning: "Beloved, friend",
    origin: "Hebrew",
    variations: ["Dave", "Davey", "Davy", "Dafydd"]
  },
  "ROBERT": {
    meaning: "Bright fame",
    origin: "Germanic",
    variations: ["Bob", "Rob", "Robbie", "Roberto", "Rupert"]
  },
  "WILLIAM": {
    meaning: "Strong-willed warrior",
    origin: "Germanic",
    variations: ["Will", "Bill", "Billy", "Liam", "Guillaume"]
  },
  "JOSEPH": {
    meaning: "God will increase",
    origin: "Hebrew",
    variations: ["Joe", "Joey", "José", "Giuseppe", "Yusuf"]
  },
  "RICHARD": {
    meaning: "Strong ruler, brave power",
    origin: "Germanic",
    variations: ["Rick", "Dick", "Richie", "Ricardo", "Rikard"]
  },
  "THOMAS": {
    meaning: "Twin",
    origin: "Aramaic",
    variations: ["Tom", "Tommy", "Tomas", "Tamas"]
  },
  "CHRISTOPHER": {
    meaning: "Bearer of Christ",
    origin: "Greek",
    variations: ["Chris", "Kit", "Topher", "Cristóbal"]
  },
  "DANIEL": {
    meaning: "God is my judge",
    origin: "Hebrew",
    variations: ["Dan", "Danny", "Daniele", "Daniil"]
  },
  "MATTHEW": {
    meaning: "Gift of God",
    origin: "Hebrew",
    variations: ["Matt", "Matty", "Mateo", "Matthias"]
  },
  "ANTHONY": {
    meaning: "Priceless, highly praiseworthy",
    origin: "Latin",
    variations: ["Tony", "Anton", "Antonio", "Antoine"]
  },
  "MARK": {
    meaning: "Warrior, dedicated to Mars",
    origin: "Latin",
    variations: ["Marc", "Marcus", "Marco", "Marcos"]
  },
  "DONALD": {
    meaning: "World ruler, proud chief",
    origin: "Scottish",
    variations: ["Don", "Donny", "Dónal"]
  },
  "STEVEN": {
    meaning: "Crown, garland",
    origin: "Greek",
    variations: ["Steve", "Stevie", "Stefan", "Esteban", "Stephane"]
  },
  "BRIAN": {
    meaning: "Strong, noble, high",
    origin: "Irish",
    variations: ["Bryan", "Bryant"]
  },
  "KEVIN": {
    meaning: "Handsome, beloved",
    origin: "Irish",
    variations: ["Kev", "Kevan"]
  },
  "GEORGE": {
    meaning: "Farmer, earth worker",
    origin: "Greek",
    variations: ["Georg", "Jorge", "Giorgio", "Georgios"]
  },
  "KENNETH": {
    meaning: "Handsome, born of fire",
    origin: "Scottish",
    variations: ["Ken", "Kenny", "Kendrick"]
  },
  "JOSHUA": {
    meaning: "God is salvation",
    origin: "Hebrew",
    variations: ["Josh", "Josué"]
  },
  "RYAN": {
    meaning: "Little king",
    origin: "Irish",
    variations: ["Rian"]
  },
  "JACOB": {
    meaning: "Supplanter, holder of heel",
    origin: "Hebrew",
    variations: ["Jake", "Jack", "James", "Yaakov"]
  },
  "JASON": {
    meaning: "Healer, to heal",
    origin: "Greek",
    variations: ["Jace", "Jayson"]
  },
  "GARY": {
    meaning: "Spear carrier",
    origin: "Germanic",
    variations: ["Garry"]
  },
  "NICHOLAS": {
    meaning: "Victory of the people",
    origin: "Greek",
    variations: ["Nick", "Nicky", "Nicolas", "Nikolai", "Nico"]
  },
  "ERIC": {
    meaning: "Ever ruler, eternal ruler",
    origin: "Norse",
    variations: ["Erik", "Erick", "Eirik"]
  },
  "STEPHEN": {
    meaning: "Crown, garland",
    origin: "Greek",
    variations: ["Steve", "Stefan", "Étienne", "Esteban"]
  },
  "JONATHAN": {
    meaning: "God has given",
    origin: "Hebrew",
    variations: ["Jon", "Johnny", "Nathan", "Yonatan"]
  },
  "LARRY": {
    meaning: "Laurel, crown",
    origin: "Latin",
    variations: ["Lawrence", "Lars", "Lorenzo"]
  },
  "JEFFREY": {
    meaning: "Divine peace",
    origin: "Germanic",
    variations: ["Jeff", "Geoffrey", "Geoff"]
  },
  "FRANK": {
    meaning: "Free man",
    origin: "Germanic",
    variations: ["Francis", "Franklin", "François", "Francesco"]
  },
  "SCOTT": {
    meaning: "From Scotland",
    origin: "English",
    variations: ["Scot"]
  },
  "BRANDON": {
    meaning: "Broom hill, beacon hill",
    origin: "English",
    variations: ["Brendan", "Brant"]
  },
  "BENJAMIN": {
    meaning: "Son of the right hand",
    origin: "Hebrew",
    variations: ["Ben", "Benny", "Benito", "Binyamin"]
  },
  "SAMUEL": {
    meaning: "God has heard, name of God",
    origin: "Hebrew",
    variations: ["Sam", "Sammy", "Samuele"]
  },
  "GREGORY": {
    meaning: "Watchful, alert",
    origin: "Greek",
    variations: ["Greg", "Gregg", "Grigor", "Grégoire"]
  },
  "RAYMOND": {
    meaning: "Wise protector",
    origin: "Germanic",
    variations: ["Ray", "Ramon", "Raimundo"]
  },
  "PATRICK": {
    meaning: "Noble, patrician",
    origin: "Latin",
    variations: ["Pat", "Paddy", "Padraig", "Patricio"]
  },
  "JACK": {
    meaning: "God is gracious (variant of John)",
    origin: "Hebrew",
    variations: ["John", "Johnny", "Jacques"]
  },
  "DENNIS": {
    meaning: "Follower of Dionysus",
    origin: "Greek",
    variations: ["Denny", "Denis", "Dionysius"]
  },
  "JERRY": {
    meaning: "Spear ruler",
    origin: "Germanic",
    variations: ["Jeremiah", "Jeremy", "Gerald"]
  },
  "TYLER": {
    meaning: "Tile maker, tile layer",
    origin: "English",
    variations: ["Tylor"]
  },
  "AARON": {
    meaning: "High mountain, exalted",
    origin: "Hebrew",
    variations: ["Aron", "Aharon"]
  },
  "JOSE": {
    meaning: "God will increase",
    origin: "Hebrew/Spanish",
    variations: ["Joseph", "José", "Pepe"]
  },
  "ADAM": {
    meaning: "Man, earth, red",
    origin: "Hebrew",
    variations: ["Adám"]
  },
  "HENRY": {
    meaning: "Ruler of the home",
    origin: "Germanic",
    variations: ["Harry", "Hank", "Henri", "Enrique"]
  },
  "DOUGLAS": {
    meaning: "Dark river, dark stream",
    origin: "Scottish",
    variations: ["Doug", "Dougie"]
  },
  "NATHAN": {
    meaning: "He gave, gift",
    origin: "Hebrew",
    variations: ["Nate", "Nathaniel", "Nat"]
  },
  "ZACHARY": {
    meaning: "God remembers",
    origin: "Hebrew",
    variations: ["Zach", "Zack", "Zak", "Zachariah"]
  },
  "KYLE": {
    meaning: "Narrow channel, strait",
    origin: "Scottish",
    variations: ["Kile"]
  },
  "NOAH": {
    meaning: "Rest, comfort",
    origin: "Hebrew",
    variations: ["Noe"]
  },
  "DYLAN": {
    meaning: "Son of the sea",
    origin: "Welsh",
    variations: ["Dillan", "Dillon"]
  },
  "JUSTIN": {
    meaning: "Just, fair",
    origin: "Latin",
    variations: ["Justus", "Giustino"]
  },
  "GABRIEL": {
    meaning: "God is my strength",
    origin: "Hebrew",
    variations: ["Gabe", "Gabriel", "Gavriel"]
  },
  "CARL": {
    meaning: "Free man",
    origin: "Germanic",
    variations: ["Charles", "Karl", "Carlos", "Carlo"]
  },
  "LOUIS": {
    meaning: "Famous warrior",
    origin: "Germanic",
    variations: ["Lou", "Lewis", "Luis", "Ludwig"]
  },
  "JEREMY": {
    meaning: "God will uplift",
    origin: "Hebrew",
    variations: ["Jeremiah", "Jerry", "Jérémy"]
  },
  "ALBERT": {
    meaning: "Noble, bright",
    origin: "Germanic",
    variations: ["Al", "Bert", "Alberto", "Albrecht"]
  },
  "BRADLEY": {
    meaning: "Broad clearing",
    origin: "English",
    variations: ["Brad"]
  },
  "JESSE": {
    meaning: "Gift, wealth",
    origin: "Hebrew",
    variations: ["Jess"]
  },
  "BILLY": {
    meaning: "Strong-willed warrior (variant of William)",
    origin: "Germanic",
    variations: ["Will", "Bill", "William"]
  },
  "JORDAN": {
    meaning: "To flow down, descend",
    origin: "Hebrew",
    variations: ["Jorden", "Jordyn"]
  },
  "BERNARD": {
    meaning: "Strong, brave bear",
    origin: "Germanic",
    variations: ["Bernie", "Bernardo"]
  },
  "RALPH": {
    meaning: "Wolf counsel",
    origin: "Germanic",
    variations: ["Rolf", "Raoul"]
  },
  "ROY": {
    meaning: "King",
    origin: "French",
    variations: ["Roi"]
  },
  "EUGENE": {
    meaning: "Well-born, noble",
    origin: "Greek",
    variations: ["Gene", "Eugenio", "Eugène"]
  },
  "WAYNE": {
    meaning: "Wagon maker, cartwright",
    origin: "English",
    variations: ["Wain"]
  },
  "ALAN": {
    meaning: "Handsome, cheerful",
    origin: "Celtic",
    variations: ["Allen", "Allan", "Alain", "Ailín"]
  },
  "JUAN": {
    meaning: "God is gracious",
    origin: "Hebrew/Spanish",
    variations: ["John", "Giovanni", "Jean", "Ivan"]
  },
  "HOWARD": {
    meaning: "High guardian, heart brave",
    origin: "English",
    variations: ["Howie"]
  },
  "JOHNNY": {
    meaning: "God is gracious (variant of John)",
    origin: "Hebrew",
    variations: ["John", "Johnnie", "Jonny"]
  },
  "ARTHUR": {
    meaning: "Bear, stone",
    origin: "Celtic",
    variations: ["Art", "Arturo", "Artur"]
  },
  "LAWRENCE": {
    meaning: "Laurel, crowned with laurel",
    origin: "Latin",
    variations: ["Larry", "Lars", "Lorenzo", "Laurent"]
  },
  "ROGER": {
    meaning: "Famous spear",
    origin: "Germanic",
    variations: ["Rodge", "Rodger", "Rüdiger"]
  },
  "CHRISTIAN": {
    meaning: "Follower of Christ",
    origin: "Latin",
    variations: ["Chris", "Christiano", "Kristian"]
  },
  "SEAN": {
    meaning: "God is gracious (Irish form of John)",
    origin: "Hebrew/Irish",
    variations: ["John", "Shaun", "Shane"]
  },
  "TERRY": {
    meaning: "Power of the tribe",
    origin: "Germanic",
    variations: ["Terence", "Terrence", "Terry"]
  },
  "GERALD": {
    meaning: "Ruler with spear",
    origin: "Germanic",
    variations: ["Jerry", "Gerry", "Gerardo"]
  },
  "HAROLD": {
    meaning: "Army ruler",
    origin: "Norse",
    variations: ["Hal", "Harry", "Harald"]
  },

  // Common Surnames - Western
  "ROZARIO": {
    meaning: "Rose garden, rosary",
    origin: "Spanish/Portuguese",
    culturalContext: "Often associated with Christian devotion, particularly the rosary"
  },
  "SMITH": {
    meaning: "Metal worker, blacksmith",
    origin: "English",
    variations: ["Smyth", "Schmidt"]
  },
  "JOHNSON": {
    meaning: "Son of John",
    origin: "English",
    variations: ["Johnsen", "Jonsson"]
  },
  "WILLIAMS": {
    meaning: "Son of William",
    origin: "English",
    variations: ["Williamson"]
  },
  "BROWN": {
    meaning: "Brown-haired, brown-skinned",
    origin: "English",
    variations: ["Browne", "Braun"]
  },
  "JONES": {
    meaning: "Son of John",
    origin: "English",
    variations: ["Johns"]
  },
  "GARCIA": {
    meaning: "Bear, brave warrior",
    origin: "Spanish",
    variations: ["García"]
  },
  "MILLER": {
    meaning: "Grain miller",
    origin: "English",
    variations: ["Müller", "Mills"]
  },
  "DAVIS": {
    meaning: "Son of David",
    origin: "English",
    variations: ["Davies", "Davidson"]
  },
  "RODRIGUEZ": {
    meaning: "Son of Rodrigo (famous ruler)",
    origin: "Spanish",
    variations: ["Rodrigues", "Rodríguez"]
  },
  "MARTINEZ": {
    meaning: "Son of Martin (warrior of Mars)",
    origin: "Spanish",
    variations: ["Martínez"]
  },
  "HERNANDEZ": {
    meaning: "Son of Hernando (adventurous)",
    origin: "Spanish",
    variations: ["Hernández"]
  },
  "LOPEZ": {
    meaning: "Son of Lope (wolf)",
    origin: "Spanish",
    variations: ["López"]
  },
  "WILSON": {
    meaning: "Son of William",
    origin: "English",
    variations: ["Williamson"]
  },
  "ANDERSON": {
    meaning: "Son of Andrew",
    origin: "English/Scottish",
    variations: ["Andersson"]
  },
  "TAYLOR": {
    meaning: "Tailor, clothing maker",
    origin: "English",
    variations: ["Tailor"]
  },
  "MOORE": {
    meaning: "Moor, dark-skinned",
    origin: "English",
    variations: ["More", "Muir"]
  },
  "JACKSON": {
    meaning: "Son of Jack",
    origin: "English",
    variations: ["Jakson"]
  },
  "MARTIN": {
    meaning: "Warrior of Mars",
    origin: "Latin",
    variations: ["Martín", "Martine"]
  },
  "LEE": {
    meaning: "Meadow, clearing",
    origin: "English/Chinese",
    variations: ["Leigh", "Li"]
  },
  "THOMPSON": {
    meaning: "Son of Thomas",
    origin: "English",
    variations: ["Thomson"]
  },
  "WHITE": {
    meaning: "White-haired, fair",
    origin: "English",
    variations: ["Whyte"]
  },
  "HARRIS": {
    meaning: "Son of Harry",
    origin: "English",
    variations: ["Harrison"]
  },
  "SANCHEZ": {
    meaning: "Son of Sancho (holy)",
    origin: "Spanish",
    variations: ["Sánchez"]
  },
  "CLARK": {
    meaning: "Clerk, scholar",
    origin: "English",
    variations: ["Clarke"]
  },
  "LEWIS": {
    meaning: "Famous warrior",
    origin: "Germanic",
    variations: ["Louis", "Luis"]
  },
  "ROBINSON": {
    meaning: "Son of Robin",
    origin: "English",
    variations: ["Robson"]
  },
  "WALKER": {
    meaning: "Cloth walker, fuller",
    origin: "English",
    variations: []
  },
  "YOUNG": {
    meaning: "Young person",
    origin: "English",
    variations: ["Younge"]
  },
  "ALLEN": {
    meaning: "Handsome, cheerful",
    origin: "Celtic",
    variations: ["Alan", "Allan", "Alain"]
  },
  "KING": {
    meaning: "King, ruler",
    origin: "English",
    variations: ["König"]
  },
  "WRIGHT": {
    meaning: "Craftsman, maker",
    origin: "English",
    variations: ["Rite"]
  },
  "TORRES": {
    meaning: "Towers",
    origin: "Spanish",
    variations: ["Torrez"]
  },
  "NGUYEN": {
    meaning: "Original, first",
    origin: "Vietnamese",
    variations: []
  },
  "HILL": {
    meaning: "Dweller on a hill",
    origin: "English",
    variations: ["Hills"]
  },
  "FLORES": {
    meaning: "Flowers",
    origin: "Spanish",
    variations: ["Florez"]
  },
  "GREEN": {
    meaning: "Green, verdant",
    origin: "English",
    variations: ["Greene"]
  },
  "ADAMS": {
    meaning: "Son of Adam",
    origin: "Hebrew/English",
    variations: ["Adamson"]
  },
  "NELSON": {
    meaning: "Son of Neil",
    origin: "English",
    variations: ["Neilson"]
  },
  "BAKER": {
    meaning: "Baker, bread maker",
    origin: "English",
    variations: ["Bakker"]
  },
  "HALL": {
    meaning: "Hall, large room",
    origin: "English",
    variations: ["Halls"]
  },
  "RIVERA": {
    meaning: "River, stream",
    origin: "Spanish",
    variations: []
  },
  "CAMPBELL": {
    meaning: "Crooked mouth",
    origin: "Scottish",
    variations: ["Campball"]
  },
  "MITCHELL": {
    meaning: "Who is like God?",
    origin: "Hebrew/English",
    variations: ["Mitchel"]
  },
  "CARTER": {
    meaning: "Cart driver, transporter",
    origin: "English",
    variations: ["Carter"]
  },
  "ROBERTS": {
    meaning: "Son of Robert",
    origin: "English",
    variations: ["Robertson"]
  },
  "GOMEZ": {
    meaning: "Man",
    origin: "Spanish",
    variations: ["Gómez"]
  },
  "PHILLIPS": {
    meaning: "Son of Philip (lover of horses)",
    origin: "Greek/English",
    variations: ["Philipps"]
  },
  "EVANS": {
    meaning: "Son of Evan",
    origin: "Welsh",
    variations: ["Evens"]
  },
  "TURNER": {
    meaning: "Lathe worker, turner",
    origin: "English",
    variations: []
  },
  "DIAZ": {
    meaning: "Son of Diego (supplanter)",
    origin: "Spanish",
    variations: ["Díaz"]
  },
  "PARKER": {
    meaning: "Park keeper",
    origin: "English",
    variations: []
  },
  "CRUZ": {
    meaning: "Cross",
    origin: "Spanish/Portuguese",
    variations: ["Cruz"]
  },
  "EDWARDS": {
    meaning: "Son of Edward (wealthy guardian)",
    origin: "English",
    variations: ["Edwardson"]
  },
  "COLLINS": {
    meaning: "Son of Colin (young creature)",
    origin: "English",
    variations: ["Collin"]
  },
  "REYES": {
    meaning: "Kings",
    origin: "Spanish",
    variations: ["Reyes"]
  },
  "STEWART": {
    meaning: "Steward, household guardian",
    origin: "Scottish",
    variations: ["Stuart", "Steward"]
  },
  "MORRIS": {
    meaning: "Dark-skinned, Moorish",
    origin: "English",
    variations: ["Morris", "Morrison"]
  },
  "ROGERS": {
    meaning: "Son of Roger",
    origin: "English",
    variations: ["Rodgers"]
  },
  "REED": {
    meaning: "Red-haired, reed",
    origin: "English",
    variations: ["Reid", "Read"]
  },
  "COOK": {
    meaning: "Cook, kitchen worker",
    origin: "English",
    variations: ["Cooke"]
  },
  "MORGAN": {
    meaning: "Sea circle, sea defender",
    origin: "Welsh",
    variations: ["Morgen"]
  },
  "BELL": {
    meaning: "Bell ringer, bell maker",
    origin: "English",
    variations: ["Belle"]
  },
  "MURPHY": {
    meaning: "Sea warrior",
    origin: "Irish",
    variations: ["Murphey"]
  },
  "BAILEY": {
    meaning: "Bailiff, steward",
    origin: "English",
    variations: ["Bailey", "Bayley"]
  },
  "COOPER": {
    meaning: "Barrel maker",
    origin: "English",
    variations: ["Couper"]
  },
  "RICHARDSON": {
    meaning: "Son of Richard",
    origin: "English",
    variations: ["Richards"]
  },
  "COX": {
    meaning: "Cock, rooster",
    origin: "English",
    variations: ["Cocks"]
  },
  "WARD": {
    meaning: "Guardian, watchman",
    origin: "English",
    variations: ["Warde"]
  },
  "PETERSON": {
    meaning: "Son of Peter (rock)",
    origin: "Greek/English",
    variations: ["Petersen", "Peters"]
  },
  "GRAY": {
    meaning: "Gray-haired",
    origin: "English",
    variations: ["Grey"]
  },
  "RAMIREZ": {
    meaning: "Son of Ramiro (wise counselor)",
    origin: "Spanish",
    variations: ["Ramírez"]
  },
  "WATSON": {
    meaning: "Son of Walter (ruler of the army)",
    origin: "English",
    variations: ["Wattson"]
  },
  "BROOKS": {
    meaning: "Dweller by the brook",
    origin: "English",
    variations: ["Brook"]
  },
  "KELLY": {
    meaning: "War, strife",
    origin: "Irish",
    variations: ["Kelley"]
  },
  "SANDERS": {
    meaning: "Son of Alexander",
    origin: "Greek/English",
    variations: ["Saunders"]
  },
  "PRICE": {
    meaning: "Son of Rhys (enthusiasm)",
    origin: "Welsh",
    variations: ["Pryce"]
  },
  "BENNETT": {
    meaning: "Blessed",
    origin: "Latin/English",
    variations: ["Bennet", "Benedict"]
  },
  "WOOD": {
    meaning: "Dweller in the woods",
    origin: "English",
    variations: ["Woods"]
  },
  "BARNES": {
    meaning: "Son of Barnaby, dweller by the barn",
    origin: "English",
    variations: ["Barns"]
  },
  "ROSS": {
    meaning: "Headland, promontory",
    origin: "Scottish",
    variations: ["Ros"]
  },
  "HENDERSON": {
    meaning: "Son of Henry",
    origin: "English",
    variations: ["Henrikson"]
  },
  "COLEMAN": {
    meaning: "Charcoal burner, dove",
    origin: "English",
    variations: ["Colman"]
  },
  "JENKINS": {
    meaning: "Little John",
    origin: "Welsh",
    variations: ["Jenkinson"]
  },
  "PERRY": {
    meaning: "Pear tree",
    origin: "English",
    variations: ["Perrie"]
  },
  "POWELL": {
    meaning: "Son of Hywel (eminent)",
    origin: "Welsh",
    variations: ["Power"]
  },
  "LONG": {
    meaning: "Tall person",
    origin: "English",
    variations: ["Longe"]
  },
  "PATTERSON": {
    meaning: "Son of Patrick",
    origin: "Latin/English",
    variations: ["Paterson"]
  },
  "HUGHES": {
    meaning: "Son of Hugh (heart, mind, spirit)",
    origin: "Germanic/English",
    variations: ["Hughes"]
  },
  "WASHINGTON": {
    meaning: "Town of the wise",
    origin: "English",
    variations: []
  },
  "BUTLER": {
    meaning: "Butler, wine steward",
    origin: "English",
    variations: ["Buttler"]
  },
  "SIMMONS": {
    meaning: "Son of Simon (listening)",
    origin: "Hebrew/English",
    variations: ["Simons", "Symons"]
  },
  "FOSTER": {
    meaning: "Foster parent, forest keeper",
    origin: "English",
    variations: ["Forster"]
  },
  "GONZALES": {
    meaning: "Son of Gonzalo (war, battle)",
    origin: "Spanish",
    variations: ["González", "Gonzalez"]
  },
  "BRYANT": {
    meaning: "Strong, noble",
    origin: "Irish",
    variations: ["Briant", "Brian"]
  },
  "RUSSELL": {
    meaning: "Red-haired, fox-colored",
    origin: "French/English",
    variations: ["Russel"]
  },
  "GRIFFIN": {
    meaning: "Strong lord",
    origin: "Welsh",
    variations: ["Griffith", "Gryphon"]
  },
  "HAYES": {
    meaning: "Hedge, enclosure",
    origin: "English",
    variations: ["Hay"]
  },

  // South Asian Names - First Names
  "ARJUN": {
    meaning: "White, clear, bright",
    origin: "Sanskrit",
    culturalContext: "Hero of the Mahabharata, warrior prince"
  },
  "RAJ": {
    meaning: "King, ruler",
    origin: "Sanskrit",
    variations: ["Raja", "Rajesh", "Rajan"]
  },
  "RAVI": {
    meaning: "Sun",
    origin: "Sanskrit",
    variations: ["Ravee"]
  },
  "ANAND": {
    meaning: "Happiness, bliss",
    origin: "Sanskrit",
    variations: ["Ananda"]
  },
  "AMIT": {
    meaning: "Infinite, immeasurable",
    origin: "Sanskrit",
    variations: ["Amitabh"]
  },
  "VIVEK": {
    meaning: "Wisdom, discrimination",
    origin: "Sanskrit",
    variations: ["Vivekananda"]
  },
  "KARAN": {
    meaning: "Hero, warrior",
    origin: "Sanskrit",
    variations: ["Karna"]
  },
  "NIKHIL": {
    meaning: "Complete, whole",
    origin: "Sanskrit",
    variations: ["Nikhilesh"]
  },
  "ROHAN": {
    meaning: "Ascending, growing",
    origin: "Sanskrit",
    variations: ["Rohit"]
  },
  "ADITYA": {
    meaning: "Sun, son of Aditi",
    origin: "Sanskrit",
    variations: ["Adi"]
  },
  "SIDDHARTH": {
    meaning: "One who has achieved his goals",
    origin: "Sanskrit",
    culturalContext: "Also the name of Buddha"
  },
  "VARUN": {
    meaning: "God of water, ocean",
    origin: "Sanskrit",
    variations: ["Varuna"]
  },
  "AYUSH": {
    meaning: "Long life, lifespan",
    origin: "Sanskrit",
    variations: ["Ayushman"]
  },
  "ARNAV": {
    meaning: "Ocean, sea",
    origin: "Sanskrit",
    variations: ["Arnav"]
  },
  "KRISHNA": {
    meaning: "Dark, black, attractive",
    origin: "Sanskrit",
    culturalContext: "Divine name, refers to Lord Krishna"
  },
  "SHIVA": {
    meaning: "Auspicious, benevolent",
    origin: "Sanskrit",
    culturalContext: "Divine name, refers to Lord Shiva"
  },
  "VIKRAM": {
    meaning: "Valor, prowess",
    origin: "Sanskrit",
    variations: ["Vikramaditya"]
  },
  "AMITABH": {
    meaning: "Infinite radiance",
    origin: "Sanskrit",
    variations: ["Amit"]
  },
  "RAHUL": {
    meaning: "Able, efficient",
    origin: "Sanskrit",
    variations: ["Rahul"]
  },
  "PRANAV": {
    meaning: "Sacred syllable OM",
    origin: "Sanskrit",
    variations: ["Pranava"]
  },
  "SHREYAS": {
    meaning: "Superior, excellent",
    origin: "Sanskrit",
    variations: ["Shrey"]
  },
  "AKASH": {
    meaning: "Sky, space",
    origin: "Sanskrit",
    variations: ["Akasha"]
  },
  "DEV": {
    meaning: "God, deity",
    origin: "Sanskrit",
    variations: ["Deva", "Devendra"]
  },
  "ISHAN": {
    meaning: "Lord Shiva, sun",
    origin: "Sanskrit",
    variations: ["Ishaan"]
  },
  "MANAV": {
    meaning: "Human, man",
    origin: "Sanskrit",
    variations: ["Manav"]
  },
  "NEEL": {
    meaning: "Blue, sapphire",
    origin: "Sanskrit",
    variations: ["Neelam"]
  },
  "OM": {
    meaning: "Sacred syllable, the divine",
    origin: "Sanskrit",
    culturalContext: "Most sacred sound in Hinduism"
  },
  "PRITHVI": {
    meaning: "Earth",
    origin: "Sanskrit",
    variations: ["Prithvi"]
  },
  "RUDRA": {
    meaning: "Roarer, howler",
    origin: "Sanskrit",
    culturalContext: "Name of Lord Shiva"
  },
  "SAHIL": {
    meaning: "Shore, guide",
    origin: "Sanskrit",
    variations: ["Sahil"]
  },
  "TANISH": {
    meaning: "Ambition",
    origin: "Sanskrit",
    variations: ["Tanishq"]
  },
  "YASH": {
    meaning: "Fame, glory",
    origin: "Sanskrit",
    variations: ["Yashwant"]
  },
  "ZAID": {
    meaning: "Growth, abundance",
    origin: "Arabic",
    variations: ["Zayd"]
  },
  "AARAV": {
    meaning: "Peaceful, calm",
    origin: "Sanskrit",
    variations: ["Aarav"]
  },
  "ADVAIT": {
    meaning: "Unique, non-dual",
    origin: "Sanskrit",
    variations: ["Advaita"]
  },
  "ARYAN": {
    meaning: "Noble, warrior",
    origin: "Sanskrit",
    variations: ["Arya"]
  },
  "DHAIRYA": {
    meaning: "Patience, courage",
    origin: "Sanskrit",
    variations: ["Dhairya"]
  },
  "GAURAV": {
    meaning: "Pride, honor",
    origin: "Sanskrit",
    variations: ["Gaurav"]
  },
  "HARSH": {
    meaning: "Joy, happiness",
    origin: "Sanskrit",
    variations: ["Harsh"]
  },
  "JAY": {
    meaning: "Victory",
    origin: "Sanskrit",
    variations: ["Jay", "Jaya"]
  },
  "KABIR": {
    meaning: "Great, powerful",
    origin: "Arabic",
    culturalContext: "Also refers to the saint poet Kabir"
  },
  "MOHIT": {
    meaning: "Attracted, charmed",
    origin: "Sanskrit",
    variations: ["Mohit"]
  },
  "NISHANT": {
    meaning: "End of night, dawn",
    origin: "Sanskrit",
    variations: ["Nishant"]
  },
  "PARTH": {
    meaning: "Arjuna, warrior",
    origin: "Sanskrit",
    variations: ["Parth"]
  },
  "RISHABH": {
    meaning: "Bull, best",
    origin: "Sanskrit",
    variations: ["Rishabh"]
  },
  "SAURABH": {
    meaning: "Fragrance, pleasant smell",
    origin: "Sanskrit",
    variations: ["Saurabh"]
  },
  "SHIVAM": {
    meaning: "Auspicious, pure",
    origin: "Sanskrit",
    variations: ["Shivam"]
  },
  "SUMIT": {
    meaning: "Well-measured, good friend",
    origin: "Sanskrit",
    variations: ["Sumit"]
  },
  "TARUN": {
    meaning: "Young, youth",
    origin: "Sanskrit",
    variations: ["Tarun"]
  },
  "UTKARSH": {
    meaning: "Excellent, superior",
    origin: "Sanskrit",
    variations: ["Utkarsh"]
  },
  "VAIBHAV": {
    meaning: "Prosperity, wealth",
    origin: "Sanskrit",
    variations: ["Vaibhav"]
  },
  "VED": {
    meaning: "Sacred knowledge",
    origin: "Sanskrit",
    variations: ["Vedant"]
  },
  "YUVRAJ": {
    meaning: "Prince, heir",
    origin: "Sanskrit",
    variations: ["Yuva", "Yuvraj"]
  },
  "ZAIN": {
    meaning: "Beauty, grace",
    origin: "Arabic",
    variations: ["Zayn"]
  },

  // South Asian Surnames
  "KUMAR": {
    meaning: "Prince, son",
    origin: "Sanskrit",
    culturalContext: "Common surname meaning 'son of'"
  },
  "SINGH": {
    meaning: "Lion",
    origin: "Sanskrit",
    culturalContext: "Traditionally used by Sikhs and some Hindu communities"
  },
  "SHARMA": {
    meaning: "Joy, comfort",
    origin: "Sanskrit",
    culturalContext: "Brahmin surname"
  },
  "PATEL": {
    meaning: "Village headman",
    origin: "Gujarati",
    culturalContext: "Common Gujarati surname"
  },
  "GUPTA": {
    meaning: "Protected, secret",
    origin: "Sanskrit",
    culturalContext: "Common surname across India"
  },
  "REDDY": {
    meaning: "Head, leader",
    origin: "Telugu",
    culturalContext: "Common Telugu surname"
  },
  "RAO": {
    meaning: "King, ruler",
    origin: "Sanskrit/Telugu",
    variations: ["Rau"]
  },
  "DESAI": {
    meaning: "Village headman",
    origin: "Gujarati",
    variations: ["Desai"]
  },
  "JHA": {
    meaning: "Teacher, learned",
    origin: "Sanskrit",
    culturalContext: "Brahmin surname"
  },
  "PANDEY": {
    meaning: "Scholar, learned",
    origin: "Sanskrit",
    culturalContext: "Brahmin surname"
  },
  "VERMA": {
    meaning: "Protection, shield",
    origin: "Sanskrit",
    variations: ["Varm"]
  },
  "AGRAWAL": {
    meaning: "From Agra",
    origin: "Hindi",
    culturalContext: "Business community surname"
  },
  "TANDON": {
    meaning: "From Tanda",
    origin: "Hindi",
    variations: ["Tandon"]
  },
  "JAIN": {
    meaning: "Follower of Jainism",
    origin: "Sanskrit",
    culturalContext: "Jain community surname"
  },
  "MEHTA": {
    meaning: "Accountant, administrator",
    origin: "Gujarati",
    variations: ["Mehta"]
  },
  "SHAH": {
    meaning: "King, ruler",
    origin: "Persian/Sanskrit",
    variations: ["Shah"]
  },
  "SETH": {
    meaning: "Merchant, trader",
    origin: "Sanskrit",
    variations: ["Seth"]
  },
  "KHAN": {
    meaning: "Ruler, leader",
    origin: "Turkish/Mongolian",
    culturalContext: "Common surname in Muslim communities"
  },
  "AHMED": {
    meaning: "Most commendable, praised",
    origin: "Arabic",
    variations: ["Ahmad", "Ahmed"]
  },
  "HUSSAIN": {
    meaning: "Good, handsome",
    origin: "Arabic",
    variations: ["Husain", "Husayn"]
  },
  "ALI": {
    meaning: "Exalted, noble",
    origin: "Arabic",
    culturalContext: "Name of the fourth Caliph"
  },
  "RAHMAN": {
    meaning: "Merciful, compassionate",
    origin: "Arabic",
    variations: ["Rahman", "Rahman"]
  },
  "HASAN": {
    meaning: "Handsome, good",
    origin: "Arabic",
    variations: ["Hassan"]
  },
  "IBRAHIM": {
    meaning: "Father of many",
    origin: "Arabic",
    variations: ["Ibrahim"]
  },
  "MOHAMMED": {
    meaning: "Praised, commendable",
    origin: "Arabic",
    variations: ["Muhammad", "Mohammad", "Muhammed"]
  },
  "YOUSUF": {
    meaning: "God will increase",
    origin: "Arabic/Hebrew",
    variations: ["Yusuf", "Joseph"]
  },
  "MALIK": {
    meaning: "King, owner",
    origin: "Arabic",
    variations: ["Malik"]
  },
  "CHOWDHURY": {
    meaning: "Village headman",
    origin: "Bengali",
    variations: ["Chaudhary", "Chowdhury"]
  },
  "HOSSAIN": {
    meaning: "Good, handsome",
    origin: "Arabic/Bengali",
    variations: ["Hossain"]
  },
  "ISLAM": {
    meaning: "Submission to God",
    origin: "Arabic",
    culturalContext: "Religious surname"
  },
  "AKHTAR": {
    meaning: "Star, excellent",
    origin: "Persian",
    variations: ["Akhtar"]
  },
  "BUTT": {
    meaning: "Warrior",
    origin: "Kashmiri",
    variations: ["Bhatt"]
  },
  "RAZA": {
    meaning: "Contentment, approval",
    origin: "Arabic",
    variations: ["Raza"]
  },

  // Additional Common Names
  "MARIA": {
    meaning: "Bitterness, beloved",
    origin: "Hebrew",
    variations: ["Mary", "Marie", "Mariam", "Mariya"]
  },
  "SOPHIA": {
    meaning: "Wisdom",
    origin: "Greek",
    variations: ["Sofia", "Sophie"]
  },
  "EMMA": {
    meaning: "Whole, universal",
    origin: "Germanic",
    variations: ["Ema"]
  },
  "OLIVIA": {
    meaning: "Olive tree",
    origin: "Latin",
    variations: ["Olive", "Olivia"]
  },
  "ISABELLA": {
    meaning: "God is my oath",
    origin: "Hebrew",
    variations: ["Isabel", "Isabelle", "Bella"]
  },
  "AVA": {
    meaning: "Life, bird, water",
    origin: "Latin/Hebrew",
    variations: ["Eva", "Eve"]
  },
  "EMILY": {
    meaning: "Rival, industrious",
    origin: "Latin",
    variations: ["Emilie", "Amelia"]
  },
  "ABIGAIL": {
    meaning: "Father's joy",
    origin: "Hebrew",
    variations: ["Abby", "Abbie", "Gail"]
  },
  "MIA": {
    meaning: "Mine, beloved",
    origin: "Scandinavian/Italian",
    variations: ["Mya"]
  },
  "MADISON": {
    meaning: "Son of Maud",
    origin: "English",
    variations: ["Maddison", "Maddie"]
  },
  "ELIZABETH": {
    meaning: "God is my oath",
    origin: "Hebrew",
    variations: ["Eliza", "Liz", "Beth", "Elisabeth"]
  },
  "CHLOE": {
    meaning: "Young green shoot",
    origin: "Greek",
    variations: ["Khloe", "Cloe"]
  },
  "ELLA": {
    meaning: "Beautiful fairy woman",
    origin: "Germanic/Greek",
    variations: ["Elle"]
  },
  "LILY": {
    meaning: "Lily flower",
    origin: "Latin",
    variations: ["Lilly", "Liliana"]
  },
  "VICTORIA": {
    meaning: "Victory",
    origin: "Latin",
    variations: ["Vicky", "Tori", "Vic"]
  },
  "ARIANA": {
    meaning: "Very holy",
    origin: "Greek",
    variations: ["Arianna", "Aryana"]
  },
  "NATALIE": {
    meaning: "Christmas Day",
    origin: "Latin",
    variations: ["Natalia", "Natasha"]
  },
  "CHRISTINA": {
    meaning: "Follower of Christ",
    origin: "Latin",
    variations: ["Christine", "Kristina", "Kristine"]
  },
  "ALEXIS": {
    meaning: "Defender, helper",
    origin: "Greek",
    variations: ["Alexa", "Alexia"]
  },
  "GRACE": {
    meaning: "Grace, elegance",
    origin: "Latin",
    variations: ["Gracia", "Gracie"]
  },
  "HANNAH": {
    meaning: "Favor, grace",
    origin: "Hebrew",
    variations: ["Hanna", "Anna", "Ann"]
  },
  "AMELIA": {
    meaning: "Industrious, striving",
    origin: "Latin",
    variations: ["Amelie", "Emilia"]
  },
  "KATHERINE": {
    meaning: "Pure",
    origin: "Greek",
    variations: ["Katie", "Kate", "Catherine", "Kathryn"]
  },
  "SARA": {
    meaning: "Princess",
    origin: "Hebrew",
    variations: ["Sarah", "Sara", "Zara"]
  },
  "ANNA": {
    meaning: "Favor, grace",
    origin: "Hebrew",
    variations: ["Ana", "Hannah", "Ann"]
  },
  "SAMANTHA": {
    meaning: "Listener",
    origin: "Aramaic",
    variations: ["Sam", "Sammie"]
  },
  "CLAIRE": {
    meaning: "Clear, bright",
    origin: "Latin",
    variations: ["Clare", "Clara"]
  },
  "PENELOPE": {
    meaning: "Weaver",
    origin: "Greek",
    variations: ["Penny", "Pen"]
  },
  "ZOEY": {
    meaning: "Life",
    origin: "Greek",
    variations: ["Zoe", "Zoie"]
  },
  "LUCY": {
    meaning: "Light",
    origin: "Latin",
    variations: ["Lucia", "Lucille"]
  },
  "MADELINE": {
    meaning: "Of Magdala",
    origin: "Hebrew",
    variations: ["Madelyn", "Maddie", "Maddy"]
  },
  "PAIGE": {
    meaning: "Young servant, page",
    origin: "English",
    variations: ["Page"]
  },
  "LEAH": {
    meaning: "Weary, wild cow",
    origin: "Hebrew",
    variations: ["Lea", "Lia"]
  },
  "LILIANA": {
    meaning: "Lily flower",
    origin: "Latin",
    variations: ["Lily", "Liliana"]
  },
  "AUDREY": {
    meaning: "Noble strength",
    origin: "English",
    variations: ["Audrie"]
  },
  "JULIA": {
    meaning: "Youthful",
    origin: "Latin",
    variations: ["Julie", "Julianne", "Juliana"]
  },
  "VANESSA": {
    meaning: "Butterfly",
    origin: "Greek",
    variations: ["Vanessa", "Nessa"]
  },
  "MAYA": {
    meaning: "Illusion, magic",
    origin: "Sanskrit/Greek",
    variations: ["Mya", "Maia"]
  },
  "AURORA": {
    meaning: "Dawn",
    origin: "Latin",
    variations: ["Rory", "Aurore"]
  },
  "VIVIAN": {
    meaning: "Alive, lively",
    origin: "Latin",
    variations: ["Vivien", "Vivienne"]
  },
  "CAROLINE": {
    meaning: "Free man",
    origin: "Germanic",
    variations: ["Carolyn", "Carrie", "Caroline"]
  },
  "BEATRICE": {
    meaning: "She who brings happiness",
    origin: "Latin",
    variations: ["Bea", "Beatrix"]
  },
  "CELESTE": {
    meaning: "Heavenly",
    origin: "Latin",
    variations: ["Celesta", "Celestine"]
  },
  "DIANA": {
    meaning: "Divine",
    origin: "Latin",
    culturalContext: "Roman goddess of the hunt"
  },
  "ELEANOR": {
    meaning: "Bright, shining one",
    origin: "Greek",
    variations: ["Ellie", "Ella", "Nora"]
  },
  "FIONA": {
    meaning: "Fair, white",
    origin: "Scottish",
    variations: ["Fionn"]
  },
  "GABRIELLA": {
    meaning: "God is my strength",
    origin: "Hebrew",
    variations: ["Gabrielle", "Gabi", "Gaby"]
  },
  "HELENA": {
    meaning: "Light, torch",
    origin: "Greek",
    variations: ["Helen", "Elena", "Ellen"]
  },
  "JASMINE": {
    meaning: "Jasmine flower",
    origin: "Persian",
    variations: ["Yasmin", "Jasmin"]
  },
  "KENDRA": {
    meaning: "Knowledge, understanding",
    origin: "English",
    variations: ["Kenna"]
  },
  "LENA": {
    meaning: "Light",
    origin: "Greek/Russian",
    variations: ["Lina"]
  },
  "MONICA": {
    meaning: "Advisor, counselor",
    origin: "Latin",
    variations: ["Monika"]
  },
  "NINA": {
    meaning: "Dreamer, little girl",
    origin: "Russian/Spanish",
    variations: ["Nena"]
  },
  "PAULINA": {
    meaning: "Small, humble",
    origin: "Latin",
    variations: ["Pauline", "Paula"]
  },
  "QUINN": {
    meaning: "Wise, counsel",
    origin: "Irish",
    variations: ["Quinn"]
  },
  "ROSALIND": {
    meaning: "Beautiful rose",
    origin: "Latin",
    variations: ["Rosalyn", "Rosaline"]
  },
  "SELENA": {
    meaning: "Moon",
    origin: "Greek",
    variations: ["Selene", "Celina"]
  },
  "TIFFANY": {
    meaning: "Manifestation of God",
    origin: "Greek",
    variations: ["Tiffani", "Tiff"]
  },
  "URSULA": {
    meaning: "Little bear",
    origin: "Latin",
    variations: ["Ursa"]
  },
  "VALERIA": {
    meaning: "Strong, healthy",
    origin: "Latin",
    variations: ["Valerie", "Val"]
  },
  "WENDY": {
    meaning: "Friend, blessed ring",
    origin: "English",
    variations: ["Wendie"]
  },
  "XIMENA": {
    meaning: "Hearing, listening",
    origin: "Spanish",
    variations: ["Jimena"]
  },
  "YVONNE": {
    meaning: "Yew tree",
    origin: "French",
    variations: ["Yvette"]
  },
  "ZARA": {
    meaning: "Princess, flower",
    origin: "Arabic/Hebrew",
    variations: ["Sara", "Sarah"]
  },

  // Indian Names - First Names (Male)
  "ARVIND": {
    meaning: "Lotus, enlightened one",
    origin: "Indian/Sanskrit",
    variations: ["Arvinda", "Aravind"]
  },
  "RAMESH": {
    meaning: "Lord of Rama, God",
    origin: "Indian/Sanskrit",
    variations: ["Rameshwar", "Ram"]
  },
  "SURESH": {
    meaning: "Lord of gods, Indra",
    origin: "Indian/Sanskrit",
    variations: ["Sureshwar"]
  },
  "PRADEEP": {
    meaning: "Light, lamp",
    origin: "Indian/Sanskrit",
    variations: ["Pradeepan"]
  },
  "VINOD": {
    meaning: "Joy, happiness",
    origin: "Indian/Sanskrit",
    variations: ["Vinoda"]
  },
  "SUNIL": {
    meaning: "Very blue, dark blue",
    origin: "Indian/Sanskrit",
    variations: ["Sunil", "Sunila"]
  },
  "MANOJ": {
    meaning: "Born of mind, Lord Shiva",
    origin: "Indian/Sanskrit",
    variations: ["Manohar", "Manoja"]
  },
  "RAJESH": {
    meaning: "Lord of kings",
    origin: "Indian/Sanskrit",
    variations: ["Rajeshwar"]
  },
  "KUSHAL": {
    meaning: "Skillful, clever",
    origin: "Indian/Sanskrit",
    variations: ["Kushala"]
  },
  "SANJAY": {
    meaning: "Victory, triumphant",
    origin: "Indian/Sanskrit",
    variations: ["Sanjaya"]
  },
  "ABHI": {
    meaning: "Fearless, brave",
    origin: "Indian/Sanskrit",
    variations: ["Abhijeet", "Abhishek"]
  },
  "RAJEEV": {
    meaning: "Blue lotus",
    origin: "Indian/Sanskrit",
    variations: ["Rajiv"]
  },
  "DURGESH": {
    meaning: "Lord of difficulties, Shiva",
    origin: "Indian/Sanskrit",
    variations: ["Durgeshwar"]
  },
  "ROHIT": {
    meaning: "Red, sun",
    origin: "Indian/Sanskrit",
    variations: ["Rohita", "Rohith"]
  },
  "SPARSH": {
    meaning: "Touch, contact",
    origin: "Indian/Sanskrit",
    variations: ["Sparsha"]
  },
  "SANTOSH": {
    meaning: "Contentment, satisfaction",
    origin: "Indian/Sanskrit",
    variations: ["Santosha"]
  },
  "PUNIT": {
    meaning: "Pure, holy",
    origin: "Indian/Sanskrit",
    variations: ["Punita", "Punith"]
  },
  "DINESH": {
    meaning: "Lord of the day, sun",
    origin: "Indian/Sanskrit",
    variations: ["Dinesha"]
  },
  "GULSHAN": {
    meaning: "Garden, flower garden",
    origin: "Indian/Persian",
    variations: ["Gulshana"]
  },
  "RUPESH": {
    meaning: "Lord of beauty",
    origin: "Indian/Sanskrit",
    variations: ["Rupeshwar"]
  },
  "MAHESH": {
    meaning: "Great lord, Shiva",
    origin: "Indian/Sanskrit",
    variations: ["Maheshwar"]
  },
  "VIKASH": {
    meaning: "Progress, development",
    origin: "Indian/Sanskrit",
    variations: ["Vikash", "Vikasa"]
  },
  "ARINDRA": {
    meaning: "Enemy of enemies, Arjuna",
    origin: "Indian/Sanskrit",
    variations: ["Arindam"]
  },
  "HEMANT": {
    meaning: "Winter season",
    origin: "Indian/Sanskrit",
    variations: ["Hemanta"]
  },
  "AAKASH": {
    meaning: "Sky, space",
    origin: "Indian/Sanskrit",
    variations: ["Akash", "Akasha"]
  },
  "CHANDESH": {
    meaning: "Lord of moon, Shiva",
    origin: "Indian/Sanskrit",
    variations: ["Chandeshwar"]
  },
  "IRFAN": {
    meaning: "Knowledge, awareness",
    origin: "Indian/Arabic",
    variations: ["Arfan"]
  },
  "AZARUDDIN": {
    meaning: "Fire of religion",
    origin: "Indian/Arabic",
    variations: ["Azhar"]
  },
  "PAWAN": {
    meaning: "Wind, air",
    origin: "Indian/Sanskrit",
    variations: ["Pavan"]
  },
  "SANDEEP": {
    meaning: "Light of lamp",
    origin: "Indian/Sanskrit",
    variations: ["Sandip"]
  },
  "RAJKUMAR": {
    meaning: "Prince, son of king",
    origin: "Indian/Sanskrit",
    variations: ["Rajkumar", "Raju"]
  },
  "PARVESH": {
    meaning: "Entry, arrival",
    origin: "Indian/Sanskrit",
    variations: ["Parvesh"]
  },
  "NEERAJ": {
    meaning: "Lotus, water-born",
    origin: "Indian/Sanskrit",
    variations: ["Neeraja"]
  },
  "RAJENDER": {
    meaning: "King of gods",
    origin: "Indian/Sanskrit",
    variations: ["Rajendra"]
  },
  "SURAJ": {
    meaning: "Sun",
    origin: "Indian/Sanskrit",
    variations: ["Surya", "Suraj"]
  },
  "RIZWAN": {
    meaning: "Contentment, pleasure of God",
    origin: "Indian/Arabic",
    variations: ["Rizwan"]
  },
  "DEEPAK": {
    meaning: "Lamp, light",
    origin: "Indian/Sanskrit",
    variations: ["Deepak", "Dipak"]
  },
  "ABHISHEKH": {
    meaning: "Blessing, anointment",
    origin: "Indian/Sanskrit",
    variations: ["Abhishek"]
  },
  "ANKIT": {
    meaning: "Marked, anointed",
    origin: "Indian/Sanskrit",
    variations: ["Ankita"]
  },
  "KULDEEP": {
    meaning: "Lamp of family",
    origin: "Indian/Sanskrit",
    variations: ["Kuldeep"]
  },
  "LALIT": {
    meaning: "Beautiful, charming",
    origin: "Indian/Sanskrit",
    variations: ["Lalita"]
  },
  "PULKIT": {
    meaning: "Blossomed, grown",
    origin: "Indian/Sanskrit",
    variations: ["Pulkita"]
  },
  "AMAN": {
    meaning: "Peace, safety",
    origin: "Indian/Sanskrit",
    variations: ["Amaan"]
  },
  "MUKUL": {
    meaning: "Bud, blossom",
    origin: "Indian/Sanskrit",
    variations: ["Mukula"]
  },
  "GOURAV": {
    meaning: "Pride, honor",
    origin: "Indian/Sanskrit",
    variations: ["Gaurav"]
  },
  "MUKESH": {
    meaning: "Lord of liberation",
    origin: "Indian/Sanskrit",
    variations: ["Mukeshwar"]
  },
  "AJAY": {
    meaning: "Unconquerable",
    origin: "Indian/Sanskrit",
    variations: ["Aja", "Ajaya"]
  },
  "NARENDER": {
    meaning: "Lord of men",
    origin: "Indian/Sanskrit",
    variations: ["Narendra"]
  },
  "DHARMPAL": {
    meaning: "Protector of religion",
    origin: "Indian/Sanskrit",
    variations: ["Dharmapala"]
  },
  "ASHISH": {
    meaning: "Blessing, benediction",
    origin: "Indian/Sanskrit",
    variations: ["Ashisha"]
  },
  "MANISH": {
    meaning: "Lord of mind",
    origin: "Indian/Sanskrit",
    variations: ["Manisha"]
  },
  "RITESH": {
    meaning: "Lord of seasons",
    origin: "Indian/Sanskrit",
    variations: ["Riteshwar"]
  },
  "VIJAY": {
    meaning: "Victory",
    origin: "Indian/Sanskrit",
    variations: ["Vijaya"]
  },
  "RAKESH": {
    meaning: "Lord of night, moon",
    origin: "Indian/Sanskrit",
    variations: ["Rakeshwar"]
  },
  "MONU": {
    meaning: "Precious gem",
    origin: "Indian/Sanskrit",
    variations: ["Monika"]
  },
  "KAPIL": {
    meaning: "Sage, reddish brown",
    origin: "Indian/Sanskrit",
    culturalContext: "Ancient Indian sage"
  },
  "VINAY": {
    meaning: "Modesty, politeness",
    origin: "Indian/Sanskrit",
    variations: ["Vinaya"]
  },
  "BHARAT": {
    meaning: "India, maintained",
    origin: "Indian/Sanskrit",
    culturalContext: "Ancient name for India"
  },

  // Indian Names - Surnames
  "YADAV": {
    meaning: "Descendant of Yadu",
    origin: "Indian/Sanskrit",
    culturalContext: "Clan name tracing to Yadu dynasty"
  },
  "MANDAL": {
    meaning: "Circle, region",
    origin: "Indian/Sanskrit"
  },
  "PAL": {
    meaning: "Protector, keeper",
    origin: "Indian/Sanskrit",
    variations: ["Paal"]
  },
  "CHAUHAN": {
    meaning: "Four-handed",
    origin: "Indian",
    culturalContext: "Rajput clan name"
  },
  "TIWARI": {
    meaning: "Priest, scholar",
    origin: "Indian/Sanskrit"
  },
  "KHALID": {
    meaning: "Eternal, immortal",
    origin: "Arabic",
    variations: ["Khalil"]
  },
  "OMAR": {
    meaning: "Flourishing, long-lived",
    origin: "Arabic",
    variations: ["Umar", "Omar"]
  },
  "MUSTAFA": {
    meaning: "Chosen one",
    origin: "Arabic",
    culturalContext: "One of the names of Prophet Muhammad"
  },
  "YUSUF": {
    meaning: "God increases",
    origin: "Arabic/Hebrew",
    variations: ["Joseph", "Yusuf", "Youssef"]
  },
  "SAID": {
    meaning: "Happy, fortunate",
    origin: "Arabic",
    variations: ["Saeed", "Said"]
  },
  "FARID": {
    meaning: "Unique, incomparable",
    origin: "Arabic",
    variations: ["Fareed"]
  },
  "HAMZA": {
    meaning: "Lion",
    origin: "Arabic",
    culturalContext: "Uncle of Prophet Muhammad"
  },
  "TARIQ": {
    meaning: "Morning star",
    origin: "Arabic",
    variations: ["Tarik"]
  },
  "RAHIM": {
    meaning: "Compassionate, merciful",
    origin: "Arabic",
    variations: ["Rahman"]
  },
  "ABDUL": {
    meaning: "Servant of",
    origin: "Arabic",
    culturalContext: "Common prefix meaning 'servant of God'"
  },
  "SALMAN": {
    meaning: "Safe, secure",
    origin: "Arabic",
    variations: ["Salman", "Sulaiman"]
  },
  "BILAL": {
    meaning: "Water, freshness",
    origin: "Arabic",
    culturalContext: "First muezzin in Islam"
  },
  "NOOR": {
    meaning: "Light",
    origin: "Arabic",
    variations: ["Nur", "Noor"]
  },
  "FAHIM": {
    meaning: "Intelligent, understanding",
    origin: "Arabic",
    variations: ["Faham"]
  },
  "JAMIL": {
    meaning: "Beautiful",
    origin: "Arabic",
    variations: ["Jameel", "Jamil"]
  },
  "HAKIM": {
    meaning: "Wise, judge",
    origin: "Arabic",
    variations: ["Hakeem"]
  },
  "SAMIR": {
    meaning: "Companion, friend",
    origin: "Arabic",
    variations: ["Sameer", "Samir"]
  },
  "WALID": {
    meaning: "Newborn child",
    origin: "Arabic",
    variations: ["Waleed"]
  },
  "RASHID": {
    meaning: "Rightly guided, wise",
    origin: "Arabic",
    variations: ["Rasheed"]
  },
  "AMIR": {
    meaning: "Prince, commander",
    origin: "Arabic",
    variations: ["Ameer", "Emir"]
  },
  "KAREEM": {
    meaning: "Generous, noble",
    origin: "Arabic",
    variations: ["Karim", "Kareem"]
  },
  "ZAHID": {
    meaning: "Pious, ascetic",
    origin: "Arabic",
    variations: ["Zaheed"]
  },
  "ADIL": {
    meaning: "Just, fair",
    origin: "Arabic",
    variations: ["Adel", "Adeel"]
  },
  "FARIS": {
    meaning: "Knight, horseman",
    origin: "Arabic",
    variations: ["Faris"]
  },
  "IMRAN": {
    meaning: "Prosperity",
    origin: "Arabic",
    variations: ["Imran"]
  },
  "JALAL": {
    meaning: "Majesty, glory",
    origin: "Arabic",
    variations: ["Jalal"]
  },
  "SHAHID": {
    meaning: "Witness, martyr",
    origin: "Arabic",
    variations: ["Shaheed", "Shahid"]
  },
  "TALHA": {
    meaning: "Fruit-bearing tree",
    origin: "Arabic",
    variations: ["Talhah"]
  },
  "USMAN": {
    meaning: "Baby bustard bird",
    origin: "Arabic",
    variations: ["Othman", "Osman"]
  },
  "YAQUB": {
    meaning: "Supplanter",
    origin: "Arabic/Hebrew",
    variations: ["Yaqub", "Jacob", "Ya'qub"]
  },
  "ZAKARIA": {
    meaning: "God remembers",
    origin: "Arabic/Hebrew",
    variations: ["Zakariya", "Zachariah", "Zechariah"]
  },

  // 99 Names of Allah (Asma ul Husna) - Most Common
  "KUDDUS": {
    meaning: "The Holy One",
    origin: "Arabic",
    variations: ["Quddus"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "SALAM": {
    meaning: "The Source of Peace",
    origin: "Arabic",
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUMIN": {
    meaning: "The Guardian of Faith",
    origin: "Arabic",
    variations: ["Mu'min"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUHAYMIN": {
    meaning: "The Protector",
    origin: "Arabic",
    variations: ["Muhaymin"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "AZIZ": {
    meaning: "The Mighty, The Strong",
    origin: "Arabic",
    variations: ["Azeez"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "JABBAR": {
    meaning: "The Compeller",
    origin: "Arabic",
    variations: ["Jabbar"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUTAKABBIR": {
    meaning: "The Supreme",
    origin: "Arabic",
    variations: ["Mutakabbir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "KHALIQ": {
    meaning: "The Creator",
    origin: "Arabic",
    variations: ["Khaliq"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "BARI": {
    meaning: "The Maker",
    origin: "Arabic",
    variations: ["Bari"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUSAWWIR": {
    meaning: "The Fashioner",
    origin: "Arabic",
    variations: ["Musawwir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "GHAFFAR": {
    meaning: "The Forgiving",
    origin: "Arabic",
    variations: ["Ghaffar"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "QAHHAR": {
    meaning: "The Subduer",
    origin: "Arabic",
    variations: ["Qahhar"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "WAHHAB": {
    meaning: "The Bestower",
    origin: "Arabic",
    variations: ["Wahhab"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "RAZZAQ": {
    meaning: "The Provider",
    origin: "Arabic",
    variations: ["Razzaq"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "FATTAH": {
    meaning: "The Opener",
    origin: "Arabic",
    variations: ["Fattah"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "ALIM": {
    meaning: "The All-Knowing",
    origin: "Arabic",
    variations: ["Aleem"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "QABID": {
    meaning: "The Restrainer",
    origin: "Arabic",
    variations: ["Qabid"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "BASIT": {
    meaning: "The Expander",
    origin: "Arabic",
    variations: ["Basit"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "KHAFID": {
    meaning: "The Abaser",
    origin: "Arabic",
    variations: ["Khafid"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "RAFI": {
    meaning: "The Exalter",
    origin: "Arabic",
    variations: ["Rafi"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MU'IZZ": {
    meaning: "The Honorer",
    origin: "Arabic",
    variations: ["Muizz"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUZILL": {
    meaning: "The Dishonorer",
    origin: "Arabic",
    variations: ["Muzill"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "SAMEE": {
    meaning: "The All-Hearing",
    origin: "Arabic",
    variations: ["Samee", "Sami"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "BASHIR": {
    meaning: "The All-Seeing",
    origin: "Arabic",
    variations: ["Bashir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "HAKAM": {
    meaning: "The Judge",
    origin: "Arabic",
    variations: ["Hakam"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "ADL": {
    meaning: "The Just",
    origin: "Arabic",
    variations: ["Adl"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "LATEEF": {
    meaning: "The Subtle One",
    origin: "Arabic",
    variations: ["Latif"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "KHABIR": {
    meaning: "The Aware",
    origin: "Arabic",
    variations: ["Khabir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "HALIM": {
    meaning: "The Forbearing",
    origin: "Arabic",
    variations: ["Halim"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "AZEEM": {
    meaning: "The Great One",
    origin: "Arabic",
    variations: ["Azeem", "Azim"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "GHAFOOR": {
    meaning: "The Forgiver",
    origin: "Arabic",
    variations: ["Ghafur"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "SHAKUR": {
    meaning: "The Appreciative",
    origin: "Arabic",
    variations: ["Shakur"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "ALIYY": {
    meaning: "The Most High",
    origin: "Arabic",
    variations: ["Ali", "Aliyy"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "KABEER": {
    meaning: "The Great",
    origin: "Arabic",
    variations: ["Kabir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "HAFIZ": {
    meaning: "The Preserver",
    origin: "Arabic",
    variations: ["Hafiz"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUQEET": {
    meaning: "The Maintainer",
    origin: "Arabic",
    variations: ["Muqeet"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "HASEEB": {
    meaning: "The Reckoner",
    origin: "Arabic",
    variations: ["Hasib"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "JALEEL": {
    meaning: "The Sublime One",
    origin: "Arabic",
    variations: ["Jalil"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "RAQEEB": {
    meaning: "The Watchful",
    origin: "Arabic",
    variations: ["Raqib"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUJEEB": {
    meaning: "The Responsive",
    origin: "Arabic",
    variations: ["Mujib"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "WASI": {
    meaning: "The All-Embracing",
    origin: "Arabic",
    variations: ["Wasi"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "HAKEEM": {
    meaning: "The Wise",
    origin: "Arabic",
    variations: ["Hakim"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "WADOOD": {
    meaning: "The Loving",
    origin: "Arabic",
    variations: ["Wadud"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MAJID": {
    meaning: "The All-Glorious",
    origin: "Arabic",
    variations: ["Majid"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "BAA'ITH": {
    meaning: "The Resurrector",
    origin: "Arabic",
    variations: ["Ba'ith"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "HAQ": {
    meaning: "The Truth",
    origin: "Arabic",
    variations: ["Haqq"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "WAKIL": {
    meaning: "The Trustee",
    origin: "Arabic",
    variations: ["Wakil"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "QAWI": {
    meaning: "The Strong",
    origin: "Arabic",
    variations: ["Qawi"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MATEEN": {
    meaning: "The Firm",
    origin: "Arabic",
    variations: ["Mateen"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "WALI": {
    meaning: "The Protecting Friend",
    origin: "Arabic",
    variations: ["Wali"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "HAMID": {
    meaning: "The Praiseworthy",
    origin: "Arabic",
    variations: ["Hamid"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUHSI": {
    meaning: "The Accounter",
    origin: "Arabic",
    variations: ["Muhsi"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUBDI": {
    meaning: "The Originator",
    origin: "Arabic",
    variations: ["Mubdi"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MU'ID": {
    meaning: "The Restorer",
    origin: "Arabic",
    variations: ["Mu'id"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUHYI": {
    meaning: "The Giver of Life",
    origin: "Arabic",
    variations: ["Muhyi"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUMEET": {
    meaning: "The Taker of Life",
    origin: "Arabic",
    variations: ["Mumeet"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "HAIY": {
    meaning: "The Ever Living",
    origin: "Arabic",
    variations: ["Hayy"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "QAYYUM": {
    meaning: "The Self-Subsisting",
    origin: "Arabic",
    variations: ["Qayyum"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "WAJID": {
    meaning: "The Perceiver",
    origin: "Arabic",
    variations: ["Wajid"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "WAHID": {
    meaning: "The One",
    origin: "Arabic",
    variations: ["Wahid"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "AHAD": {
    meaning: "The Unique, The One",
    origin: "Arabic",
    variations: ["Ahad"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "SAMAD": {
    meaning: "The Eternal, The Absolute",
    origin: "Arabic",
    variations: ["Samad"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "QADIR": {
    meaning: "The Able",
    origin: "Arabic",
    variations: ["Qadir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUQTADIR": {
    meaning: "The Powerful",
    origin: "Arabic",
    variations: ["Muqtadir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUQADDIM": {
    meaning: "The Expediter",
    origin: "Arabic",
    variations: ["Muqaddim"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUAKHKHIR": {
    meaning: "The Delayer",
    origin: "Arabic",
    variations: ["Muakhkhir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "AWWAL": {
    meaning: "The First",
    origin: "Arabic",
    variations: ["Awwal"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "AKHIR": {
    meaning: "The Last",
    origin: "Arabic",
    variations: ["Akhir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "ZAHIR": {
    meaning: "The Manifest",
    origin: "Arabic",
    variations: ["Zahir"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "BATIN": {
    meaning: "The Hidden",
    origin: "Arabic",
    variations: ["Batin"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUTA'ALI": {
    meaning: "The Most Exalted",
    origin: "Arabic",
    variations: ["Muta'ali"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "BARR": {
    meaning: "The Source of Goodness",
    origin: "Arabic",
    variations: ["Barr"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "TAWWAB": {
    meaning: "The Ever-Pardoning",
    origin: "Arabic",
    variations: ["Tawwab"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "MUNTAQIM": {
    meaning: "The Avenger",
    origin: "Arabic",
    variations: ["Muntaqim"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "AFUWW": {
    meaning: "The Pardoner",
    origin: "Arabic",
    variations: ["Afuw"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "RA'UF": {
    meaning: "The Kind",
    origin: "Arabic",
    variations: ["Ra'uf"],
    culturalContext: "One of the 99 Names of Allah"
  },
  "DHUL": {
    meaning: "The Lord of",
    origin: "Arabic",
    variations: ["Dhul"],
    culturalContext: "Prefix for many of the 99 Names of Allah"
  },
  "IKRAM": {
    meaning: "The Giver of Honor",
    origin: "Arabic",
    variations: ["Ikram"],
    culturalContext: "One of the 99 Names of Allah"
  },

  // Additional International Names from Popular Names by Country Dataset
  // Common names from various countries not yet covered
  
  // East Asian Names
  "WEI": {
    meaning: "Greatness, power",
    origin: "Chinese",
    gender: "male",
    countries: ["China", "Taiwan", "Singapore"],
    popularity: "very_common"
  },
  "MING": {
    meaning: "Bright, clear",
    origin: "Chinese",
    gender: "unisex",
    countries: ["China", "Taiwan", "Singapore"],
    popularity: "common"
  },
  "LI": {
    meaning: "Plum, beautiful",
    origin: "Chinese",
    gender: "female",
    countries: ["China", "Taiwan", "Singapore"],
    popularity: "very_common"
  },
  "ZHANG": {
    meaning: "Bow, archer",
    origin: "Chinese",
    gender: "male",
    countries: ["China", "Taiwan"],
    popularity: "very_common"
  },
  "WANG": {
    meaning: "King, monarch",
    origin: "Chinese",
    gender: "unisex",
    countries: ["China", "Taiwan"],
    popularity: "very_common"
  },
  "LIU": {
    meaning: "Willow tree",
    origin: "Chinese",
    gender: "unisex",
    countries: ["China", "Taiwan"],
    popularity: "very_common"
  },
  "CHEN": {
    meaning: "Dawn, morning",
    origin: "Chinese",
    gender: "unisex",
    countries: ["China", "Taiwan"],
    popularity: "very_common"
  },
  "YUKI": {
    meaning: "Snow, happiness",
    origin: "Japanese",
    gender: "unisex",
    countries: ["Japan"],
    popularity: "common"
  },
  "HIROSHI": {
    meaning: "Generous, tolerant",
    origin: "Japanese",
    gender: "male",
    countries: ["Japan"],
    popularity: "common"
  },
  "AKIRA": {
    meaning: "Bright, clear",
    origin: "Japanese",
    gender: "male",
    countries: ["Japan"],
    popularity: "common"
  },
  "SAKURA": {
    meaning: "Cherry blossom",
    origin: "Japanese",
    gender: "female",
    countries: ["Japan"],
    popularity: "common"
  },
  "TAKESHI": {
    meaning: "Warrior, fierce",
    origin: "Japanese",
    gender: "male",
    countries: ["Japan"],
    popularity: "common"
  },
  "MIN-SEO": {
    meaning: "Bright and beautiful",
    origin: "Korean",
    gender: "female",
    countries: ["South Korea"],
    popularity: "common"
  },
  "SEUNG": {
    meaning: "Victory, rising",
    origin: "Korean",
    gender: "male",
    countries: ["South Korea"],
    popularity: "common"
  },
  "JI-HOON": {
    meaning: "Wisdom and teaching",
    origin: "Korean",
    gender: "male",
    countries: ["South Korea"],
    popularity: "common"
  },
  "EUN": {
    meaning: "Silver, kindness",
    origin: "Korean",
    gender: "unisex",
    countries: ["South Korea"],
    popularity: "common"
  },
  
  // European Names (Additional)
  "LUKAS": {
    meaning: "From Lucania, light",
    origin: "Greek/German",
    gender: "male",
    countries: ["Germany", "Austria", "Czech Republic", "Lithuania"],
    popularity: "common",
    variations: ["Lucas", "Luka", "Luke"]
  },
  "JAN": {
    meaning: "God is gracious",
    origin: "Hebrew/Dutch/Polish",
    gender: "male",
    countries: ["Netherlands", "Poland", "Czech Republic"],
    popularity: "very_common",
    variations: ["John", "Juan", "Giovanni"]
  },
  "PIETRO": {
    meaning: "Rock, stone",
    origin: "Italian",
    gender: "male",
    countries: ["Italy"],
    popularity: "common",
    variations: ["Peter", "Pedro", "Pierre"]
  },
  "GIUSEPPE": {
    meaning: "God will increase",
    origin: "Italian",
    gender: "male",
    countries: ["Italy"],
    popularity: "very_common",
    variations: ["Joseph", "Jose", "José"]
  },
  "CARLOS": {
    meaning: "Free man",
    origin: "Spanish/Portuguese",
    gender: "male",
    countries: ["Spain", "Portugal", "Mexico", "Brazil"],
    popularity: "very_common",
    variations: ["Charles", "Carl"]
  },
  "ANA": {
    meaning: "Grace, favor",
    origin: "Spanish/Portuguese",
    gender: "female",
    countries: ["Spain", "Portugal", "Brazil", "Romania"],
    popularity: "very_common",
    variations: ["Anna", "Anne", "Hannah"]
  },
  "FRANCOIS": {
    meaning: "Frenchman, free man",
    origin: "French",
    gender: "male",
    countries: ["France", "Belgium", "Switzerland"],
    popularity: "common",
    variations: ["Francis", "Francesco", "Francisco"]
  },
  "SOPHIE": {
    meaning: "Wisdom",
    origin: "Greek/French",
    gender: "female",
    countries: ["France", "Germany", "United Kingdom"],
    popularity: "very_common",
    variations: ["Sophia", "Sofia"]
  },
  "ALEXANDRE": {
    meaning: "Defender of mankind",
    origin: "French/Portuguese",
    gender: "male",
    countries: ["France", "Portugal", "Brazil"],
    popularity: "common",
    variations: ["Alexander", "Alejandro", "Alessandro"]
  },
  "VLADIMIR": {
    meaning: "Ruler of peace",
    origin: "Slavic/Russian",
    gender: "male",
    countries: ["Russia", "Bulgaria", "Serbia", "Czech Republic"],
    popularity: "very_common",
    variations: ["Vlad"]
  },
  "NIKOLAI": {
    meaning: "Victory of the people",
    origin: "Russian/Greek",
    gender: "male",
    countries: ["Russia", "Bulgaria"],
    popularity: "common",
    variations: ["Nicholas", "Nicolas", "Nikolay"]
  },
  "ANASTASIA": {
    meaning: "Resurrection",
    origin: "Greek/Russian",
    gender: "female",
    countries: ["Russia", "Greece"],
    popularity: "common",
    variations: ["Anastasiya"]
  },
  "KATARINA": {
    meaning: "Pure",
    origin: "Greek/Slavic",
    gender: "female",
    countries: ["Serbia", "Croatia", "Slovakia", "Czech Republic"],
    popularity: "common",
    variations: ["Catherine", "Katerina", "Ekaterina"]
  },
  "JOHAN": {
    meaning: "God is gracious",
    origin: "German/Dutch/Scandinavian",
    gender: "male",
    countries: ["Germany", "Netherlands", "Sweden", "Norway"],
    popularity: "very_common",
    variations: ["John", "Jonas", "Johannes"]
  },
  "ERIK": {
    meaning: "Eternal ruler",
    origin: "Scandinavian",
    gender: "male",
    countries: ["Sweden", "Norway", "Denmark"],
    popularity: "very_common",
    variations: ["Eric", "Eirik"]
  },
  "KRISTINA": {
    meaning: "Follower of Christ",
    origin: "Greek/Latin",
    gender: "female",
    countries: ["Russia", "Sweden", "Bulgaria", "Serbia"],
    popularity: "common",
    variations: ["Christina", "Kristine", "Christine"]
  },
  
  // Latin American Names
  "SANTIAGO": {
    meaning: "Saint James",
    origin: "Spanish",
    gender: "male",
    countries: ["Spain", "Mexico", "Chile", "Colombia", "Argentina"],
    popularity: "very_common",
    variations: ["Tiago", "Diego"]
  },
  "VALENTINA": {
    meaning: "Strong, healthy",
    origin: "Latin/Italian",
    gender: "female",
    countries: ["Italy", "Russia", "Colombia", "Chile", "Argentina"],
    popularity: "very_common",
    variations: ["Valentine"]
  },
  "DIEGO": {
    meaning: "Supplanter",
    origin: "Spanish",
    gender: "male",
    countries: ["Spain", "Mexico", "Argentina", "Colombia"],
    popularity: "very_common",
    variations: ["James", "Santiago"]
  },
  "MATIAS": {
    meaning: "Gift of God",
    origin: "Spanish",
    gender: "male",
    countries: ["Spain", "Chile", "Argentina", "Uruguay"],
    popularity: "common",
    variations: ["Matthew", "Mattias"]
  },
  "SOFIA": {
    meaning: "Wisdom",
    origin: "Greek/Italian",
    gender: "female",
    countries: ["Italy", "Spain", "Portugal", "Brazil", "Mexico"],
    popularity: "very_common",
    variations: ["Sophia", "Sophie"]
  },
  
  // Southeast Asian Names
  "PUTRI": {
    meaning: "Princess",
    origin: "Indonesian/Malay",
    gender: "female",
    countries: ["Indonesia", "Malaysia"],
    popularity: "common"
  },
  "BUDI": {
    meaning: "Good character, virtue",
    origin: "Indonesian",
    gender: "male",
    countries: ["Indonesia"],
    popularity: "common"
  },
  "SITI": {
    meaning: "Lady, noblewoman",
    origin: "Arabic/Indonesian",
    gender: "female",
    countries: ["Indonesia", "Malaysia"],
    popularity: "common"
  },
  "ABDULLAH": {
    meaning: "Servant of God",
    origin: "Arabic/Indonesian",
    gender: "male",
    countries: ["Indonesia", "Malaysia", "Brunei"],
    popularity: "very_common",
    variations: ["Abdul"]
  },
  "THANH": {
    meaning: "Blue, green",
    origin: "Vietnamese",
    gender: "unisex",
    countries: ["Vietnam"],
    popularity: "common"
  },
  "MINH": {
    meaning: "Bright, intelligent",
    origin: "Vietnamese",
    gender: "male",
    countries: ["Vietnam"],
    popularity: "common"
  },
  "TRAN": {
    meaning: "To continue, to transmit",
    origin: "Vietnamese",
    gender: "unisex",
    countries: ["Vietnam"],
    popularity: "very_common"
  },
  "LE": {
    meaning: "Plum",
    origin: "Vietnamese",
    gender: "unisex",
    countries: ["Vietnam"],
    popularity: "very_common"
  },
  "PHAM": {
    meaning: "Fan, sail",
    origin: "Vietnamese",
    gender: "unisex",
    countries: ["Vietnam"],
    popularity: "very_common"
  },
  
  // Additional Middle Eastern Names
  "FATIMA": {
    meaning: "Daughter of Prophet",
    origin: "Arabic",
    gender: "female",
    countries: ["Saudi Arabia", "UAE", "Morocco", "Pakistan", "India"],
    popularity: "very_common",
    culturalContext: "Important name in Islamic tradition"
  },
  "AYA": {
    meaning: "Miracle, sign",
    origin: "Arabic",
    gender: "female",
    countries: ["Saudi Arabia", "UAE", "Egypt", "Jordan"],
    popularity: "common"
  },
  "LAYLA": {
    meaning: "Night, dark beauty",
    origin: "Arabic",
    gender: "female",
    countries: ["Saudi Arabia", "UAE", "Lebanon", "Jordan"],
    popularity: "common",
    variations: ["Leila", "Laila"]
  },
  "MAHMOUD": {
    meaning: "Praised, commendable",
    origin: "Arabic",
    gender: "male",
    countries: ["Egypt", "Saudi Arabia", "UAE", "Iran"],
    popularity: "very_common",
    variations: ["Mahmud", "Mehmet"]
  },
  "HASSAN": {
    meaning: "Handsome, good",
    origin: "Arabic",
    gender: "male",
    countries: ["Saudi Arabia", "UAE", "Lebanon", "Iraq", "Iran"],
    popularity: "very_common",
    variations: ["Hasan", "Hussein"]
  },
  
  // African Names
  "KWAME": {
    meaning: "Born on Saturday",
    origin: "Akan/Ghanaian",
    gender: "male",
    countries: ["Ghana"],
    popularity: "common",
    culturalContext: "Akan day-name tradition"
  },
  "AKOSUA": {
    meaning: "Born on Sunday",
    origin: "Akan/Ghanaian",
    gender: "female",
    countries: ["Ghana"],
    popularity: "common",
    culturalContext: "Akan day-name tradition"
  },
  "TOLUWANI": {
    meaning: "God owns me",
    origin: "Yoruba/Nigerian",
    gender: "unisex",
    countries: ["Nigeria"],
    popularity: "common"
  },
  "CHIDI": {
    meaning: "God exists",
    origin: "Igbo/Nigerian",
    gender: "male",
    countries: ["Nigeria"],
    popularity: "common"
  },
  "NGOZI": {
    meaning: "Blessing",
    origin: "Igbo/Nigerian",
    gender: "female",
    countries: ["Nigeria"],
    popularity: "common"
  },
  
  // Additional Popular Surnames from Various Countries
  "GONZALEZ": {
    meaning: "Son of Gonzalo",
    origin: "Spanish",
    countries: ["Spain", "Mexico", "Argentina", "United States"],
    popularity: "very_common"
  },
  "MUELLER": {
    meaning: "Miller",
    origin: "German",
    countries: ["Germany", "Austria", "Switzerland", "United States"],
    popularity: "very_common"
  },
  "SCHMIDT": {
    meaning: "Smith, metalworker",
    origin: "German",
    countries: ["Germany", "Austria", "United States"],
    popularity: "very_common"
  },
  "VARGHESE": {
    meaning: "Farmer",
    origin: "Indian/Syriac",
    countries: ["India"],
    popularity: "common"
  },
  "MENON": {
    meaning: "Administrator, minister",
    origin: "Indian/Malayalam",
    countries: ["India"],
    popularity: "common"
  },
  "NAIR": {
    meaning: "Warrior, fighter",
    origin: "Indian/Malayalam",
    countries: ["India"],
    popularity: "very_common"
  },
  "IYER": {
    meaning: "Priest, scholar",
    origin: "Indian/Tamil",
    countries: ["India"],
    popularity: "common"
  },
  "PILLAI": {
    meaning: "Prince, child",
    origin: "Indian/Tamil",
    countries: ["India"],
    popularity: "common"
  },

  // Indian Female Names from Comprehensive Dataset
  "SHIVANI": {
    meaning: "Goddess Parvati, consort of Shiva",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "ISHA": {
    meaning: "Goddess, divine",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "DIVYA": {
    meaning: "Divine, heavenly",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "MANSI": {
    meaning: "Wish, desire, mental power",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "POOJA": {
    meaning: "Prayer, worship, ritual",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "KAJAL": {
    meaning: "Kohl, eyeliner",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "MEENA": {
    meaning: "Fish, gem, precious stone",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "SONAM": {
    meaning: "Merit, virtue, good fortune",
    origin: "Indian/Tibetan",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "ANITA": {
    meaning: "Grace, favor, leader",
    origin: "Spanish/Indian",
    gender: "female",
    countries: ["India", "Spain", "Latin America"],
    popularity: "common"
  },
  "NEETU": {
    meaning: "Sweet, good moral conduct",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "PRIYA": {
    meaning: "Beloved, dear, favorite",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "REKHA": {
    meaning: "Line, boundary, artistic line",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SUNITA": {
    meaning: "Well conducted, good character",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "PRIYANKA": {
    meaning: "Beloved, dear one, loved",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "ANJALI": {
    meaning: "Offering, gesture of respect",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "MANJU": {
    meaning: "Sweet, beautiful, pleasant",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "REENA": {
    meaning: "Gem, beautiful, dissolved",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "NEHA": {
    meaning: "Love, affection, rain",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "KHUSHBOO": {
    meaning: "Fragrance, pleasant smell",
    origin: "Indian/Urdu",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "JYOTI": {
    meaning: "Light, flame, brightness",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "ROSHNI": {
    meaning: "Light, brightness, illumination",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "PARVEEN": {
    meaning: "Star, constellation",
    origin: "Indian/Persian",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "KAVITA": {
    meaning: "Poem, poetry",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "VANDANA": {
    meaning: "Worship, prayer, salutation",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "ARCHANA": {
    meaning: "Worship, offering, devotion",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "KIRAN": {
    meaning: "Ray of light, sunbeam",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SONIA": {
    meaning: "Wisdom, golden",
    origin: "Greek/Russian",
    gender: "female",
    countries: ["India", "Russia", "Italy"],
    popularity: "common"
  },
  "MANISHA": {
    meaning: "Wish, desire, intellect",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common"
  },
  "SUMAN": {
    meaning: "Good mind, beautiful mind",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "LAXMI": {
    meaning: "Goddess of wealth and prosperity",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common",
    culturalContext: "Hindu goddess of wealth and fortune",
    variations: ["Lakshmi"]
  },
  "RADHA": {
    meaning: "Success, prosperity, favorite of Krishna",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common",
    culturalContext: "Divine consort of Lord Krishna in Hindu mythology"
  },
  "GEETA": {
    meaning: "Sacred song, holy text",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common",
    culturalContext: "Refers to Bhagavad Gita, sacred Hindu scripture",
    variations: ["Gita"]
  },
  "SWATI": {
    meaning: "Star, first drop of rain, sword",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "MAMTA": {
    meaning: "Mother's love, affection",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "RAKHI": {
    meaning: "Protection, bond of love",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common",
    culturalContext: "Sacred thread tied in Raksha Bandhan festival"
  },
  "PAYAL": {
    meaning: "Anklet, foot ornament",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "PINKI": {
    meaning: "Little finger, pink",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "NISHA": {
    meaning: "Night",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "RUCHI": {
    meaning: "Taste, interest, desire",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "DEEPIKA": {
    meaning: "Little lamp, light",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "very_common",
    variations: ["Deepika"]
  },
  "SEEMA": {
    meaning: "Boundary, limit, mark",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "RACHNA": {
    meaning: "Creation, composition, work",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SUJATA": {
    meaning: "Well-born, of good birth",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "KAMINI": {
    meaning: "Desirable, beautiful woman",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "MEENAKSHI": {
    meaning: "Fish-eyed, beautiful eyes",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common",
    culturalContext: "Goddess Meenakshi, presiding deity of Madurai"
  },
  "PREETI": {
    meaning: "Love, affection, friendship",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SHILPA": {
    meaning: "Art, sculpture, craftsmanship",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "RENU": {
    meaning: "Particle, atom, sand",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "ANUSHA": {
    meaning: "Beautiful morning, bright",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "NIDHI": {
    meaning: "Treasure, wealth, repository",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SIMRAN": {
    meaning: "Meditation, remembrance of God",
    origin: "Indian/Sanskrit/Punjabi",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "PURVI": {
    meaning: "Eastern direction, ancient",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SNEHA": {
    meaning: "Affection, love, friendship",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "TANVI": {
    meaning: "Beautiful, delicate",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "KRITI": {
    meaning: "Creation, work of art",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "RIYA": {
    meaning: "Singer, graceful",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "ANANYA": {
    meaning: "Unique, incomparable, unmatched",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "POONAM": {
    meaning: "Full moon",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SANDHYA": {
    meaning: "Twilight, evening, dusk",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SHEETAL": {
    meaning: "Cool, soothing",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SAPNA": {
    meaning: "Dream",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "USHA": {
    meaning: "Dawn, morning",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common",
    culturalContext: "Goddess Usha, goddess of dawn"
  },
  "PALAK": {
    meaning: "Eyelid, care, protection",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "BABITA": {
    meaning: "Musical, one who sings",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SHRUTI": {
    meaning: "Hearing, what is heard, Vedic texts",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common",
    culturalContext: "Refers to sacred Vedic scriptures"
  },
  "SHASHI": {
    meaning: "Moon",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "KALPANA": {
    meaning: "Imagination, fantasy, creation",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SARITA": {
    meaning: "River, flowing",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "MADHU": {
    meaning: "Honey, sweet, spring",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SHWETA": {
    meaning: "White, pure",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "NIRMALA": {
    meaning: "Pure, spotless, clean",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SONALI": {
    meaning: "Golden, beautiful",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SMRITI": {
    meaning: "Memory, tradition, recollection",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common",
    culturalContext: "Refers to Hindu texts based on memory/tradition"
  },
  "BHARATI": {
    meaning: "Indian, belonging to India",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "KIRTI": {
    meaning: "Fame, glory, achievement",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SHAKSHI": {
    meaning: "Witness, testimony",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "NEELAM": {
    meaning: "Sapphire, blue gem",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "KANIKA": {
    meaning: "Small particle, atom, grain",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "MONIKA": {
    meaning: "Advisor, counselor, alone",
    origin: "Latin/Indian",
    gender: "female",
    countries: ["India", "Poland", "Germany"],
    popularity: "common"
  },
  "NAGMA": {
    meaning: "Melody, tune, musical note",
    origin: "Indian/Urdu",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "LAYBA": {
    meaning: "Night, darkness",
    origin: "Indian/Arabic",
    gender: "female",
    countries: ["India"],
    popularity: "uncommon"
  },
  "IQRA": {
    meaning: "Read, recite, first word revealed in Quran",
    origin: "Arabic/Indian",
    gender: "female",
    countries: ["India", "Pakistan"],
    popularity: "common",
    culturalContext: "First word revealed to Prophet Muhammad in Islamic tradition"
  },
  "SALIMA": {
    meaning: "Safe, secure, peaceful",
    origin: "Arabic/Indian",
    gender: "female",
    countries: ["India", "Pakistan"],
    popularity: "common"
  },
  "PRITI": {
    meaning: "Love, affection",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common"
  },
  "SHEHNAZ": {
    meaning: "Pride of the king",
    origin: "Persian/Indian",
    gender: "female",
    countries: ["India", "Pakistan"],
    popularity: "common"
  },
  "GURDEEP": {
    meaning: "Light of the Guru",
    origin: "Indian/Punjabi",
    gender: "female",
    countries: ["India"],
    popularity: "common",
    culturalContext: "Sikh name, often used with 'Kaur'"
  },
  "TARANNUM": {
    meaning: "Musical note, melody, recitation",
    origin: "Arabic/Urdu/Indian",
    gender: "female",
    countries: ["India", "Pakistan"],
    popularity: "common"
  },
  "TULSI": {
    meaning: "Sacred basil plant",
    origin: "Indian/Sanskrit",
    gender: "female",
    countries: ["India"],
    popularity: "common",
    culturalContext: "Sacred plant in Hindu tradition"
  },
};

// Common prefixes to strip from names (especially in Indian names)
const COMMON_PREFIXES = ['MD', 'MD.', 'MR', 'MR.', 'MRS', 'MRS.', 'MS', 'MS.', 'DR', 'DR.', 'PROF', 'PROF.', 'S/O', 'D/O', 'W/O', '@'];

// Helper function to normalize name for lookup
function normalizeName(name: string): string {
  let normalized = name.trim().toUpperCase().replace(/[^A-Z\s@/]/g, '');
  
  // Strip common prefixes
  for (const prefix of COMMON_PREFIXES) {
    const prefixRegex = new RegExp(`^${prefix.replace(/\./g, '\\.')}\\s+`, 'i');
    normalized = normalized.replace(prefixRegex, '');
  }
  
  // Handle @ symbols (often used as "alias" markers in Indian names)
  normalized = normalized.replace(/\s*@\s*/g, ' ');
  
  // Handle S/O, D/O, W/O patterns
  normalized = normalized.replace(/\s*(S|D|W)\/O\s*/g, ' ');
  
  // Clean up multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

// Get name meaning with variation handling
export function getNameMeaning(name: string): string | null {
  if (!name || typeof name !== 'string') {
    return null;
  }

  const normalized = normalizeName(name);
  
  // Direct lookup
  if (NAME_MEANINGS[normalized]) {
    return NAME_MEANINGS[normalized].meaning;
  }

  // Try to find through variations
  for (const [key, data] of Object.entries(NAME_MEANINGS)) {
    if (data.variations && data.variations.some(v => normalizeName(v) === normalized)) {
      return data.meaning;
    }
    
    // Check if the key is a variation of the input
    if (data.variations && data.variations.some(v => normalized.includes(normalizeName(v)) || normalizeName(v).includes(normalized))) {
      return data.meaning;
    }
  }

  // Try partial matches for compound names
  const nameParts = normalized.split(' ');
  for (const part of nameParts) {
    if (NAME_MEANINGS[part]) {
      return NAME_MEANINGS[part].meaning;
    }
  }

  return null;
}

// Get full name data including origin and cultural context
export function getNameData(name: string): NameData | null {
  if (!name || typeof name !== 'string') {
    return null;
  }

  const normalized = normalizeName(name);
  
  // Direct lookup
  if (NAME_MEANINGS[normalized]) {
    return NAME_MEANINGS[normalized];
  }

  // Try to find through variations
  for (const [key, data] of Object.entries(NAME_MEANINGS)) {
    if (data.variations && data.variations.some(v => normalizeName(v) === normalized)) {
      return data;
    }
  }

  // Try partial matches for compound names
  const nameParts = normalized.split(' ');
  for (const part of nameParts) {
    if (NAME_MEANINGS[part]) {
      return NAME_MEANINGS[part];
    }
  }

  return null;
}

// Get name meanings for all parts of a full name (enhanced with gender, countries, popularity)
export function getAllNameMeanings(fullName: string): Array<{ 
  name: string; 
  meaning: string; 
  origin?: string;
  gender?: 'male' | 'female' | 'unisex';
  countries?: string[];
  popularity?: 'very_common' | 'common' | 'uncommon' | 'rare';
  culturalContext?: string;
}> {
  if (!fullName || typeof fullName !== 'string') {
    return [];
  }

  // Normalize the full name first to strip prefixes
  const normalizedFullName = normalizeName(fullName);
  const nameParts = normalizedFullName.split(/\s+/).filter(part => part.length > 0);
  const results: Array<{ 
    name: string; 
    meaning: string; 
    origin?: string;
    gender?: 'male' | 'female' | 'unisex';
    countries?: string[];
    popularity?: 'very_common' | 'common' | 'uncommon' | 'rare';
    culturalContext?: string;
  }> = [];

  // Also keep original parts for display
  const originalParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);

  for (let i = 0; i < nameParts.length; i++) {
    const normalizedPart = nameParts[i];
    const originalPart = originalParts[i] || normalizedPart;
    
    // Skip if part is a common prefix or empty
    if (COMMON_PREFIXES.includes(normalizedPart) || normalizedPart.length < 2) {
      continue;
    }
    
    const nameData = getNameData(normalizedPart);
    if (nameData) {
      results.push({
        name: originalPart,
        meaning: nameData.meaning,
        origin: nameData.origin,
        gender: nameData.gender,
        countries: nameData.countries,
        popularity: nameData.popularity,
        culturalContext: nameData.culturalContext
      });
    } else {
      // Still include the part even if meaning not found
      results.push({
        name: originalPart,
        meaning: "Meaning not available",
        origin: undefined,
        gender: undefined,
        countries: undefined,
        popularity: undefined,
        culturalContext: undefined
      });
    }
  }

  return results;
}
