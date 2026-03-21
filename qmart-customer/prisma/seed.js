const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');
  const pw = await bcrypt.hash('qmart123', 12);

  await prisma.user.upsert({ where: { email: 'customer@qmart.in' }, update: {}, create: { name: 'Priya Sharma', email: 'customer@qmart.in', password: pw, role: 'CUSTOMER', phone: '9876543210' } });
  await prisma.user.upsert({ where: { email: 'store@qmart.in'    }, update: {}, create: { name: 'Arun Kumar',   email: 'store@qmart.in',    password: pw, role: 'DARKSTORE', store: 'Indiranagar Dark Store' } });
  await prisma.user.upsert({ where: { email: 'admin@qmart.in'    }, update: {}, create: { name: 'Meera Nair',   email: 'admin@qmart.in',    password: pw, role: 'ADMIN' } });

  const cats = ['Fruits', 'Vegetables', 'Dairy', 'FMCG', 'Grains', 'Snacks'];
  const catMap = {};
  for (const name of cats) {
    const c = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    catMap[name] = c.id;
  }

  const products = [
    { id: 'alphonso-mangoes',  name: 'Alphonso Mangoes',  price: 249, unit: '1 kg',  emoji: '🥭', fpo: 'Ratnagiri FPO',  qty: 24, threshold: 10, enabled: true,  organic: true,  cat: 'Fruits'      },
    { id: 'baby-spinach',      name: 'Baby Spinach',      price:  49, unit: '250g',  emoji: '🥬', fpo: 'GreenRoots FPO', qty: 38, threshold: 15, enabled: true,  organic: true,  cat: 'Vegetables'  },
    { id: 'full-cream-milk',   name: 'Full Cream Milk',   price:  68, unit: '1L',    emoji: '🥛', fpo: 'Nandini Dairy',  qty: 20, threshold: 10, enabled: true,  organic: false, cat: 'Dairy'       },
    { id: 'tomatoes',          name: 'Tomatoes',          price:  39, unit: '1 kg',  emoji: '🍅', fpo: 'Kolar FPO',      qty:  0, threshold: 20, enabled: true,  organic: false, cat: 'Vegetables'  },
    { id: 'brown-rice',        name: 'Brown Rice',        price: 120, unit: '1 kg',  emoji: '🌾', fpo: 'Cauvery Agri',   qty: 85, threshold: 30, enabled: true,  organic: true,  cat: 'Grains'      },
    { id: 'greek-yogurt',      name: 'Greek Yogurt',      price:  89, unit: '400g',  emoji: '🍶', fpo: 'Amul',           qty: 12, threshold:  8, enabled: false, organic: false, cat: 'Dairy'       },
    { id: 'green-capsicum',    name: 'Green Capsicum',    price:  55, unit: '500g',  emoji: '🫑', fpo: 'Ooty FPO',       qty: 16, threshold: 10, enabled: true,  organic: true,  cat: 'Vegetables'  },
    { id: 'basmati-rice',      name: 'Basmati Rice',      price: 180, unit: '1 kg',  emoji: '🍚', fpo: 'Punjab Agri',    qty: 60, threshold: 20, enabled: true,  organic: false, cat: 'Grains'      },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, name: p.name, price: p.price, unit: p.unit, emoji: p.emoji, fpo: p.fpo, qty: p.qty, threshold: p.threshold, enabled: p.enabled, organic: p.organic, categoryId: catMap[p.cat] },
    });
  }

  console.log('✓ Seed complete. Password for all accounts: qmart123');
  console.log('  customer@qmart.in → localhost:3000');
  console.log('  store@qmart.in    → localhost:3001');
  console.log('  admin@qmart.in    → localhost:3002');
}

main().catch(console.error).finally(() => prisma.$disconnect());
