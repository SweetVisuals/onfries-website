export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  hiddenFromCustomers?: boolean; // Optional: if true, item is hidden from customer menu but available to admins
  stockRequirements?: Array<{ stockItem: string; quantity: number }>; // Stock items required for this menu item
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
    id: '567b6a07-f08a-48dc-8401-350900404a5a',
    name: 'Deluxe Steak & Fries',
    description: 'Premium quality steak with our signature fries and special seasoning',
    price: 20.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/6OOSSLNURTSVHRO36DLMV6C6.png?width=1280&dpr=1',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 25,
    stockRequirements: [
      { stockItem: 'Steaks', quantity: 1 },
      { stockItem: 'Fries', quantity: 1 }
    ]
  },
  {
    id: 'bafb0ca1-7a7d-477c-95db-8340750d5073',
    name: 'Steak & Fries',
    description: 'Premium steak served with crispy fries and signature seasoning',
    price: 12.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/DXFSUZVE3QCNQ3N5KPF7ZJTE.png?width=1280&dpr=1',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 20,
    stockRequirements: [
      { stockItem: 'Steaks', quantity: 1 },
      { stockItem: 'Fries', quantity: 1 }
    ]
  },
  {
    id: 'dcdedc23-359a-4120-9c3c-488386410364',
    name: 'Steak Only',
    description: 'Premium steak served alone',
    price: 10.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/6SFFU72IPYBV2HVSIGQGO6J6.png?width=1280&dpr=1',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 20,
    stockRequirements: [
      { stockItem: 'Steaks', quantity: 1 }
    ]
  },
  {
    id: '135dda9e-ce09-480a-b7cc-fa48a202fa0b',
    name: 'Signature Fries',
    description: 'Crispy fries with our signature seasoning',
    price: 4.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/F4SJYJKOG4HP5W3QK3UUSJMK.png?width=1280&dpr=1',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 10,
    stockRequirements: [
      { stockItem: 'Fries', quantity: 1 }
    ]
  },

  // Add-ons (Sauces and Steak)
  {
    id: 'f119d64e-3340-4552-a207-58171cf328f0',
    name: 'Green Sauce',
    description: 'Extra green sauce add-on',
    price: 2.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/NF3GQDBUTZMAESKUJDRR5YRP.png?width=1280&dpr=1',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0,
    stockRequirements: [
      { stockItem: 'Green Sauce', quantity: 1 }
    ]
  },
  {
    id: 'f9d7308a-399c-4abe-a125-237fc4722824',
    name: 'Red Sauce',
    description: 'Extra red sauce add-on',
    price: 2.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/JNTJIXFN36T2FGWYR62YCQA2.png?width=1280&dpr=1',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0,
    stockRequirements: [
      { stockItem: 'Red Sauce', quantity: 1 }
    ]
  },
  {
    id: '4d26334c-0d1e-4c3e-8b87-1075c66b678b',
    name: 'Steak',
    description: 'Extra steak add-on',
    price: 10.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/6SFFU72IPYBV2HVSIGQGO6J6.png?width=1280&dpr=1',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 20,
    stockRequirements: [
      { stockItem: 'Steaks', quantity: 1 }
    ]
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Short Rib',
    description: 'Extra short rib add-on',
    price: 12.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/6SFFU72IPYBV2HVSIGQGO6J6.png?width=1280&dpr=1',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 25,
    stockRequirements: [
      { stockItem: 'Short Rib', quantity: 1 }
    ]
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    name: 'Lamb Chop',
    description: 'Extra lamb chop add-on',
    price: 14.00,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/6SFFU72IPYBV2HVSIGQGO6J6.png?width=1280&dpr=1',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 25,
    stockRequirements: [
      { stockItem: 'Lamb', quantity: 1 }
    ]
  },

  // Kids Menu
  {
    id: '2836bb5e-3d5e-4a8a-8b63-64b55786b5d4',
    name: 'Kids Meal',
    description: 'Specially curated meal for kids',
    price: 10.00,
    image: '',
    category: 'Kids',
    isAvailable: true,
    preparationTime: 15,
    stockRequirements: [
      { stockItem: 'Steaks', quantity: 1 },
      { stockItem: 'Fries', quantity: 1 }
    ]
  },
  {
    id: '40902b4c-4e1e-46b3-8d91-e44b0bb800cf',
    name: 'Kids Fries',
    description: 'Perfect portion of crispy fries made just for kids',
    price: 2.00,
    image: '',
    category: 'Kids',
    isAvailable: true,
    preparationTime: 8,
    stockRequirements: [
      { stockItem: 'Fries', quantity: 1 }
    ]
  },
  {
    id: '73919a44-13f5-4976-9cd5-9ab2ec6a9aef',
    name: '£1 Steak Cone',
    description: 'Small portion of steak in a convenient cone',
    price: 1.00,
    image: '',
    category: 'Kids',
    isAvailable: true,
    preparationTime: 12,
    hiddenFromCustomers: true,
    stockRequirements: [
      { stockItem: 'Steaks', quantity: 1 }
    ]
  },

  // Drinks
  {
    id: '4495999f-0737-43c2-a961-9601a2677a66',
    name: 'Coke',
    description: 'Classic Coca-Cola soft drink',
    price: 1.50,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/YKJMQTYWVUGLVJ5B3ZCGQG2A.png?width=1280&dpr=1',
    category: 'Drinks',
    isAvailable: true,
    preparationTime: 0,
    stockRequirements: [
      { stockItem: 'Coke / Pepsi', quantity: 1 }
    ]
  },
  {
    id: '4664385c-0601-4496-94c9-57fbb007a34d',
    name: 'Coke Zero',
    description: 'Zero sugar Coca-Cola soft drink',
    price: 1.50,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/XGIYCNYWF23HFU37YSMNFE3S.png?width=1280&dpr=1',
    category: 'Drinks',
    isAvailable: true,
    preparationTime: 0,
    stockRequirements: [
      { stockItem: 'Coke Zero', quantity: 1 }
    ]
  },
  {
    id: '992f34f6-6bda-475d-8273-4ba06e115fca',
    name: 'Tango Mango',
    description: 'Tango Mango flavored soft drink',
    price: 1.50,
    image: 'https://146870153.cdn6.editmysite.com/uploads/1/4/6/8/146870153/YPB5YADLUFL73LJVFDSZJYTY.png?width=1280&dpr=1',
    category: 'Drinks',
    isAvailable: true,
    preparationTime: 0,
    stockRequirements: [
      { stockItem: 'Tango Mango', quantity: 1 }
    ]
  }
];