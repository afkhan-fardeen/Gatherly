import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "password123";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@gatherly.com" },
    update: {},
    create: {
      email: "admin@gatherly.com",
      passwordHash,
      name: "Admin User",
      role: "admin",
      emailVerified: true,
    },
  });

  // 1 Consumer
  const consumer = await prisma.user.upsert({
    where: { email: "consumer@gatherly.com" },
    update: {},
    create: {
      email: "consumer@gatherly.com",
      passwordHash,
      name: "Fatima Al-Khalifa",
      role: "consumer",
      emailVerified: true,
      defaultLocation: "Manama, Bahrain",
    },
  });

  // Consumer event for potential bookings
  let consumerEvent = await prisma.event.findFirst({ where: { userId: consumer.id } });
  if (!consumerEvent) {
    consumerEvent = await prisma.event.create({
      data: {
        userId: consumer.id,
        name: "Wedding Reception",
        eventType: "wedding",
        date: new Date("2025-04-15"),
        timeStart: new Date("1970-01-01T18:00:00"),
        timeEnd: new Date("1970-01-01T23:00:00"),
        guestCount: 80,
        location: "Gulf Hotel, Manama",
        venueType: "hotel",
        venueName: "Gulf Hotel Ballroom",
        status: "in_progress",
      },
    });
  }

  // Additional consumers with events
  const consumer2 = await prisma.user.upsert({
    where: { email: "sarah@gatherly.com" },
    update: {},
    create: {
      email: "sarah@gatherly.com",
      passwordHash,
      name: "Sarah Ahmed",
      role: "consumer",
      emailVerified: true,
      defaultLocation: "Manama, Bahrain",
    },
  });

  let consumer2Event = await prisma.event.findFirst({ where: { userId: consumer2.id, name: "Corporate Gala Dinner" } });
  if (!consumer2Event) {
    await prisma.event.create({
      data: {
        userId: consumer2.id,
        name: "Corporate Gala Dinner",
        eventType: "corporate",
        date: new Date("2025-04-20"),
        timeStart: new Date("1970-01-01T19:00:00"),
        timeEnd: new Date("1970-01-01T22:00:00"),
        guestCount: 120,
        location: "Four Seasons Hotel Bahrain Bay",
        venueType: "hotel",
        venueName: "Grand Ballroom",
        status: "draft",
      },
    });
  }

  const consumer3 = await prisma.user.upsert({
    where: { email: "ahmed@gatherly.com" },
    update: {},
    create: {
      email: "ahmed@gatherly.com",
      passwordHash,
      name: "Ahmed Hassan",
      role: "consumer",
      emailVerified: true,
      defaultLocation: "Riffa, Bahrain",
    },
  });

  let consumer3Event = await prisma.event.findFirst({ where: { userId: consumer3.id, name: "Birthday Celebration" } });
  if (!consumer3Event) {
    await prisma.event.create({
      data: {
        userId: consumer3.id,
        name: "Birthday Celebration",
        eventType: "wedding",
        date: new Date("2025-02-01"),
        timeStart: new Date("1970-01-01T14:00:00"),
        timeEnd: new Date("1970-01-01T18:00:00"),
        guestCount: 35,
        location: "Home, Riffa",
        venueType: "home",
        venueName: null,
        status: "completed",
      },
    });
  }

  // Guests for main consumer event
  const existingGuests = await prisma.guest.count({ where: { eventId: consumerEvent.id } });
  if (existingGuests === 0) {
    await prisma.guest.createMany({
      data: [
        { eventId: consumerEvent.id, name: "Mariam Al-Khalifa", email: "mariam@example.com", rsvpStatus: "confirmed" },
        { eventId: consumerEvent.id, name: "Omar Al-Rashid", email: "omar@example.com", rsvpStatus: "confirmed" },
        { eventId: consumerEvent.id, name: "Layla Hassan", email: "layla@example.com", rsvpStatus: "pending" },
        { eventId: consumerEvent.id, name: "Yusuf Ibrahim", phone: "+973 1234 5678", rsvpStatus: "confirmed" },
        { eventId: consumerEvent.id, name: "Noor Al-Mahmood", email: "noor@example.com", rsvpStatus: "declined" },
      ],
    });
  }

  // Sample booking: consumer's wedding with Bahraini Delights
  const bahrainiVendor = await prisma.vendor.findFirst({
    where: { businessName: "Bahraini Delights Catering" },
    include: { packages: { where: { name: "Traditional Bahraini Feast" }, take: 1 } },
  });
  if (bahrainiVendor?.packages[0]) {
    const existingBooking = await prisma.booking.findFirst({
      where: { eventId: consumerEvent.id, vendorId: bahrainiVendor.id },
    });
    if (!existingBooking) {
      const pkg = bahrainiVendor.packages[0];
      const subtotal = Number(pkg.basePrice) * consumerEvent.guestCount;
      const setupFee = Number(pkg.setupFee ?? 0);
      await prisma.booking.create({
        data: {
          bookingReference: "BKG-SEED01",
          userId: consumer.id,
          vendorId: bahrainiVendor.id,
          eventId: consumerEvent.id,
          packageId: pkg.id,
          guestCount: consumerEvent.guestCount,
          subtotal,
          serviceCharges: 0,
          totalAmount: subtotal + setupFee,
          status: "confirmed",
          paymentStatus: "paid",
        },
      });
    }
  }

  const vendorsData = [
    {
      email: "vendor1@gatherly.com",
      name: "Khalid Al-Mahmood",
      businessName: "Bahraini Delights Catering",
      ownerName: "Khalid Al-Mahmood",
      description:
        "Authentic Bahraini and Gulf cuisine. We specialize in machboos, harees, and traditional mezze. Perfect for weddings, corporate events, and family gatherings. Halal certified.",
      cuisineTypes: ["Bahraini", "Arabic", "Middle Eastern", "Gulf"],
      serviceAreas: ["Manama", "Muharraq", "Riffa", "Isa Town", "Sitra"],
      physicalAddress: "Building 45, Road 1702, Block 317, Manama, Bahrain",
      operatingHours: {
        sunday: { open: "08:00", close: "22:00" },
        monday: { open: "08:00", close: "22:00" },
        tuesday: { open: "08:00", close: "22:00" },
        wednesday: { open: "08:00", close: "22:00" },
        thursday: { open: "08:00", close: "22:00" },
        friday: { open: "14:00", close: "22:00" },
        saturday: { open: "08:00", close: "22:00" },
      },
      yearsInBusiness: 12,
      ratingAvg: 4.7,
      ratingCount: 89,
      packages: [
        {
          name: "Traditional Bahraini Feast",
          description: "Full Bahraini spread with machboos, harees, grilled meats, and mezze.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 12.5,
          minGuests: 30,
          maxGuests: 300,
          setupFee: 50,
          dietaryTags: ["halal"],
          displayOrder: 0,
          items: [
            { name: "Machboos (Chicken & Rice)", category: "Main", displayOrder: 0 },
            { name: "Harees", category: "Main", displayOrder: 1 },
            { name: "Mixed Grill (Lamb & Chicken)", category: "Main", displayOrder: 2 },
            { name: "Hummus, Mutabbal, Tabbouleh", category: "Appetizer", displayOrder: 3 },
            { name: "Umm Ali", category: "Dessert", displayOrder: 4 },
            { name: "Arabic Coffee & Dates", category: "Beverage", displayOrder: 5 },
          ],
        },
        {
          name: "Premium Gulf Package",
          description: "Luxury Gulf cuisine with lamb ouzi, seafood, and premium desserts.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 22,
          minGuests: 50,
          maxGuests: 200,
          setupFee: 100,
          dietaryTags: ["halal", "seafood_options"],
          displayOrder: 1,
          isSpotlight: true,
          spotlightOrder: 1,
          items: [
            { name: "Lamb Ouzi", category: "Main", displayOrder: 0 },
            { name: "Grilled Hammour", category: "Main", displayOrder: 1 },
            { name: "Shrimp Machboos", category: "Main", displayOrder: 2 },
            { name: "Kunafa", category: "Dessert", displayOrder: 3 },
            { name: "Fresh Fruit & Dates", category: "Dessert", displayOrder: 4 },
          ],
        },
      ],
    },
    {
      email: "vendor2@gatherly.com",
      name: "Rajesh Kumar",
      businessName: "Spice Route Indian Catering",
      ownerName: "Rajesh Kumar",
      description:
        "Authentic Indian cuisine from North and South India. Biryanis, curries, tandoori, and vegetarian specialties. Serving Bahrain since 2010.",
      cuisineTypes: ["Indian", "North Indian", "South Indian", "Vegetarian"],
      serviceAreas: ["Manama", "Juffair", "Saar", "Amwaj", "Muharraq"],
      physicalAddress: "Block 338, Road 4610, Juffair, Manama, Bahrain",
      operatingHours: {
        sunday: { open: "10:00", close: "23:00" },
        monday: { open: "10:00", close: "23:00" },
        tuesday: { open: "10:00", close: "23:00" },
        wednesday: { open: "10:00", close: "23:00" },
        thursday: { open: "10:00", close: "23:00" },
        friday: { open: "12:00", close: "23:00" },
        saturday: { open: "10:00", close: "23:00" },
      },
      yearsInBusiness: 14,
      ratingAvg: 4.6,
      ratingCount: 124,
      packages: [
        {
          name: "Classic Indian Buffet",
          description: "Biryani, butter chicken, dal, naan, and classic curries.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 9.5,
          minGuests: 20,
          maxGuests: 250,
          setupFee: 35,
          dietaryTags: ["halal", "vegetarian_options"],
          displayOrder: 0,
          items: [
            { name: "Chicken Biryani", category: "Main", displayOrder: 0 },
            { name: "Butter Chicken", category: "Main", displayOrder: 1 },
            { name: "Dal Makhani", category: "Main", displayOrder: 2 },
            { name: "Tandoori Chicken", category: "Main", displayOrder: 3 },
            { name: "Garlic Naan", category: "Side", displayOrder: 4 },
            { name: "Gulab Jamun", category: "Dessert", displayOrder: 5 },
          ],
        },
        {
          name: "Royal Indian Feast",
          description: "Premium selection with lamb rogan josh, seafood curry, and live stations.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 18,
          minGuests: 40,
          maxGuests: 150,
          setupFee: 75,
          dietaryTags: ["halal", "vegetarian_options", "seafood_options"],
          displayOrder: 1,
          items: [
            { name: "Lamb Rogan Josh", category: "Main", displayOrder: 0 },
            { name: "Prawn Curry", category: "Main", displayOrder: 1 },
            { name: "Hyderabadi Biryani", category: "Main", displayOrder: 2 },
            { name: "Paneer Tikka", category: "Appetizer", displayOrder: 3 },
            { name: "Rasmalai", category: "Dessert", displayOrder: 4 },
            { name: "Mango Lassi", category: "Beverage", displayOrder: 5 },
          ],
        },
      ],
    },
    {
      email: "vendor3@gatherly.com",
      name: "Marco Rossi",
      businessName: "Mediterranean Breeze Catering",
      ownerName: "Marco Rossi",
      description:
        "Italian and Mediterranean cuisine. Fresh pasta, wood-fired pizzas, antipasti, and European desserts. Ideal for corporate events and private parties.",
      cuisineTypes: ["Italian", "Mediterranean", "European"],
      serviceAreas: ["Manama", "Seef", "Adliya", "Juffair", "Amwaj"],
      physicalAddress: "Seef District, Building 123, Manama, Bahrain",
      operatingHours: {
        sunday: { open: "11:00", close: "22:00" },
        monday: { open: "11:00", close: "22:00" },
        tuesday: { open: "11:00", close: "22:00" },
        wednesday: { open: "11:00", close: "22:00" },
        thursday: { open: "11:00", close: "22:00" },
        friday: { open: "13:00", close: "22:00" },
        saturday: { open: "11:00", close: "22:00" },
      },
      yearsInBusiness: 8,
      ratingAvg: 4.8,
      ratingCount: 67,
      packages: [
        {
          name: "Italian Classics",
          description: "Pasta bar, pizza station, antipasti, and tiramisu.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 15,
          minGuests: 25,
          maxGuests: 120,
          setupFee: 60,
          dietaryTags: ["vegetarian_options"],
          displayOrder: 0,
          items: [
            { name: "Spaghetti Carbonara", category: "Main", displayOrder: 0 },
            { name: "Margherita Pizza", category: "Main", displayOrder: 1 },
            { name: "Bruschetta & Caprese", category: "Appetizer", displayOrder: 2 },
            { name: "Caesar Salad", category: "Side", displayOrder: 3 },
            { name: "Tiramisu", category: "Dessert", displayOrder: 4 },
            { name: "Espresso", category: "Beverage", displayOrder: 5 },
          ],
        },
        {
          name: "Mediterranean Premium",
          description: "Grilled seafood, lamb, mezze, and premium desserts.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 24,
          minGuests: 30,
          maxGuests: 100,
          setupFee: 90,
          dietaryTags: ["halal", "seafood_options", "vegetarian_options"],
          displayOrder: 1,
          isSpotlight: true,
          spotlightOrder: 2,
          items: [
            { name: "Grilled Sea Bass", category: "Main", displayOrder: 0 },
            { name: "Lamb Chops", category: "Main", displayOrder: 1 },
            { name: "Stuffed Vine Leaves", category: "Appetizer", displayOrder: 2 },
            { name: "Greek Salad", category: "Side", displayOrder: 3 },
            { name: "Baklava", category: "Dessert", displayOrder: 4 },
            { name: "Lemonade", category: "Beverage", displayOrder: 5 },
          ],
        },
      ],
    },
    {
      email: "vendor4@gatherly.com",
      name: "Hassan Al-Rashid",
      businessName: "Flame & Grill BBQ Co.",
      ownerName: "Hassan Al-Rashid",
      description:
        "Premium BBQ and grilled meats. American-style ribs, brisket, burgers, and grilled chicken. Perfect for outdoor events and casual gatherings.",
      cuisineTypes: ["BBQ", "American", "Grilled", "International"],
      serviceAreas: ["Riffa", "Hamad Town", "Isa Town", "Manama", "Sitra"],
      physicalAddress: "Hamad Town, Block 704, Road 3709, Bahrain",
      operatingHours: {
        sunday: { open: "09:00", close: "21:00" },
        monday: { open: "09:00", close: "21:00" },
        tuesday: { open: "09:00", close: "21:00" },
        wednesday: { open: "09:00", close: "21:00" },
        thursday: { open: "09:00", close: "21:00" },
        friday: { open: "14:00", close: "21:00" },
        saturday: { open: "09:00", close: "21:00" },
      },
      yearsInBusiness: 6,
      ratingAvg: 4.5,
      ratingCount: 52,
      packages: [
        {
          name: "BBQ Essentials",
          description: "Grilled chicken, beef burgers, coleslaw, and corn on the cob.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 8.5,
          minGuests: 30,
          maxGuests: 200,
          setupFee: 40,
          dietaryTags: ["halal"],
          displayOrder: 0,
          items: [
            { name: "Grilled Chicken Thighs", category: "Main", displayOrder: 0 },
            { name: "Beef Burgers", category: "Main", displayOrder: 1 },
            { name: "Coleslaw", category: "Side", displayOrder: 2 },
            { name: "Corn on the Cob", category: "Side", displayOrder: 3 },
            { name: "Garlic Bread", category: "Side", displayOrder: 4 },
            { name: "Brownies", category: "Dessert", displayOrder: 5 },
          ],
        },
        {
          name: "Premium BBQ Feast",
          description: "Smoked brisket, ribs, pulled chicken, and full sides.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 16,
          minGuests: 40,
          maxGuests: 150,
          setupFee: 80,
          dietaryTags: ["halal"],
          displayOrder: 1,
          items: [
            { name: "Smoked Beef Brisket", category: "Main", displayOrder: 0 },
            { name: "BBQ Ribs", category: "Main", displayOrder: 1 },
            { name: "Pulled Chicken", category: "Main", displayOrder: 2 },
            { name: "Mac & Cheese", category: "Side", displayOrder: 3 },
            { name: "Baked Beans", category: "Side", displayOrder: 4 },
            { name: "Apple Pie", category: "Dessert", displayOrder: 5 },
          ],
        },
      ],
    },
    {
      email: "vendor5@gatherly.com",
      name: "Wei Chen",
      businessName: "Dragon Wok Asian Catering",
      ownerName: "Wei Chen",
      description:
        "Pan-Asian cuisine: Chinese, Thai, and Japanese. Wok-fried dishes, sushi, dim sum, and stir-fries. Great for corporate lunches and celebrations.",
      cuisineTypes: ["Chinese", "Thai", "Japanese", "Asian", "Pan-Asian"],
      serviceAreas: ["Manama", "Seef", "Juffair", "Muharraq", "Amwaj"],
      physicalAddress: "Block 428, Road 2810, Manama, Bahrain",
      operatingHours: {
        sunday: { open: "10:00", close: "22:00" },
        monday: { open: "10:00", close: "22:00" },
        tuesday: { open: "10:00", close: "22:00" },
        wednesday: { open: "10:00", close: "22:00" },
        thursday: { open: "10:00", close: "22:00" },
        friday: { open: "12:00", close: "22:00" },
        saturday: { open: "10:00", close: "22:00" },
      },
      yearsInBusiness: 10,
      ratingAvg: 4.4,
      ratingCount: 98,
      packages: [
        {
          name: "Asian Fusion Buffet",
          description: "Fried rice, noodles, sweet & sour, spring rolls, and more.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 10,
          minGuests: 25,
          maxGuests: 180,
          setupFee: 45,
          dietaryTags: ["halal", "vegetarian_options"],
          displayOrder: 0,
          items: [
            { name: "Chicken Fried Rice", category: "Main", displayOrder: 0 },
            { name: "Sweet & Sour Chicken", category: "Main", displayOrder: 1 },
            { name: "Vegetable Chow Mein", category: "Main", displayOrder: 2 },
            { name: "Spring Rolls", category: "Appetizer", displayOrder: 3 },
            { name: "Wonton Soup", category: "Appetizer", displayOrder: 4 },
            { name: "Mango Sticky Rice", category: "Dessert", displayOrder: 5 },
          ],
        },
        {
          name: "Sushi & Dim Sum Deluxe",
          description: "Fresh sushi, dim sum, tempura, and premium Asian dishes.",
          packageType: "buffet",
          priceType: "per_person",
          basePrice: 20,
          minGuests: 20,
          maxGuests: 80,
          setupFee: 70,
          dietaryTags: ["halal", "seafood_options", "vegetarian_options"],
          displayOrder: 1,
          isSpotlight: true,
          spotlightOrder: 3,
          items: [
            { name: "Assorted Sushi Platter", category: "Main", displayOrder: 0 },
            { name: "Dim Sum (Har Gow, Siu Mai)", category: "Appetizer", displayOrder: 1 },
            { name: "Tempura Prawns", category: "Main", displayOrder: 2 },
            { name: "Thai Green Curry", category: "Main", displayOrder: 3 },
            { name: "Miso Soup", category: "Appetizer", displayOrder: 4 },
            { name: "Mochi Ice Cream", category: "Dessert", displayOrder: 5 },
          ],
        },
      ],
    },
  ];

  for (const v of vendorsData) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: {},
      create: {
        email: v.email,
        passwordHash,
        name: v.name,
        role: "vendor",
        emailVerified: true,
      },
    });

    const vendor = await prisma.vendor.upsert({
      where: { userId: user.id },
      update: {
        businessType: "catering",
        description: v.description,
        cuisineTypes: v.cuisineTypes,
        serviceAreas: v.serviceAreas,
        physicalAddress: v.physicalAddress,
        operatingHours: v.operatingHours as object,
        yearsInBusiness: v.yearsInBusiness,
        ratingAvg: v.ratingAvg,
        ratingCount: v.ratingCount,
      },
      create: {
        userId: user.id,
        businessName: v.businessName,
        businessType: "catering",
        ownerName: v.ownerName,
        description: v.description,
        cuisineTypes: v.cuisineTypes,
        serviceAreas: v.serviceAreas,
        physicalAddress: v.physicalAddress,
        operatingHours: v.operatingHours as object,
        yearsInBusiness: v.yearsInBusiness,
        status: "approved",
        ratingAvg: v.ratingAvg,
        ratingCount: v.ratingCount,
      },
    });

    for (const pkg of v.packages) {
      const existing = await prisma.package.findFirst({
        where: { vendorId: vendor.id, name: pkg.name },
      });
      if (!existing) {
        const created = await prisma.package.create({
          data: {
            vendorId: vendor.id,
            name: pkg.name,
            description: pkg.description,
            packageType: pkg.packageType,
            priceType: pkg.priceType,
            basePrice: pkg.basePrice,
            minGuests: pkg.minGuests,
            maxGuests: pkg.maxGuests,
            setupFee: pkg.setupFee,
            dietaryTags: pkg.dietaryTags,
            displayOrder: pkg.displayOrder,
            isActive: true,
            isSpotlight: (pkg as { isSpotlight?: boolean }).isSpotlight ?? false,
            spotlightOrder: (pkg as { spotlightOrder?: number }).spotlightOrder ?? null,
          },
        });
        await prisma.packageItem.createMany({
          data: pkg.items.map((item) => ({
            packageId: created.id,
            name: item.name,
            category: item.category,
            displayOrder: item.displayOrder,
            dietaryTags: [],
            allergenWarnings: [],
          })),
        });
      }
    }
  }

  // Ensure spotlight packages are marked (for existing DBs)
  await prisma.package.updateMany({
    where: { name: "Premium Gulf Package" },
    data: { isSpotlight: true, spotlightOrder: 1 },
  });
  await prisma.package.updateMany({
    where: { name: "Mediterranean Premium" },
    data: { isSpotlight: true, spotlightOrder: 2 },
  });
  await prisma.package.updateMany({
    where: { name: "Sushi & Dim Sum Deluxe" },
    data: { isSpotlight: true, spotlightOrder: 3 },
  });

  console.log("Seed complete. Test accounts (password: " + PASSWORD + "):");
  console.log("- admin@gatherly.com");
  console.log("- consumer@gatherly.com (Fatima – Wedding, guests)");
  console.log("- sarah@gatherly.com (Corporate Gala)");
  console.log("- ahmed@gatherly.com (Birthday – completed)");
  console.log("- vendor1@gatherly.com (Bahraini Delights)");
  console.log("- vendor2@gatherly.com (Spice Route Indian)");
  console.log("- vendor3@gatherly.com (Mediterranean Breeze)");
  console.log("- vendor4@gatherly.com (Flame & Grill BBQ)");
  console.log("- vendor5@gatherly.com (Dragon Wok Asian)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
