import type { TranslationSchema } from './en';

// Khmer translations (default language). Must mirror the en key schema.
const km: TranslationSchema = {
  appName: 'AgriK2K',
  slogan: 'ខ្មែរជួយខ្មែរ — គាំទ្រផលិតផលជាតិ',
  langName: 'ខ្មែរ',

  tab: { market: 'ផ្សារ', sell: 'លក់', doctor: 'គ្រូពេទ្យដំណាំ', calendar: 'ប្រតិទិន', profile: 'គណនី' },

  common: {
    loading: 'កំពុងផ្ទុក…', save: 'រក្សាទុក', cancel: 'បោះបង់', submit: 'បញ្ជូន', send: 'ផ្ញើ',
    all: 'ទាំងអស់', search: 'ស្វែងរក', retry: 'ព្យាយាមម្ដងទៀត', back: 'ត្រឡប់', optional: 'ស្រេចចិត្ត',
    kg: 'គីឡូ', riel: 'រៀល', perKg: '/គីឡូ', close: 'បិទ', confirm: 'បញ្ជាក់', success: 'ជោគជ័យ',
  },

  category: { Rice: 'ស្រូវ/អង្ករ', Vegetables: 'បន្លែ', Fruits: 'ផ្លែឈើ', 'Spices/Pepper': 'គ្រឿងទេស / ម្រេច', Other: 'ផ្សេងៗ' },
  role: { farmer: 'កសិករ', buyer: 'អ្នកទិញ', logistics: 'ដឹកជញ្ជូន' },

  market: {
    title: 'ផ្សារកសិផល',
    subtitle: 'ផលិតផលស្រស់ៗ ផ្ទាល់ពីកសិករខ្មែរ',
    filterCategory: 'ប្រភេទ',
    filterProvince: 'ខេត្ត',
    searchPlaceholder: 'ស្វែងរកដំណាំ…',
    sortLabel: 'តម្រៀប',
    sortNewest: 'ថ្មីបំផុត',
    sortPriceLow: 'តម្លៃ៖ ទាប → ខ្ពស់',
    sortPriceHigh: 'តម្លៃ៖ ខ្ពស់ → ទាប',
    empty: 'គ្មានដំណាំត្រូវនឹងតម្រងរបស់អ្នកទេ។',
    available: 'មានស្តុក',
    by: 'ដោយ',
    buy: 'ទិញឥឡូវ',
  },

  auth: {
    signIn: 'ចូល / ចុះឈ្មោះ',
    phonePrompt: 'បញ្ចូលលេខទូរស័ព្ទរបស់អ្នក ដើម្បីទទួលលេខកូដផ្ទៀងផ្ទាត់។',
    sendCode: 'ផ្ញើលេខកូដ',
    codeSent: 'យើងបានផ្ញើលេខកូដ ៦ ខ្ទង់ទៅកាន់',
    devCode: 'លេខកូដ (Dev)',
    enterCode: 'បញ្ចូលលេខកូដ ៦ ខ្ទង់',
    verify: 'ផ្ទៀងផ្ទាត់ និងបន្ត',
    changePhone: 'ប្ដូរលេខទូរស័ព្ទ',
    completeProfile: 'បំពេញព័ត៌មានគណនី',
    resend: 'ផ្ញើលេខកូដម្ដងទៀត',
  },

  detail: {
    title: 'ព័ត៌មានដំណាំ',
    farmer: 'កសិករ', province: 'ខេត្ត', district: 'ស្រុក',
    quantity: 'បរិមាណមានស្តុក', price: 'តម្លៃ', harvest: 'ថ្ងៃប្រមូលផល',
    deliveryAddress: 'អាសយដ្ឋានដឹកជញ្ជូន', deliveryPlaceholder: 'ផ្ទះលេខ ផ្លូវ ឃុំ ស្រុក…',
    orderQty: 'បរិមាណចង់ទិញ (គីឡូ)', placeOrder: 'បញ្ជាទិញ (Escrow)',
    total: 'សរុប', orderCreated: 'បានបង្កើតការបញ្ជាទិញ!', scanToPay: 'ស្កេនដើម្បីបង់ប្រាក់ (Bakong / ABA KHQR)',
    escrowNote: 'ប្រាក់ត្រូវបានរក្សាទុកក្នុង Escrow ហើយផ្ទេរទៅកសិករពេលដឹកដល់។',
    markPaid: 'ខ្ញុំបានបង់ប្រាក់ (បញ្ចូល Escrow)', markDelivered: 'បានដឹកដល់ (ផ្ទេរប្រាក់)',
    orderStatus: 'ស្ថានភាពការបញ្ជាទិញ',
  },

  sell: {
    title: 'លក់ដំណាំរបស់អ្នក',
    subtitle: 'បង្ហោះកសិផលថ្មី',
    cropName: 'ឈ្មោះដំណាំ', cropNamePlaceholder: 'ឧ. អង្ករផ្កាម្លិះ, ម្រេចកំពត…',
    category: 'ប្រភេទ', quantity: 'បរិមាណ (គីឡូ)', price: 'តម្លៃក្នុងមួយគីឡូ (រៀល)',
    harvest: 'ថ្ងៃប្រមូលផល', photo: 'រូបថតដំណាំ', addPhoto: 'ថត / ជ្រើសរើសរូប',
    compressing: 'កំពុងបង្រួមរូបភាព…', publish: 'បង្ហោះ', published: 'បានបង្ហោះរួចរាល់!',
    needFarmer: 'សូមចុះឈ្មោះជាកសិករជាមុនសិន (ផ្ទាំងគណនី)។',
  },

  doctor: {
    title: 'គ្រូពេទ្យដំណាំ',
    subtitle: 'សួរអ្នកជំនាញកសិកម្ម AI ជាភាសាខ្មែរ',
    hold: 'សង្កត់ដើម្បីនិយាយ',
    recording: 'កំពុងថត… លែងដៃដើម្បីផ្ញើ',
    typePlaceholder: 'ពិពណ៌នាបញ្ហា… ឧ. ពោតរបស់ខ្ញុំមានស្នាមត្នោត និងដង្កូវ',
    cropContext: 'ដំណាំ (ស្រេចចិត្ត)',
    ask: 'សួរអ្នកប្រឹក្សា',
    thinking: 'អ្នកប្រឹក្សាកំពុងគិត…',
    listen: 'ស្ដាប់', stop: 'បញ្ឈប់',
    micDenied: 'មីក្រូហ្វូនមិនអាចប្រើបាន — សូមវាយបញ្ចូលសំណួររបស់អ្នក។',
    answer: 'ការណែនាំ',
    addPhoto: 'ភ្ជាប់រូបថតដំណាំ',
    photoHint: 'បន្ថែមរូបថតស្លឹក/ផ្លែដែលខូច ដើម្បីការវិនិច្ឆ័យកាន់តែត្រឹមត្រូវ',
    diagnosePhoto: 'វិនិច្ឆ័យតាមរូបថត',
    removePhoto: 'លុបរូបថត',
  },

  calendar: {
    title: 'ប្រតិទិនដំណាំឆ្លាតវៃ',
    subtitle: 'គណនាគ្រាប់ពូជ ជី និងវដ្តសម្រាប់ដីរបស់អ្នក',
    province: 'ខេត្ត', category: 'ប្រភេទដំណាំ', hectares: 'ទំហំដី (ហិកតា)',
    calculate: 'គណនាផែនការ',
    seedNeeded: 'គ្រាប់ពូជត្រូវការ', compostNeeded: 'ជីកំប៉ុសត្រូវការ', cycle: 'វដ្តដាំ',
    days: 'ថ្ងៃ', rotation: 'ផែនការបង្វិលដំណាំ', heavyZone: 'តំបន់បង្វិលស្រូវទិន្នផលខ្ពស់',
  },

  profile: {
    title: 'គណនី', subtitle: 'គណនី AgriK2K របស់អ្នក',
    notRegistered: 'អ្នកមិនទាន់បានចុះឈ្មោះទេ។',
    register: 'ចុះឈ្មោះ', name: 'ឈ្មោះពេញ', role: 'ខ្ញុំជា', phone: 'លេខទូរស័ព្ទ',
    province: 'ខេត្ត', district: 'ស្រុក', khqr: 'លេខ KHQR (Bakong / ABA)',
    khqrHelp: 'បិទភ្ជាប់ KHQR របស់អ្នក ដើម្បីឱ្យអ្នកទិញបង់ប្រាក់បាន។ សម្រាប់កសិករប៉ុណ្ណោះ។',
    create: 'បង្កើតគណនី', loggedInAs: 'បានចូលជា', logout: 'ចេញ',
    myOrders: 'ការបញ្ជាទិញរបស់ខ្ញុំ', language: 'ភាសា',
  },

  status: {
    created: 'បានបង្កើត', paid_escrow: 'បានបង់ (Escrow)', in_transit: 'កំពុងដឹក',
    delivered: 'បានដឹកដល់', completed: 'បានបញ្ចប់', disputed: 'មានវិវាទ',
    available: 'មានស្តុក', pending_payment: 'រង់ចាំការបង់ប្រាក់', sold_out: 'អស់ស្តុក',
  },

  error: { generic: 'មានបញ្ហាកើតឡើង។', network: 'មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។', required: 'សូមបំពេញព័ត៌មានចាំបាច់។' },
};

export default km;
