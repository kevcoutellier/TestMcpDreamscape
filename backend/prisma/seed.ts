// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding database...');
    
    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const user1 = await prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        preferences: {
          travelTypes: ['ADVENTURE', 'CULTURAL'],
          budgetRange: {
            min: 500,
            max: 3000,
            currency: 'EUR'
          },
          preferredAccommodations: ['HOTEL', 'BOUTIQUE']
        }
      }
    });
    
    console.log(`Created user: ${user1.email}`);
    
    const user2 = await prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        passwordHash,
        firstName: 'Jane',
        lastName: 'Smith',
        preferences: {
          travelTypes: ['LUXURY', 'RELAX'],
          budgetRange: {
            min: 1000,
            max: 5000,
            currency: 'EUR'
          },
          preferredAccommodations: ['RESORT', 'SPA']
        }
      }
    });
    
    console.log(`Created user: ${user2.email}`);
    
    // Create sample destinations
    const paris = await prisma.destination.upsert({
      where: { id: 'dest-paris' },
      update: {},
      create: {
        id: 'dest-paris',
        name: 'Paris',
        country: 'France',
        description: 'The City of Light, known for its stunning architecture, art museums, historical monuments, and cuisine.',
        coordinates: {
          latitude: 48.8566,
          longitude: 2.3522
        },
        images: [
          {
            url: 'https://example.com/paris1.jpg',
            type: 'PRIMARY'
          },
          {
            url: 'https://example.com/paris2.jpg',
            type: 'SECONDARY'
          }
        ],
        rating: 4.8,
        tags: ['romantic', 'cultural', 'historic'],
        vrAvailable: true,
        vrPreviewUrl: 'https://example.com/vr/paris'
      }
    });
    
    console.log(`Created destination: ${paris.name}`);
    
    const barcelona = await prisma.destination.upsert({
      where: { id: 'dest-barcelona' },
      update: {},
      create: {
        id: 'dest-barcelona',
        name: 'Barcelona',
        country: 'Spain',
        description: 'A vibrant city known for its distinctive architecture, art, and Mediterranean beaches.',
        coordinates: {
          latitude: 41.3851,
          longitude: 2.1734
        },
        images: [
          {
            url: 'https://example.com/barcelona1.jpg',
            type: 'PRIMARY'
          },
          {
            url: 'https://example.com/barcelona2.jpg',
            type: 'SECONDARY'
          }
        ],
        rating: 4.7,
        tags: ['beach', 'architecture', 'food'],
        vrAvailable: true,
        vrPreviewUrl: 'https://example.com/vr/barcelona'
      }
    });
    
    console.log(`Created destination: ${barcelona.name}`);
    
    // Create sample activities
    const activity1 = await prisma.activity.upsert({
      where: { id: 'act-paris-tour' },
      update: {},
      create: {
        id: 'act-paris-tour',
        title: 'Paris City Tour',
        description: 'Explore the iconic landmarks of Paris including the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral.',
        destinationId: 'dest-paris',
        location: {
          address: 'Eiffel Tower, Champ de Mars, Paris, France',
          coordinates: {
            latitude: 48.8584,
            longitude: 2.2945
          }
        },
        duration: 180, // 3 hours in minutes
        price: {
          amount: 45.0,
          currency: 'EUR'
        },
        tags: ['tour', 'sightseeing', 'culture'],
        vrAvailable: true,
        vrPreviewUrl: 'https://example.com/vr/paris-tour'
      }
    });
    
    console.log(`Created activity: ${activity1.title}`);
    
    const activity2 = await prisma.activity.upsert({
      where: { id: 'act-barcelona-sagrada' },
      update: {},
      create: {
        id: 'act-barcelona-sagrada',
        title: 'Sagrada Familia Guided Tour',
        description: 'Visit Antoni Gaudí\'s unfinished masterpiece with a knowledgeable guide.',
        destinationId: 'dest-barcelona',
        location: {
          address: 'Carrer de Mallorca, 401, Barcelona, Spain',
          coordinates: {
            latitude: 41.4036,
            longitude: 2.1744
          }
        },
        duration: 120, // 2 hours in minutes
        price: {
          amount: 35.0,
          currency: 'EUR'
        },
        tags: ['architecture', 'guided-tour', 'culture'],
        vrAvailable: true,
        vrPreviewUrl: 'https://example.com/vr/sagrada-familia'
      }
    });
    
    console.log(`Created activity: ${activity2.title}`);
    
    // Create sample bookings
    const booking1 = await prisma.booking.create({
    data: {
      userId: user1.id,
      type: 'ACTIVITY',
      status: 'CONFIRMED',
      details: {
        activityId: activity1.id,
        date: '2025-07-15T10:00:00Z',
        quantity: 2,
        totalPrice: {
          amount: 90.0,
          currency: 'EUR'
        }
      }
    }
  });
  
  console.log(`Created booking ID: ${booking1.id}`);
  
  const booking2 = await prisma.booking.create({
    data: {
      userId: user2.id,
      type: 'ACTIVITY',
      status: 'CONFIRMED',
      details: {
        activityId: activity2.id,
        date: '2025-08-10T14:00:00Z',
        quantity: 1,
        totalPrice: {
          amount: 35.0,
          currency: 'EUR'
        }
      }
    }
  });
  
  console.log(`Created booking ID: ${booking2.id}`);
  
  console.log('✅ Seeding complete!');
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
}

seed();