// English translations. This object is the source of truth for the
// translation key schema — every other locale must match its shape.
const en = {
  appName: 'AgriK2K',
  slogan: 'Khmer Help Khmer — Support Our National Products',
  langName: 'English',

  tab: { market: 'Market', sell: 'Sell', doctor: 'Crop Doctor', calendar: 'Calendar', profile: 'Profile' },

  common: {
    loading: 'Loading…', save: 'Save', cancel: 'Cancel', submit: 'Submit', send: 'Send',
    all: 'All', search: 'Search', retry: 'Retry', back: 'Back', optional: 'optional',
    kg: 'kg', riel: 'KHR', perKg: '/kg', close: 'Close', confirm: 'Confirm', success: 'Success',
  },

  category: { Rice: 'Rice', Vegetables: 'Vegetables', Fruits: 'Fruits', 'Spices/Pepper': 'Spices / Pepper', Other: 'Other' },
  role: { farmer: 'Farmer', buyer: 'Buyer', logistics: 'Logistics' },

  market: {
    title: 'Marketplace',
    subtitle: 'Fresh produce direct from Cambodian farmers',
    filterCategory: 'Category',
    filterProvince: 'Province',
    searchPlaceholder: 'Search crops…',
    sortLabel: 'Sort',
    sortNewest: 'Newest',
    sortPriceLow: 'Price: low → high',
    sortPriceHigh: 'Price: high → low',
    empty: 'No crops match your filter.',
    available: 'available',
    by: 'by',
    buy: 'Buy now',
  },

  auth: {
    signIn: 'Sign in / Register',
    phonePrompt: 'Enter your phone number to receive a verification code.',
    sendCode: 'Send code',
    codeSent: 'We sent a 6-digit code to',
    devCode: 'Dev code',
    enterCode: 'Enter the 6-digit code',
    verify: 'Verify & continue',
    changePhone: 'Change number',
    completeProfile: 'Complete your profile',
    resend: 'Resend code',
  },

  detail: {
    title: 'Crop Details',
    farmer: 'Farmer', province: 'Province', district: 'District',
    quantity: 'Quantity available', price: 'Price', harvest: 'Harvest date',
    deliveryAddress: 'Delivery address', deliveryPlaceholder: 'House #, street, commune, district…',
    orderQty: 'Quantity to buy (kg)', placeOrder: 'Place escrow order',
    total: 'Total', orderCreated: 'Order created!', scanToPay: 'Scan to pay (Bakong / ABA KHQR)',
    escrowNote: 'Funds are held in escrow and released to the farmer on delivery.',
    markPaid: 'I have paid (fund escrow)', markDelivered: 'Mark delivered (release funds)',
    orderStatus: 'Order status',
  },

  sell: {
    title: 'Sell Your Crop',
    subtitle: 'Publish a new produce listing',
    cropName: 'Crop name', cropNamePlaceholder: 'e.g. Jasmine Rice, Kampot Pepper…',
    category: 'Category', quantity: 'Quantity (kg)', price: 'Price per kg (KHR)',
    harvest: 'Harvest date', photo: 'Crop photo', addPhoto: 'Take / choose photo',
    compressing: 'Compressing image…', publish: 'Publish listing', published: 'Listing published!',
    needFarmer: 'Register as a farmer first (Profile tab).',
  },

  doctor: {
    title: 'Crop Doctor',
    subtitle: 'Ask our AI agronomist in Khmer',
    hold: 'Hold to speak',
    recording: 'Recording… release to send',
    typePlaceholder: 'Describe the problem… e.g. my corn has brown spots and worms',
    cropContext: 'Crop (optional)',
    ask: 'Ask the advisor',
    thinking: 'The advisor is thinking…',
    listen: 'Listen', stop: 'Stop',
    micDenied: 'Microphone not available — please type your question.',
    answer: 'Advice',
    addPhoto: 'Attach plant photo',
    photoHint: 'Add a photo of the damaged leaf/fruit for a better diagnosis',
    diagnosePhoto: 'Diagnose from photo',
    removePhoto: 'Remove photo',
  },

  calendar: {
    title: 'Smart Crop Calendar',
    subtitle: 'Plan seed, compost and cycles for your land',
    province: 'Province', category: 'Crop type', hectares: 'Land size (hectares)',
    calculate: 'Calculate plan',
    seedNeeded: 'Seed needed', compostNeeded: 'Compost needed', cycle: 'Growing cycle',
    days: 'days', rotation: 'Rotation plan', heavyZone: 'High-yield rice rotation zone',
  },

  profile: {
    title: 'Profile', subtitle: 'Your AgriK2K account',
    notRegistered: 'You are not registered yet.',
    register: 'Register', name: 'Full name', role: 'I am a', phone: 'Phone number',
    province: 'Province', district: 'District', khqr: 'Bakong / ABA KHQR string',
    khqrHelp: 'Paste your KHQR so buyers can pay you. Farmers only.',
    create: 'Create account', loggedInAs: 'Signed in as', logout: 'Sign out',
    myOrders: 'My orders', language: 'Language',
  },

  status: {
    created: 'Created', paid_escrow: 'Paid (escrow)', in_transit: 'In transit',
    delivered: 'Delivered', completed: 'Completed', disputed: 'Disputed',
    available: 'Available', pending_payment: 'Pending payment', sold_out: 'Sold out',
  },

  error: { generic: 'Something went wrong.', network: 'Cannot reach the server.', required: 'Please fill required fields.' },
};

export type TranslationSchema = typeof en;
export default en;
