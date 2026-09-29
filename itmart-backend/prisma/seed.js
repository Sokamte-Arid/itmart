const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const prisma = new PrismaClient();

async function main() {
  // --- Default super admin ---
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@itmart.cm' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@itmart.cm',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✔ Admin ready:', admin.email, '(password: Admin@12345)');

  // --- Category: Laptops, with filterable attributes ---
  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      slug: 'laptops',
      nameEn: 'Laptops',
      nameFr: 'Ordinateurs Portables',
    },
  });

  const ramAttr = await prisma.categoryAttribute.create({
    data: {
      categoryId: laptops.id,
      nameEn: 'RAM',
      nameFr: 'RAM',
      type: 'SELECT',
      unit: 'GB',
      sortOrder: 1,
    },
  });

  const storageAttr = await prisma.categoryAttribute.create({
    data: {
      categoryId: laptops.id,
      nameEn: 'Storage',
      nameFr: 'Stockage',
      type: 'SELECT',
      unit: 'GB',
      sortOrder: 2,
    },
  });

  // --- Brand: HP ---
  const hp = await prisma.brand.upsert({
    where: { slug: 'hp' },
    update: {},
    create: { slug: 'hp', name: 'HP' },
  });

  // --- Product group: HP EliteBook 840, with two variant "products" ---
  const group = await prisma.productGroup.create({
    data: { nameEn: 'HP EliteBook 840', nameFr: 'HP EliteBook 840' },
  });

  const variant8gb = await prisma.product.create({
    data: {
      sku: 'HP-EB840-8-256',
      slug: slugify('HP EliteBook 840 8GB 256GB', { lower: true, strict: true }),
      categoryId: laptops.id,
      brandId: hp.id,
      groupId: group.id,
      nameEn: 'HP EliteBook 840 - 8GB / 256GB SSD',
      nameFr: 'HP EliteBook 840 - 8Go / 256Go SSD',
      descriptionEn: 'Reliable business laptop, Intel Core i5, ideal for office work.',
      descriptionFr: 'Ordinateur portable professionnel fiable, Intel Core i5, idéal pour le bureau.',
      price: 350000,
      stock: 5,
      isBestSeller: true,
      attributeValues: {
        create: [
          { attributeId: ramAttr.id, value: '8' },
          { attributeId: storageAttr.id, value: '256' },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      sku: 'HP-EB840-16-512',
      slug: slugify('HP EliteBook 840 16GB 512GB', { lower: true, strict: true }),
      categoryId: laptops.id,
      brandId: hp.id,
      groupId: group.id,
      nameEn: 'HP EliteBook 840 - 16GB / 512GB SSD',
      nameFr: 'HP EliteBook 840 - 16Go / 512Go SSD',
      descriptionEn: 'Reliable business laptop, Intel Core i5, more power and storage.',
      descriptionFr: 'Ordinateur portable professionnel fiable, Intel Core i5, plus de puissance et de stockage.',
      price: 420000,
      discountPrice: 399000,
      stock: 3,
      attributeValues: {
        create: [
          { attributeId: ramAttr.id, value: '16' },
          { attributeId: storageAttr.id, value: '512' },
        ],
      },
    },
  });

  console.log('✔ Sample catalog data created (category, brand, product group, 2 variants).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
