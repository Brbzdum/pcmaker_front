// Mock данные для разработки интерфейса без бэкенда

// Типы компонентов
export const componentTypes = [
  'CPU', 
  'GPU', 
  'RAM', 
  'Motherboard', 
  'Storage', 
  'PowerSupply', 
  'Case', 
  'Cooling'
];

// Производители
export const manufacturers = [
  'Intel', 
  'AMD', 
  'Nvidia', 
  'Corsair', 
  'Kingston', 
  'Asus', 
  'MSI', 
  'Gigabyte', 
  'NZXT', 
  'Cooler Master', 
  'Western Digital', 
  'Samsung', 
  'Seagate'
];

// Пример компонентов
export const components = [
  {
    id: 1,
    name: 'Intel Core i7-12700K',
    type: 'CPU',
    price: 379.99,
    description: 'Высокопроизводительный процессор для игровых ПК и рабочих станций',
    manufacturer: 'Intel',
    specifications: {
      cores: 12,
      threads: 20,
      baseFrequency: '3.6 GHz',
      turboFrequency: '5.0 GHz',
      tdp: 125
    }
  },
  {
    id: 2,
    name: 'AMD Ryzen 7 5800X',
    type: 'CPU',
    price: 329.99,
    description: 'Процессор AMD с высокой производительностью и энергоэффективностью',
    manufacturer: 'AMD',
    specifications: {
      cores: 8,
      threads: 16,
      baseFrequency: '3.8 GHz',
      turboFrequency: '4.7 GHz',
      tdp: 105
    }
  },
  {
    id: 3,
    name: 'Nvidia GeForce RTX 3080',
    type: 'GPU',
    price: 699.99,
    description: 'Мощная видеокарта для игр и работы с графикой',
    manufacturer: 'Nvidia',
    specifications: {
      memory: '10GB GDDR6X',
      cudaCores: 8704,
      boostClock: '1.71 GHz',
      tdp: 320
    }
  },
  {
    id: 4,
    name: 'AMD Radeon RX 6800 XT',
    type: 'GPU',
    price: 649.99,
    description: 'Высокопроизводительная видеокарта AMD',
    manufacturer: 'AMD',
    specifications: {
      memory: '16GB GDDR6',
      streamProcessors: 4608,
      boostClock: '2.25 GHz',
      tdp: 300
    }
  },
  {
    id: 5,
    name: 'Corsair Vengeance RGB Pro 32GB',
    type: 'RAM',
    price: 159.99,
    description: 'Высокоскоростная память с RGB подсветкой',
    manufacturer: 'Corsair',
    specifications: {
      capacity: '32GB (2x16GB)',
      speed: '3200MHz',
      latency: 'CL16',
      voltage: '1.35V'
    }
  },
  {
    id: 6,
    name: 'Kingston FURY Beast 16GB',
    type: 'RAM',
    price: 89.99,
    description: 'Надежная память для игровых систем',
    manufacturer: 'Kingston',
    specifications: {
      capacity: '16GB (2x8GB)',
      speed: '3600MHz',
      latency: 'CL17',
      voltage: '1.35V'
    }
  },
  {
    id: 7,
    name: 'Asus ROG Strix B550-F Gaming',
    type: 'Motherboard',
    price: 179.99,
    description: 'Материнская плата с отличным набором функций для AMD процессоров',
    manufacturer: 'Asus',
    specifications: {
      socket: 'AM4',
      chipset: 'B550',
      memorySlots: 4,
      maxMemory: '128GB',
      pciSlots: 3
    }
  },
  {
    id: 8,
    name: 'MSI MPG Z690 Gaming Edge WiFi',
    type: 'Motherboard',
    price: 289.99,
    description: 'Материнская плата для процессоров Intel 12-го поколения',
    manufacturer: 'MSI',
    specifications: {
      socket: 'LGA 1700',
      chipset: 'Z690',
      memorySlots: 4,
      maxMemory: '128GB',
      pciSlots: 4
    }
  },
  {
    id: 9,
    name: 'Samsung 970 EVO Plus 1TB',
    type: 'Storage',
    price: 129.99,
    description: 'Быстрый и надежный NVMe SSD накопитель',
    manufacturer: 'Samsung',
    specifications: {
      capacity: '1TB',
      interface: 'NVMe PCIe 3.0 x4',
      readSpeed: '3500 MB/s',
      writeSpeed: '3300 MB/s',
      formFactor: 'M.2 2280'
    }
  },
  {
    id: 10,
    name: 'Western Digital Black 2TB',
    type: 'Storage',
    price: 79.99,
    description: 'Высокопроизводительный жесткий диск для игр',
    manufacturer: 'Western Digital',
    specifications: {
      capacity: '2TB',
      interface: 'SATA 6Gb/s',
      rpm: 7200,
      cacheSize: '64MB',
      formFactor: '3.5"'
    }
  },
  {
    id: 11,
    name: 'Corsair RM750x',
    type: 'PowerSupply',
    price: 129.99,
    description: 'Полностью модульный блок питания с сертификатом 80 PLUS Gold',
    manufacturer: 'Corsair',
    specifications: {
      wattage: 750,
      efficiency: '80 PLUS Gold',
      modular: 'Полностью модульный',
      fanSize: '135mm'
    }
  },
  {
    id: 12,
    name: 'NZXT C650',
    type: 'PowerSupply',
    price: 99.99,
    description: 'Надежный блок питания с высокой эффективностью',
    manufacturer: 'NZXT',
    specifications: {
      wattage: 650,
      efficiency: '80 PLUS Gold',
      modular: 'Полностью модульный',
      fanSize: '120mm'
    }
  },
  {
    id: 13,
    name: 'NZXT H510',
    type: 'Case',
    price: 69.99,
    description: 'Компактный и стильный корпус с отличной организацией кабелей',
    manufacturer: 'NZXT',
    specifications: {
      formFactor: 'Mid Tower',
      motherboardSupport: 'ATX, Micro-ATX, Mini-ITX',
      driveSlots: '2x 2.5", 2x 3.5"',
      gpuClearance: '381mm'
    }
  },
  {
    id: 14,
    name: 'Cooler Master MasterCase H500',
    type: 'Case',
    price: 119.99,
    description: 'Просторный корпус с отличной вентиляцией',
    manufacturer: 'Cooler Master',
    specifications: {
      formFactor: 'Mid Tower',
      motherboardSupport: 'ATX, Micro-ATX, Mini-ITX',
      driveSlots: '2x 2.5", 2x 3.5"',
      gpuClearance: '410mm'
    }
  },
  {
    id: 15,
    name: 'Noctua NH-D15',
    type: 'Cooling',
    price: 89.99,
    description: 'Премиальный воздушный кулер для процессора',
    manufacturer: 'Noctua',
    specifications: {
      type: 'Воздушное охлаждение',
      fanSize: '2x 140mm',
      height: '165mm',
      noise: '24.6 dBA'
    }
  },
  {
    id: 16,
    name: 'Corsair H100i RGB Pro XT',
    type: 'Cooling',
    price: 119.99,
    description: 'Жидкостное охлаждение с RGB подсветкой',
    manufacturer: 'Corsair',
    specifications: {
      type: 'Жидкостное охлаждение',
      radiatorSize: '240mm',
      fanSize: '2x 120mm',
      rgb: 'Да'
    }
  }
];

// Пример данных корзины
export const cartItems = [
  {
    id: 101,
    productId: 1,
    name: 'Intel Core i7-12700K',
    price: 379.99,
    quantity: 1,
    type: 'CPU'
  },
  {
    id: 102,
    productId: 3,
    name: 'Nvidia GeForce RTX 3080',
    price: 699.99,
    quantity: 1,
    type: 'GPU'
  }
];

// Пример профиля пользователя
export const userProfile = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  orders: [
    {
      id: 1001,
      date: '2023-09-15',
      status: 'Выполнен',
      total: 1249.97,
      items: [
        {
          id: 1,
          name: 'Intel Core i7-12700K',
          price: 379.99,
          quantity: 1
        },
        {
          id: 3,
          name: 'Nvidia GeForce RTX 3080',
          price: 699.99,
          quantity: 1
        },
        {
          id: 11,
          name: 'Corsair RM750x',
          price: 129.99,
          quantity: 1
        }
      ]
    }
  ],
  savedConfigurations: [
    {
      id: 2001,
      name: 'Игровой ПК',
      date: '2023-09-10',
      components: [1, 3, 5, 7, 9, 11, 13, 15]
    }
  ]
};

// Пример результата проверки совместимости
export const compatibilityResults = {
  compatible: true,
  issues: []
};

// Пример несовместимой конфигурации
export const incompatibleResults = {
  compatible: false,
  issues: [
    'Процессор Intel Core i7-12700K несовместим с материнской платой Asus ROG Strix B550-F Gaming (сокет не подходит)',
    'Блок питания NZXT C650 может не обеспечить достаточную мощность для конфигурации с RTX 3080'
  ]
}; 