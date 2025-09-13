import { Equipment } from '../types';

export const mockEquipment: Equipment[] = [
  // Video Production Equipment
  {
    id: 1,
    mainCategory: "production",
    name: "Sony FX6 Cinema Camera",
    category: "video",
    subcategory: "cameras",
    description: "Professional full-frame cinema camera with dual base ISO",
    image: "https://images.pexels.com/photos/274973/pexels-photo-274973.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Full Frame Sensor", "10-bit 4:2:2", "Dual Base ISO", "S-Cinetone"]
  },
  {
    id: 2,
    mainCategory: "production",
    name: "Canon C70 Cinema Camera",
    category: "video",
    subcategory: "cameras", 
    description: "Compact RF-mount cinema camera with Super 35mm sensor",
    image: "https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Super 35mm Sensor", "4K DCI", "Canon Log", "RF Mount"]
  },
  {
    id: 3,
    mainCategory: "production",
    name: "RED Komodo 6K",
    category: "video",
    subcategory: "cameras",
    description: "Ultra-compact 6K global shutter cinema camera",
    image: "https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["6K Global Shutter", "R3D RAW", "Canon RF Mount", "120fps"]
  },
  {
    id: 4,
    mainCategory: "production",
    name: "Canon 24-70mm f/2.8L IS",
    category: "video",
    subcategory: "lenses",
    description: "Professional zoom lens with image stabilization",
    image: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["24-70mm", "f/2.8", "Image Stabilization", "Weather Sealed"]
  },
  {
    id: 5,
    mainCategory: "production",
    name: "Sony 85mm f/1.4 GM",
    category: "video",
    subcategory: "lenses",
    description: "Premium portrait lens with beautiful bokeh",
    image: "https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["85mm", "f/1.4", "G Master", "Fast AF"]
  },
  {
    id: 6,
    mainCategory: "production",
    name: "Sachtler FSB 8 Tripod",
    category: "video",
    subcategory: "support",
    description: "Professional fluid head tripod system",
    image: "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["8kg Payload", "Fluid Head", "Carbon Fiber Legs", "Touch & Go Plate"]
  },
  {
    id: 7,
    mainCategory: "production",
    name: "DJI Ronin 4D",
    category: "video",
    subcategory: "stabilizers",
    description: "4-axis cinema camera with integrated gimbal",
    image: "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["4-axis Gimbal", "6K Full Frame", "ActiveTrack", "LiDAR Focus"]
  },
  {
    id: 8,
    mainCategory: "production",
    name: "Atomos Ninja V",
    category: "video",
    subcategory: "monitors",
    description: "5-inch HDR monitor/recorder with SSD recording",
    image: "https://images.pexels.com/photos/3945316/pexels-photo-3945316.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["5-inch HDR", "4K Recording", "SSD Compatible", "1000 nits"]
  },
  {
    id: 9,
    mainCategory: "production",
    name: "SmallRig Camera Cage",
    category: "video",
    subcategory: "accessories",
    description: "Modular camera cage system for rigging",
    image: "https://images.pexels.com/photos/3945314/pexels-photo-3945314.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Modular Design", "1/4-20 Threads", "Cold Shoe Mounts", "Lightweight"]
  },
  {
    id: 10,
    mainCategory: "production",
    name: "V-Mount Battery Kit",
    category: "video",
    subcategory: "power",
    description: "Professional battery system with charger",
    image: "https://images.pexels.com/photos/163117/battery-charging-recharging-charge-163117.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["150Wh Capacity", "D-Tap Output", "USB-C", "LCD Display"]
  },
  {
    id: 11,
    mainCategory: "production",
    name: "Blackmagic Video Assist",
    category: "video",
    subcategory: "monitors",
    description: "7-inch touchscreen monitor and recorder",
    image: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["7-inch Touch", "4K Recording", "HDR Preview", "3D LUTs"]
  },
  {
    id: 12,
    mainCategory: "production",
    name: "Canon CN-E 50mm T1.3",
    category: "video",
    subcategory: "lenses",
    description: "Cinema lens with precise manual focus",
    image: "https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["50mm", "T1.3", "Cinema Design", "Parfocal"]
  },
  {
    id: 13,
    mainCategory: "production",
    name: "Follow Focus System",
    category: "video",
    subcategory: "accessories",
    description: "Wireless follow focus with handgrips",
    image: "https://images.pexels.com/photos/3062548/pexels-photo-3062548.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Wireless", "Motors Included", "Handgrip", "0.8 Gear"]
  },
  {
    id: 14,
    mainCategory: "production",
    name: "Matte Box Pro",
    category: "video",
    subcategory: "accessories",
    description: "Professional matte box with filter stages",
    image: "https://images.pexels.com/photos/3062542/pexels-photo-3062542.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["4x5.65 Filters", "3-Stage", "Side Wings", "Carbon Fiber"]
  },
  {
    id: 15,
    mainCategory: "production",
    name: "Wireless Video Transmitter",
    category: "video",
    subcategory: "wireless",
    description: "HD wireless video transmission system",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["1080p60", "500ft Range", "Zero Delay", "HDMI/SDI"]
  },

  // Audio Equipment
  {
    id: 16,
    mainCategory: "production",
    name: "Rode PodMic",
    category: "audio",
    subcategory: "microphones",
    description: "Broadcast-quality dynamic microphone for podcasting",
    image: "https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Dynamic", "XLR", "Internal Pop Shield", "Rich Tone"]
  },
  {
    id: 17,
    mainCategory: "production",
    name: "Shure SM7B",
    category: "audio",
    subcategory: "microphones",
    description: "Professional broadcast dynamic microphone",
    image: "https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Dynamic", "Flat Response", "Pop Filter", "Shock Mount"]
  },
  {
    id: 18,
    mainCategory: "production",
    name: "Audio-Technica AT2020",
    category: "audio",
    subcategory: "microphones",
    description: "Studio condenser microphone with cardioid pattern",
    image: "https://images.pexels.com/photos/3834750/pexels-photo-3834750.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Condenser", "Cardioid", "Phantom Power", "Low Noise"]
  },
  {
    id: 19,
    mainCategory: "production",
    name: "Zoom H6 Handy Recorder",
    category: "audio",
    subcategory: "recorders",
    description: "6-track portable recorder with interchangeable capsules",
    image: "https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["6-Track", "Interchangeable Mics", "Phantom Power", "Backup Recording"]
  },
  {
    id: 20,
    mainCategory: "production",
    name: "Behringer X32 Digital Mixer",
    category: "audio",
    subcategory: "mixers",
    description: "32-channel digital mixing console",
    image: "https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["32 Channels", "Digital", "Built-in Effects", "WiFi Control"]
  },
  {
    id: 21,
    mainCategory: "production",
    name: "JBL EON615 Powered Speaker",
    category: "audio",
    subcategory: "speakers",
    description: "15-inch powered PA speaker with Bluetooth",
    image: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["15-inch", "1000W", "Bluetooth", "Built-in Mixer"]
  },
  {
    id: 22,
    mainCategory: "production",
    name: "Sony MDR-7506 Headphones",
    category: "audio",
    subcategory: "headphones",
    description: "Professional monitoring headphones",
    image: "https://images.pexels.com/photos/3945317/pexels-photo-3945317.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Closed-back", "40mm Drivers", "Foldable", "Industry Standard"]
  },
  {
    id: 23,
    mainCategory: "production",
    name: "Rode Wireless GO II",
    category: "audio",
    subcategory: "wireless",
    description: "Dual-channel wireless microphone system",
    image: "https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Dual Channel", "200m Range", "7-Hour Battery", "TRS/USB-C"]
  },
  {
    id: 24,
    mainCategory: "production",
    name: "Audio Interface 8-Channel",
    category: "audio",
    subcategory: "interfaces",
    description: "8-input/8-output USB audio interface",
    image: "https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["8x8 I/O", "USB 3.0", "Phantom Power", "Low Latency"]
  },
  {
    id: 25,
    mainCategory: "production",
    name: "Boom Pole Kit",
    category: "audio",
    subcategory: "accessories",
    description: "Professional boom pole with shock mount",
    image: "https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Carbon Fiber", "Extendable", "Shock Mount", "XLR Cable"]
  },
  {
    id: 26,
    mainCategory: "production",
    name: "DI Box Set",
    category: "audio",
    subcategory: "accessories",
    description: "Passive direct injection box set",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Passive", "Ground Lift", "Pad Switch", "XLR Output"]
  },
  {
    id: 27,
    mainCategory: "production",
    name: "Acoustic Treatment Kit",
    category: "audio",
    subcategory: "treatment",
    description: "Portable acoustic panels and bass traps",
    image: "https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Foam Panels", "Bass Traps", "Portable", "Easy Setup"]
  },
  {
    id: 28,
    mainCategory: "production",
    name: "Field Recording Kit",
    category: "audio",
    subcategory: "accessories",
    description: "Complete field recording accessories",
    image: "https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Windscreen", "Shock Mount", "Cables", "Carrying Case"]
  },
  {
    id: 29,
    mainCategory: "production",
    name: "Wireless IEM System",
    category: "audio",
    subcategory: "wireless",
    description: "In-ear monitoring system for performers",
    image: "https://images.pexels.com/photos/3945317/pexels-photo-3945317.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["UHF", "16 Channels", "Belt Pack", "Earphones"]
  },
  {
    id: 30,
    mainCategory: "production",
    name: "Vocal Booth",
    category: "audio",
    subcategory: "treatment",
    description: "Portable vocal isolation booth",
    image: "https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Portable", "Sound Isolation", "Quick Setup", "Compact Storage"]
  },

  // Lighting Equipment
  {
    id: 31,
    mainCategory: "production",
    name: "ARRI SkyPanel S60-C",
    category: "lighting",
    subcategory: "led-panels",
    description: "Color-tunable LED softlight panel",
    image: "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["RGB+W", "60W", "Color Tunable", "DMX Control"]
  },
  {
    id: 32,
    mainCategory: "production",
    name: "Aputure 300D Mark II",
    category: "lighting",
    subcategory: "led-lights",
    description: "300W COB LED light with bowens mount",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["300W COB", "Bowens Mount", "Wireless Control", "5600K"]
  },
  {
    id: 33,
    mainCategory: "production",
    name: "Godox SL-60W",
    category: "lighting",
    subcategory: "led-lights",
    description: "60W LED video light with Bowens mount",
    image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["60W LED", "Bowens Mount", "5600K", "Remote Control"]
  },
  {
    id: 34,
    mainCategory: "production",
    name: "Softbox 90cm",
    category: "lighting",
    subcategory: "modifiers",
    description: "Octagonal softbox for soft lighting",
    image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["90cm Octagon", "Bowens Mount", "Diffusion Fabric", "Quick Setup"]
  },
  {
    id: 35,
    mainCategory: "production",
    name: "Beauty Dish 70cm",
    category: "lighting",
    subcategory: "modifiers",
    description: "Professional beauty dish with honeycomb grid",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["70cm", "Silver Interior", "Honeycomb Grid", "Bowens Mount"]
  },
  {
    id: 36,
    mainCategory: "production",
    name: "Light Stand Kit",
    category: "lighting",
    subcategory: "stands",
    description: "Professional light stands with boom arms",
    image: "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["3m Height", "Air Cushioned", "Boom Arm", "Heavy Duty"]
  },
  {
    id: 37,
    mainCategory: "production",
    name: "5-in-1 Reflector Kit",
    category: "lighting",
    subcategory: "reflectors",
    description: "Collapsible reflector set with multiple surfaces",
    image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["110cm", "5 Surfaces", "Collapsible", "Carrying Case"]
  },
  {
    id: 38,
    mainCategory: "production",
    name: "RGB Tube Lights",
    category: "lighting",
    subcategory: "specialty",
    description: "Color-changing LED tube lights",
    image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["RGB", "120cm Length", "App Control", "Magnetic Mount"]
  },
  {
    id: 39,
    mainCategory: "production",
    name: "Gel Filter Set",
    category: "lighting",
    subcategory: "filters",
    description: "Professional color gel filter collection",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["50 Colors", "Heat Resistant", "Standard Sizes", "Storage Book"]
  },
  {
    id: 40,
    mainCategory: "production",
    name: "Fresnel Spotlight",
    category: "lighting",
    subcategory: "tungsten",
    description: "2000W Fresnel spotlight with barn doors",
    image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["2000W", "Fresnel Lens", "Barn Doors", "Flood/Spot"]
  },
  {
    id: 41,
    mainCategory: "production",
    name: "LED Panel Mat",
    category: "lighting",
    subcategory: "led-panels",
    description: "Flexible LED panel mat for creative lighting",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Flexible", "Bi-Color", "Battery Powered", "Roll-up Design"]
  },
  {
    id: 42,
    mainCategory: "production",
    name: "Honeycomb Grid Set",
    category: "lighting",
    subcategory: "modifiers",
    description: "Precision honeycomb grids for directional lighting",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["10°, 20°, 30°", "Magnetic", "Precision Control", "Universal Fit"]
  },
  {
    id: 43,
    mainCategory: "production",
    name: "Backdrop Stand System",
    category: "lighting",
    subcategory: "stands",
    description: "Heavy-duty backdrop support system",
    image: "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["4m Width", "Telescopic", "Heavy Duty", "Seamless Paper Ready"]
  },
  {
    id: 44,
    mainCategory: "production",
    name: "DMX Controller",
    category: "lighting",
    subcategory: "control",
    description: "24-channel DMX lighting controller",
    image: "https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["24 Channels", "Scene Memory", "Chase Programs", "MIDI Input"]
  },
  {
    id: 45,
    mainCategory: "production",
    name: "Haze Machine",
    category: "lighting",
    subcategory: "effects",
    description: "Professional haze machine for atmosphere",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["DMX Control", "Low Fog", "Remote Control", "Timer Function"]
  },

  // Kitchen/Home Economics Equipment
  {
    id: 46,
    mainCategory: "home-ec-set",
    name: "KitchenAid Stand Mixer",
    category: "home-ec",
    subcategory: "mixers",
    description: "Professional 6-quart stand mixer with accessories",
    image: "https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["6-quart Bowl", "10 Speeds", "Tilt-Head", "Multiple Attachments"]
  },
  {
    id: 47,
    mainCategory: "home-ec-set",
    name: "Convection Oven",
    category: "home-ec",
    subcategory: "ovens",
    description: "Commercial convection oven for baking",
    image: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Convection", "Digital Controls", "Multiple Racks", "Timer"]
  },
  {
    id: 48,
    mainCategory: "home-ec-set",
    name: "Commercial Refrigerator",
    category: "home-ec",
    subcategory: "refrigeration",
    description: "Stainless steel commercial refrigerator",
    image: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Stainless Steel", "Digital Temperature", "Glass Doors", "Energy Efficient"]
  },
  {
    id: 49,
    mainCategory: "home-ec-set",
    name: "Food Processor",
    category: "home-ec",
    subcategory: "processors",
    description: "Heavy-duty food processor with multiple blades",
    image: "https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["14-cup Capacity", "Multiple Blades", "Variable Speed", "Safety Lock"]
  },
  {
    id: 50,
    mainCategory: "home-ec-set",
    name: "Commercial Blender",
    category: "home-ec",
    subcategory: "blenders",
    description: "High-performance blender for smoothies and soups",
    image: "https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["2HP Motor", "Variable Speed", "Sound Enclosure", "Timer"]
  },
  {
    id: 51,
    mainCategory: "home-ec-set",
    name: "Induction Cooktop",
    category: "home-ec",
    subcategory: "cooktops",
    description: "Portable induction cooktop for demonstrations",
    image: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["3500W", "Digital Display", "Temperature Control", "Safety Features"]
  },
  {
    id: 52,
    mainCategory: "home-ec-set",
    name: "Deep Fryer",
    category: "home-ec",
    subcategory: "fryers",
    description: "Electric deep fryer with temperature control",
    image: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["12L Capacity", "Adjustable Temperature", "Safety Filter", "Drain Valve"]
  },
  {
    id: 53,
    mainCategory: "home-ec-set",
    name: "Commercial Dishwasher",
    category: "home-ec",
    subcategory: "cleaning",
    description: "Under-counter commercial dishwasher",
    image: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["High Temp", "Quick Cycles", "Stainless Steel", "Energy Star"]
  },
  {
    id: 54,
    mainCategory: "home-ec-set",
    name: "Kitchen Scale Set",
    category: "home-ec",
    subcategory: "scales",
    description: "Digital kitchen scales for precise measuring",
    image: "https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Digital Display", "Multiple Units", "Tare Function", "11lb Capacity"]
  },
  {
    id: 55,
    mainCategory: "home-ec-set",
    name: "Prep Table",
    category: "home-ec",
    subcategory: "prep-surfaces",
    description: "Stainless steel prep table with storage",
    image: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Stainless Steel", "Adjustable Shelf", "Easy Clean", "Industrial Grade"]
  },
  {
    id: 56,
    mainCategory: "home-ec-set",
    name: "Commercial Mixer",
    category: "home-ec",
    subcategory: "mixers",
    description: "20-quart commercial mixer for large batches",
    image: "https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["20-quart", "3 Speeds", "Safety Guard", "Bowl Lift"]
  },
  {
    id: 57,
    mainCategory: "home-ec-set",
    name: "Warming Tray",
    category: "home-ec",
    subcategory: "warming",
    description: "Large electric warming tray for serving",
    image: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Large Surface", "Adjustable Heat", "Non-stick", "Cool Handles"]
  },
  {
    id: 58,
    mainCategory: "home-ec-set",
    name: "Ice Maker",
    category: "home-ec",
    subcategory: "refrigeration",
    description: "Countertop ice maker for events",
    image: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["26lbs/day", "Self-cleaning", "Compact", "Multiple Sizes"]
  },
  {
    id: 59,
    mainCategory: "home-ec-set",
    name: "Slow Cooker Set",
    category: "home-ec",
    subcategory: "cookers",
    description: "Multiple slow cookers for demonstrations",
    image: "https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["6-quart", "Programmable", "Keep Warm", "Removable Insert"]
  },
  {
    id: 60,
    mainCategory: "home-ec-set",
    name: "Cutting Board Set",
    category: "home-ec",
    subcategory: "prep-tools",
    description: "Professional cutting board set with color coding",
    image: "https://images.pexels.com/photos/4518659/pexels-photo-4518659.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Color Coded", "Non-slip", "Dishwasher Safe", "Multiple Sizes"]
  },

  // Production Set Rentals
  {
    id: 71,
    mainCategory: "home-ec-set",
    name: "Living Room Set - Modern",
    category: "production-set",
    subcategory: "furniture",
    description: "Complete modern living room furniture set",
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["3-piece Sofa Set", "Coffee Table", "Side Tables", "Modern Design"]
  },
  {
    id: 72,
    mainCategory: "home-ec-set",
    name: "Bedroom Set - Victorian",
    category: "production-set",
    subcategory: "furniture",
    description: "Period Victorian bedroom furniture collection",
    image: "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Ornate Bed Frame", "Matching Nightstands", "Dresser", "Period Accurate"]
  },
  {
    id: 73,
    mainCategory: "home-ec-set",
    name: "Office Desk Set",
    category: "production-set",
    subcategory: "furniture",
    description: "Executive office furniture with desk and bookshelf",
    image: "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Executive Desk", "Leather Chair", "Bookshelf", "Professional Look"]
  },
  {
    id: 74,
    mainCategory: "home-ec-set",
    name: "Vintage TV Collection",
    category: "production-set",
    subcategory: "electronics",
    description: "Period television sets from different decades",
    image: "https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["50s-90s TVs", "Working Displays", "Period Accurate", "Multiple Sizes"]
  },
  {
    id: 75,
    mainCategory: "home-ec-set",
    name: "Wall Art Collection",
    category: "production-set",
    subcategory: "decor",
    description: "Curated artwork and framed pieces for set decoration",
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Various Styles", "Framed Pieces", "Multiple Sizes", "Period Options"]
  },
  {
    id: 76,
    mainCategory: "home-ec-set",
    name: "Dining Room Set - 1950s",
    category: "production-set",
    subcategory: "furniture",
    description: "Authentic 1950s dining room table and chairs",
    image: "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["6-person Table", "Matching Chairs", "Period Accurate", "Chrome Accents"]
  },
  {
    id: 77,
    mainCategory: "home-ec-set",
    name: "Persian Rug Collection",
    category: "production-set",
    subcategory: "decor",
    description: "Authentic and replica Persian rugs in various sizes",
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Multiple Sizes", "Traditional Patterns", "High Quality", "Various Colors"]
  },
  {
    id: 78,
    mainCategory: "home-ec-set",
    name: "Musical Instruments Props",
    category: "production-set",
    subcategory: "props",
    description: "Collection of musical instruments for set decoration",
    image: "https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Guitars", "Piano", "Drums", "Brass Instruments"]
  },
  {
    id: 79,
    mainCategory: "home-ec-set",
    name: "Patio Furniture Set",
    category: "production-set",
    subcategory: "outdoor",
    description: "Outdoor furniture for patio and garden scenes",
    image: "https://images.pexels.com/photos/1125137/pexels-photo-1125137.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Weather Resistant", "Table & Chairs", "Umbrella", "Comfortable Seating"]
  },
  {
    id: 80,
    mainCategory: "home-ec-set",
    name: "Vintage Lamp Collection",
    category: "production-set",
    subcategory: "decor",
    description: "Period-appropriate lamps and lighting fixtures",
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Table Lamps", "Floor Lamps", "Various Periods", "Working Condition"]
  },

  // Additional Home Ec Items
  {
    id: 81,
    mainCategory: "home-ec-set",
    name: "Fine China Dinnerware Set",
    category: "home-ec",
    subcategory: "tabletop",
    description: "Elegant porcelain dinnerware for upscale food styling",
    image: "https://images.pexels.com/photos/6107/pexels-photo-6107.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["12-piece Service", "Elegant Design", "Dishwasher Safe", "Multiple Colors"]
  },
  {
    id: 82,
    mainCategory: "home-ec-set",
    name: "Crystal Glassware Collection",
    category: "home-ec",
    subcategory: "tabletop",
    description: "Premium crystal glasses for beverage photography",
    image: "https://images.pexels.com/photos/6107/pexels-photo-6107.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Wine Glasses", "Champagne Flutes", "Water Glasses", "Crystal Clear"]
  },
  {
    id: 83,
    mainCategory: "home-ec-set",
    name: "Professional Flatware Set",
    category: "home-ec",
    subcategory: "tabletop",
    description: "Restaurant-quality stainless steel flatware",
    image: "https://images.pexels.com/photos/6107/pexels-photo-6107.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Stainless Steel", "Multiple Styles", "Dishwasher Safe", "Professional Grade"]
  },
  {
    id: 84,
    mainCategory: "home-ec-set",
    name: "Food Photography Props",
    category: "home-ec",
    subcategory: "food-props",
    description: "Realistic fake food for extended photography sessions",
    image: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Realistic Appearance", "Various Cuisines", "Photo-ready", "Reusable"]
  },
  {
    id: 85,
    mainCategory: "home-ec-set",
    name: "Specialty Baking Tools",
    category: "home-ec",
    subcategory: "kitchenware",
    description: "Professional baking equipment for food preparation",
    image: "https://images.pexels.com/photos/4518659/pexels-photo-4518659.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Pastry Bags", "Decorating Tips", "Rolling Pins", "Cake Pans"]
  },

  // General Equipment
  {
    id: 61,
    mainCategory: "production",
    name: "Folding Tables",
    category: "general",
    subcategory: "furniture",
    description: "6-foot folding tables for events",
    image: "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["6-foot", "Heavy Duty", "Folding Legs", "Easy Transport"]
  },
  {
    id: 62,
    mainCategory: "production",
    name: "Stackable Chairs",
    category: "general",
    subcategory: "furniture",
    description: "Comfortable stackable chairs for events",
    image: "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Stackable", "Padded Seat", "Metal Frame", "Easy Storage"]
  },
  {
    id: 63,
    mainCategory: "production",
    name: "Pop-up Tent 10x10",
    category: "general",
    subcategory: "tents",
    description: "Commercial-grade pop-up tent with sidewalls",
    image: "https://images.pexels.com/photos/1125137/pexels-photo-1125137.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["10x10 ft", "Waterproof", "UV Protection", "Sidewalls Included"]
  },
  {
    id: 64,
    mainCategory: "production",
    name: "Generator 5000W",
    category: "general",
    subcategory: "power",
    description: "Portable generator for outdoor events",
    image: "https://images.pexels.com/photos/163117/battery-charging-recharging-charge-163117.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["5000W", "Fuel Efficient", "Multiple Outlets", "Wheels Included"]
  },
  {
    id: 65,
    mainCategory: "production",
    name: "Extension Cord Kit",
    category: "general",
    subcategory: "power",
    description: "Heavy-duty extension cords in various lengths",
    image: "https://images.pexels.com/photos/163117/battery-charging-recharging-charge-163117.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["12 AWG", "Outdoor Rated", "Lighted Ends", "25ft, 50ft, 100ft"]
  },
  {
    id: 66,
    mainCategory: "production",
    name: "Cooling Fan",
    category: "general",
    subcategory: "hvac",
    description: "Industrial cooling fan for large spaces",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["20-inch", "3 Speeds", "Adjustable Tilt", "Remote Control"]
  },
  {
    id: 67,
    mainCategory: "production",
    name: "Tool Kit",
    category: "general",
    subcategory: "tools",
    description: "Complete tool kit for equipment setup",
    image: "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["50+ Tools", "Carrying Case", "Screwdrivers", "Wrenches"]
  },
  {
    id: 68,
    mainCategory: "production",
    name: "PA System",
    category: "general",
    subcategory: "audio",
    description: "Portable PA system for announcements",
    image: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["Battery Powered", "Wireless Mic", "Bluetooth", "50W Output"]
  },
  {
    id: 69,
    mainCategory: "production",
    name: "Projector Screen",
    category: "general",
    subcategory: "projection",
    description: "Portable projection screen with tripod stand",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["100-inch", "4:3 Aspect", "Tripod Stand", "Carrying Case"]
  },
  {
    id: 70,
    mainCategory: "production",
    name: "Hand Truck",
    category: "general",
    subcategory: "transport",
    description: "Heavy-duty hand truck for equipment transport",
    image: "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    specifications: ["500lb Capacity", "Pneumatic Tires", "Folding", "Steel Construction"]
  }
];

export const categories = [
  { id: 'production', name: 'Production Equipment', icon: 'Camera', description: 'Cameras, audio, lighting, and general production equipment' },
  { id: 'home-ec-set', name: 'Home Ec Equipment', icon: 'ChefHat', description: 'Kitchen equipment, tableware, furniture, and set decoration' }
];
// Original categories for subcategory filtering and display
export const subcategories = [
  { id: 'video', name: 'Video Production', icon: 'Camera', description: 'Professional cameras, lenses, and video equipment' },
  { id: 'audio', name: 'Audio Equipment', icon: 'Mic', description: 'Microphones, mixers, speakers, and recording gear' },
  { id: 'lighting', name: 'Lighting', icon: 'Lightbulb', description: 'LED panels, softboxes, stands, and lighting accessories' },
  { id: 'general', name: 'General Equipment', icon: 'Wrench', description: 'Tables, chairs, tents, generators, and utility items' },
  { id: 'home-ec', name: 'Home Ec Rentals', icon: 'ChefHat', description: 'Kitchen equipment and tableware for food styling and culinary scenes' },
  { id: 'production-set', name: 'Production Equipment', icon: 'Home', description: 'Furniture, decor, and props for film, TV, and commercial sets' }
];