export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
}

export const menuCategories = [
  'All',
  'Main Courses',
  'Kids',
  'Drinks'
];

export const menuItems: MenuItem[] = [
  // Main Menu
  {
    id: '2',
    name: 'Deluxe Steak & Fries',
    description: 'Premium quality steak with our signature fries and special seasoning',
    price: 20.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/6OOSSLNURTSVHRO36DLMV6C6.png?width=1280&dpr=1',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 25
  },
  {
    id: '1',
    name: 'Steak & Fries',
    description: 'Premium steak served with crispy fries and signature seasoning',
    price: 12.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/DXFSUZVE3QCNQ3N5KPF7ZJTE.png?width=1280&dpr=1',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 20
  },
  {
    id: '8',
    name: 'Steak Only',
    description: 'Premium steak served alone',
    price: 10.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/6SFFU72IPYBV2HVSIGQGO6J6.png?width=1280&dpr=1',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 20
  },
  {
    id: '3',
    name: 'Signature Fries',
    description: 'Crispy fries with our signature seasoning',
    price: 4.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/F4SJYJKOG4HP5W3QK3UUSJMK.png?width=1280&dpr=1',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 10
  },

  // Add-ons (Sauces)
  {
    id: '9',
    name: 'Green Sauce',
    description: 'Extra green sauce add-on',
    price: 2.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/NF3GQDBUTZMAESKUJDRR5YRP.png?width=1280&dpr=1',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '10',
    name: 'Red Sauce',
    description: 'Extra red sauce add-on',
    price: 2.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/JNTJIXFN36T2FGWYR62YCQA2.png?width=1280&dpr=1',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },

  // Kids Menu
  {
    id: '4',
    name: 'Kids Meal',
    description: 'Specially curated meal for kids',
    price: 10.00,
    image: '',
    category: 'Kids',
    isAvailable: true,
    preparationTime: 15
  },
  {
    id: '5',
    name: 'Kids Fries',
    description: 'Perfect portion of crispy fries made just for kids',
    price: 2.00,
    image: '',
    category: 'Kids',
    isAvailable: true,
    preparationTime: 8
  },
  {
    id: '6',
    name: '£1 Steak Cone',
    description: 'Small portion of steak in a convenient cone',
    price: 1.00,
    image: '',
    category: 'Kids',
    isAvailable: true,
    preparationTime: 12
  },

  // Drinks
  {
    id: '7',
    name: 'Coke',
    description: 'Classic Coca-Cola soft drink',
    price: 1.50,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/YKJMQTYWVUGLVJ5B3ZCGQG2A.png?width=1280&dpr=1',
    category: 'Drinks',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '11',
    name: 'Coke Zero',
    description: 'Zero sugar Coca-Cola soft drink',
    price: 1.50,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/XGIYCNYWF23HFU37YSMNFE3S.png?width=1280&dpr=1',
    category: 'Drinks',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '12',
    name: 'Tango Mango',
    description: 'Tango Mango flavored soft drink',
    price: 1.50,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/YPB5YADLUFL73LJVFDSZJYTY.png?width=1280&dpr=1',
    category: 'Drinks',
    isAvailable: true,
    preparationTime: 0
  }
];