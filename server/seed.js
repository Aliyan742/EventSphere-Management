const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Expo = require('./models/Expo');
const Booth = require('./models/Booth');
const Session = require('./models/Session');
const Message = require('./models/Message');
const Feedback = require('./models/Feedback');

dotenv.config();
connectDB();

const seedDatabase = async () => {
  try {
    await Promise.all([
      User.deleteMany(),
      Expo.deleteMany(),
      Booth.deleteMany(),
      Session.deleteMany(),
      Message.deleteMany(),
      Feedback.deleteMany(),
    ]);

    console.log('Old data cleared...');

    // 1. Users
    const admin = await User.create({
      name: 'Muhammad Aliyan Butt',
      email: 'admin@eventsphere.com',
      password: 'Password123',
      role: 'admin',
      phone: '0300-1112233',
      isVerified: true,
    });

    const exhibitor1 = await User.create({
      name: 'Zainab Tariq',
      email: 'nexatech@eventsphere.com',
      password: 'Password123',
      role: 'exhibitor',
      phone: '0321-4455667',
      isVerified: true,
      exhibitorProfile: {
        companyName: 'NexaTech AI Solutions',
        industryCategory: 'Artificial Intelligence & Robotics',
        description: 'Enterprise AI automation tools and smart vision systems.',
        website: 'https://nexatech.example.com',
        approvalStatus: 'approved',
      },
    });

    const exhibitor2 = await User.create({
      name: 'Bilal Ahmed',
      email: 'cloudwave@eventsphere.com',
      password: 'Password123',
      role: 'exhibitor',
      phone: '0333-7788990',
      isVerified: true,
      exhibitorProfile: {
        companyName: 'CloudWave Security',
        industryCategory: 'Cybersecurity & Cloud',
        description: 'Zero-trust cloud infrastructure and threat intelligence.',
        website: 'https://cloudwave.example.com',
        approvalStatus: 'approved',
      },
    });

    const attendee1 = await User.create({
      name: 'Sara Khan',
      email: 'sara@eventsphere.com',
      password: 'Password123',
      role: 'attendee',
      phone: '0311-9876543',
      attendeeProfile: {
        interests: ['Artificial Intelligence', 'Cybersecurity', 'Full-Stack Web'],
      },
    });

    // 2. Expos
    const expo1 = await Expo.create({
      title: 'Pakistan International Tech & AI Expo 2026',
      description:
        'South Asia’s premier technology showcase bringing together AI innovators, cloud architects, and enterprise startups.',
      theme: 'Artificial Intelligence & Future Tech',
      startDate: new Date('2026-12-10T09:00:00Z'),
      endDate: new Date('2026-12-12T18:00:00Z'),
      location: {
        venueName: 'Karachi Expo Centre - Hall 1 & 2',
        address: 'University Road, Gulshan-e-Iqbal',
        city: 'Karachi',
      },
      floorPlan: { totalBooths: 12, dimensions: { rows: 3, columns: 4 } },
      status: 'upcoming',
      maxAttendees: 1000,
      registeredAttendees: [attendee1._id],
      createdBy: admin._id,
    });

    const expo2 = await Expo.create({
      title: 'FinTech & E-Commerce Innovation Summit',
      description:
        'Exploring digital payments, blockchain banking, and next-gen retail logistics.',
      theme: 'FinTech & Digital Commerce',
      startDate: new Date('2027-01-15T10:00:00Z'),
      endDate: new Date('2027-01-16T17:00:00Z'),
      location: {
        venueName: 'Pearl Continental Grand Ballroom',
        address: 'Club Road, Civil Lines',
        city: 'Karachi',
      },
      floorPlan: { totalBooths: 6, dimensions: { rows: 2, columns: 3 } },
      status: 'upcoming',
      maxAttendees: 500,
      createdBy: admin._id,
    });

    // 3. Floor Plan Booths for Expo 1 (12 Booths)
    const rowLetters = ['A', 'B', 'C'];
    const boothsExpo1 = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const boothNum = `${rowLetters[r]}-0${c + 1}`;
        let status = 'available';
        let exhibitor = null;
        let showcaseDetails = undefined;

        if (boothNum === 'A-01') {
          status = 'booked';
          exhibitor = exhibitor1._id;
          showcaseDetails = {
            productsOrServices: ['Autonomous Vision SDK', 'AI Customer Agent'],
            boothDescription: 'Live hands-on demo of real-time AI agents.',
            staffMembers: [{ name: 'Zainab Tariq', role: 'Lead AI Architect' }],
          };
        } else if (boothNum === 'A-02') {
          status = 'booked';
          exhibitor = exhibitor2._id;
          showcaseDetails = {
            productsOrServices: ['CloudShield WAF', 'Zero-Trust Vault'],
            boothDescription: 'Enterprise cloud security live penetration demos.',
            staffMembers: [{ name: 'Bilal Ahmed', role: 'Security Director' }],
          };
        } else if (boothNum === 'B-01') {
          status = 'pending_approval';
          exhibitor = exhibitor1._id;
        }

        boothsExpo1.push({
          expo: expo1._id,
          boothNumber: boothNum,
          tier: r === 0 ? 'vip' : r === 1 ? 'premium' : 'standard',
          price: r === 0 ? 500 : r === 1 ? 300 : 150,
          coordinates: { row: r + 1, column: c + 1 },
          status,
          exhibitor,
          showcaseDetails,
        });
      }
    }
    await Booth.insertMany(boothsExpo1);

    // Floor Plan Booths for Expo 2 (6 Booths)
    const boothsExpo2 = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        boothsExpo2.push({
          expo: expo2._id,
          boothNumber: `${rowLetters[r]}-0${c + 1}`,
          tier: r === 0 ? 'vip' : 'standard',
          price: r === 0 ? 450 : 200,
          coordinates: { row: r + 1, column: c + 1 },
          status: r === 0 && c === 0 ? 'booked' : 'available',
          exhibitor: r === 0 && c === 0 ? exhibitor2._id : null,
          showcaseDetails:
            r === 0 && c === 0
              ? {
                  productsOrServices: ['PayGuard API', 'Instant KYC'],
                  boothDescription: 'Next-gen FinTech fraud prevention suite.',
                  staffMembers: [{ name: 'Bilal Ahmed', role: 'Solutions Lead' }],
                }
              : undefined,
        });
      }
    }
    await Booth.insertMany(boothsExpo2);

    // 4. Event Sessions
    const session1 = await Session.create({
      expo: expo1._id,
      title: 'Building Scalable Agentic AI Workflows in 2026',
      topic: 'Artificial Intelligence',
      description: 'Deep dive into autonomous agents, tool calling, and production deployment.',
      speaker: { name: 'Dr. Kamran Siddiqui', designation: 'Chief AI Scientist, NexaTech' },
      hallLocation: 'Main Auditorium - Stage A',
      startTime: new Date('2026-12-10T11:00:00Z'),
      endTime: new Date('2026-12-10T12:30:00Z'),
      capacity: 300,
      registeredAttendees: [attendee1._id],
    });

    await Session.create({
      expo: expo1._id,
      title: 'Zero-Trust Security for Modern Full-Stack Apps',
      topic: 'Cybersecurity',
      description: 'Securing APIs, JWT tokens, and cloud databases against modern threats.',
      speaker: { name: 'Bilal Ahmed', designation: 'Director of Security, CloudWave' },
      hallLocation: 'Tech Hall B - Room 2',
      startTime: new Date('2026-12-10T14:00:00Z'),
      endTime: new Date('2026-12-10T15:15:00Z'),
      capacity: 150,
    });

    await Session.create({
      expo: expo2._id,
      title: 'Digital Banking & Open Finance in Pakistan',
      topic: 'FinTech',
      description: 'How Raast and open APIs are reshaping commerce.',
      speaker: { name: 'Ayesha Malik', designation: 'VP Payments' },
      hallLocation: 'Grand Ballroom Stage',
      startTime: new Date('2027-01-15T11:30:00Z'),
      endTime: new Date('2027-01-15T13:00:00Z'),
      capacity: 200,
    });

    // 5. Two-Way Messages & Appointments
    await Message.create([
      {
        expo: expo1._id,
        sender: attendee1._id,
        receiver: exhibitor1._id,
        messageType: 'appointment',
        subject: '1-on-1 Demo Request at Booth A-01',
        content: 'Hi NexaTech! Can we schedule a 15-minute live walkthrough of your Vision SDK?',
        appointmentDetails: {
          requestedDate: new Date('2026-12-10T14:00:00Z'),
          status: 'pending',
        },
        replies: [
          {
            sender: exhibitor1._id,
            content: 'Hello Sara! Yes, 2:00 PM at Booth A-01 works great for our team.',
          },
        ],
      },
      {
        expo: expo1._id,
        sender: exhibitor1._id,
        receiver: admin._id,
        messageType: 'support',
        subject: 'Additional Power Outlet at Booth A-01',
        content: 'Hi Admin, we need an extra 220V dedicated socket for our AI demo server.',
      },
      {
        expo: expo1._id,
        sender: exhibitor1._id,
        receiver: exhibitor2._id,
        messageType: 'collaboration',
        subject: 'Joint AI + Cloud Security Showcase',
        content: 'Hey Bilal, since our booths A-01 and A-02 are adjacent, let’s co-host a live demo!',
      },
    ]);

    // 6. Sample Feedback
    await Feedback.create({
      user: attendee1._id,
      name: 'Sara Khan',
      email: 'sara@eventsphere.com',
      category: 'suggestion',
      rating: 5,
      message: 'Love the interactive floor plan! Please add downloadable PDF passes as well.',
    });

    attendee1.attendeeProfile.registeredExpos.push(expo1._id);
    attendee1.attendeeProfile.bookmarkedSessions.push(session1._id);
    await attendee1.save();

    console.log('Database Seeded Successfully with Full Multi-Role Data!');
    process.exit();
  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();