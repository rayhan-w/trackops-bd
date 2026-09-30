const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Link = require('../models/Link');
const LinkVisit = require('../models/LinkVisit');
const ConsentRecord = require('../models/ConsentRecord');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const TelecomIntegration = require('../models/TelecomIntegration');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trackops_bd';
    console.log(`[Seeder] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seeder] Clearing old records...');
    await User.deleteMany({});
    await Link.deleteMany({});
    await LinkVisit.deleteMany({});
    await ConsentRecord.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await TelecomIntegration.deleteMany({});

    console.log('[Seeder] Creating Demo Accounts...');

    const salt = await bcrypt.genSalt(10);
    const superAdminHash = await bcrypt.hash('DemoSuperAdmin@2026', salt);
    const adminHash = await bcrypt.hash('DemoAdmin@2026', salt);
    const officerHash = await bcrypt.hash('DemoOfficer@2026', salt);
    const pendingHash = await bcrypt.hash('DemoPending@2026', salt);
    const suspendedHash = await bcrypt.hash('DemoSuspended@2026', salt);

    // 1. Super Admin
    const superAdmin = await User.create({
      name: 'Super Administrator (CID Chief)',
      email: 'superadmin@trackops.local',
      phone: '+8801700000001',
      passwordHash: superAdminHash,
      role: 'SUPER_ADMIN',
      status: 'APPROVED',
      approvedAt: new Date(),
    });

    // 2. Admin
    const admin = await User.create({
      name: 'Inspector Admin Rahman',
      email: 'admin@trackops.local',
      phone: '+8801700000002',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'APPROVED',
      approvedBy: superAdmin._id,
      approvedAt: new Date(),
    });

    // 3. Approved User / Officer
    const officer = await User.create({
      name: 'Sub-Inspector Tanvir Ahmed',
      email: 'officer@trackops.local',
      phone: '+8801819000003',
      passwordHash: officerHash,
      role: 'USER',
      status: 'APPROVED',
      approvedBy: admin._id,
      approvedAt: new Date(),
    });

    // 4. Pending Applicant (for approval test)
    const pendingUser = await User.create({
      name: 'Officer Farhana Islam (Cyber Unit)',
      email: 'farhana.applicant@trackops.local',
      phone: '+8801912000004',
      passwordHash: pendingHash,
      role: 'USER',
      status: 'PENDING',
    });

    // 5. Suspended User (for testing suspended state)
    const suspendedUser = await User.create({
      name: 'Ex-Officer K. M. Hossain',
      email: 'hossain.suspended@trackops.local',
      phone: '+8801611000005',
      passwordHash: suspendedHash,
      role: 'USER',
      status: 'SUSPENDED',
      suspensionReason: 'Pending internal disciplinary security inquiry.',
    });

    console.log('[Seeder] Creating Sample Investigation Links for Officer...');

    // Link 1: Cyber Fraud Inquiry
    const link1 = await Link.create({
      ownerId: officer._id,
      destinationUrl: 'https://bangladesh.gov.bd',
      shortCode: 'bd-case-941',
      domain: 'trackops.link',
      title: 'E-Commerce Fraud Investigation Portal',
      description: 'Official verification portal sent to subject regarding contested financial transaction.',
      caseReference: 'CID-DHAKA-2026-0941',
      status: 'ACTIVE',
      clicks: 14,
      uniqueVisits: 8,
    });

    // Link 2: Vehicle Recovery Inquiry
    const link2 = await Link.create({
      ownerId: officer._id,
      destinationUrl: 'https://police.gov.bd',
      shortCode: 'dmp-vr-32',
      domain: 'trackops.link',
      title: 'Stolen Vehicle Inquiry Form',
      description: 'Notice of claim settlement verification link.',
      caseReference: 'DMP-GULSHAN-2026-0032',
      status: 'ACTIVE',
      clicks: 9,
      uniqueVisits: 5,
    });

    // Link 3: Inactive archive link
    const link3 = await Link.create({
      ownerId: officer._id,
      destinationUrl: 'https://dmp.gov.bd',
      shortCode: 'archive-dhaka',
      domain: 'trackops.link',
      title: 'Dhanmondi Burglary Notice (Closed)',
      description: 'Resolved inquiry archive.',
      caseReference: 'DMP-DHAN-2025-1102',
      status: 'INACTIVE',
      clicks: 3,
      uniqueVisits: 2,
    });

    console.log('[Seeder] Creating Sample Consent and Visit Records (with voluntary coordinates in Dhaka)...');

    // Sample coordinates around Dhaka (Gulshan, Dhanmondi, Motijheel, Uttara)
    const sampleCoords = [
      { lat: 23.7925, lng: 90.4078, acc: 15, area: 'Gulshan 2, Dhaka' },
      { lat: 23.7461, lng: 90.3742, acc: 22, area: 'Dhanmondi, Dhaka' },
      { lat: 23.7337, lng: 90.4172, acc: 35, area: 'Motijheel C/A, Dhaka' },
      { lat: 23.8759, lng: 90.3795, acc: 18, area: 'Sector 3, Uttara, Dhaka' },
    ];

    for (let i = 0; i < sampleCoords.length; i++) {
      const coord = sampleCoords[i];
      const sessionId = `demo-session-${i + 1}-${Date.now()}`;

      const consent = await ConsentRecord.create({
        linkId: link1._id,
        visitorSessionId: sessionId,
        consentStatus: 'GRANTED',
        permissionType: 'LOCATION',
        locationGranted: true,
        cameraGranted: false,
        browserInfoGranted: true,
        anonymizedIp: `827f3b${i}98a`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0',
        timestamp: new Date(Date.now() - (i + 1) * 3600 * 1000 * 6),
      });

      const isFirst = i === 0;
      await LinkVisit.create({
        linkId: link1._id,
        ownerId: officer._id,
        visitorReferenceId: `VIS-2026-094${i + 1}`,
        consentRecordId: consent._id,
        visitorSessionId: sessionId,
        ipAddress: '103.199.109.91',
        ipv4: '103.199.109.91',
        ipv6: 'N/A',
        internalIp: '::ffff:10.0.1.6',
        referrer: 'https://protidinernews.xyz/',
        locationSource: isFirst ? 'IP (approximate)' : 'GPS (exact)',
        ipIntelligence: {
          isp: 'Carnival Internet',
          organization: 'Amber IT Limited',
          asn: 'AS132602',
          asName: 'CARNIVAL-INTERNET-BD',
          reverseDns: '103.199.109.91.reverse.amberit.com.bd',
          continent: 'Asia',
          country: 'Bangladesh',
          countryCode: 'BD',
          region: 'Dhaka Division',
          city: 'Dhaka',
          postalCode: '1205',
          timezone: 'Asia/Dhaka',
          utcOffset: '+06:00',
          currency: 'BDT (৳)',
          isMobile: false,
          isProxy: false,
          isHosting: false,
          coordinates: {
            latitude: 23.7004,
            longitude: 90.4287,
          },
        },
        timestamp: isFirst ? new Date() : consent.timestamp,
        visitTimestamp: isFirst ? new Date() : consent.timestamp,
        consentTimestamp: isFirst ? new Date() : consent.timestamp,
        consentStatus: 'GRANTED',
        locationConsentStatus: 'Granted',
        cameraConsentStatus: isFirst ? 'Granted' : 'Not Requested',
        cameraStatus: isFirst ? 'Available' : 'Unavailable',
        voluntarilySharedLocation: true,
        latitude: isFirst ? 23.7004 : coord.lat,
        longitude: isFirst ? 90.4287 : coord.lng,
        accuracy: isFirst ? 25000 : coord.acc,
        voluntarilySharedCamera: isFirst,
        cameraSnapshot: isFirst
          ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240"><rect width="320" height="240" fill="%231e293b"/><circle cx="160" cy="100" r="40" fill="%2364748b"/><path d="M100 190 Q160 140 220 190" stroke="%2364748b" stroke-width="14" fill="none"/><text x="50%" y="225" font-family="sans-serif" font-size="12" fill="%2394a3b8" text-anchor="middle">Voluntary Verification Photo</text></svg>'
          : null,
        browserInfoShared: true,
        browserInfo: {
          browser: 'Chrome',
          os: 'Windows',
          device: 'Desktop',
          screenResolution: '1920x1080',
          language: 'en-US, bn-BD',
          referrer: 'https://protidinernews.xyz/',
        },
      });
    }

    // Sample denied visit
    const deniedConsent = await ConsentRecord.create({
      linkId: link2._id,
      visitorSessionId: `demo-session-denied-${Date.now()}`,
      consentStatus: 'DENIED',
      permissionType: 'NONE',
      locationGranted: false,
      cameraGranted: false,
      browserInfoGranted: false,
      anonymizedIp: '942a19b88c',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      timestamp: new Date(Date.now() - 3600 * 1000 * 3),
    });

    await LinkVisit.create({
      linkId: link2._id,
      ownerId: officer._id,
      visitorReferenceId: 'VIS-2026-0099',
      consentRecordId: deniedConsent._id,
      visitorSessionId: deniedConsent.visitorSessionId,
      timestamp: deniedConsent.timestamp,
      visitTimestamp: deniedConsent.timestamp,
      consentTimestamp: deniedConsent.timestamp,
      consentStatus: 'DENIED',
      locationConsentStatus: 'Denied',
      cameraConsentStatus: 'Denied',
      cameraStatus: 'Unavailable',
      voluntarilySharedLocation: false,
      voluntarilySharedCamera: false,
      browserInfoShared: false,
    });

    console.log('[Seeder] Creating Notifications & Audit Logs...');

    await Notification.create({
      userId: officer._id,
      title: 'Welcome to TrackOps BD',
      message: 'Your officer account has been approved. You have full access to link creation and consent analytics.',
      type: 'ACCOUNT_APPROVED',
    });

    await Notification.create({
      userId: superAdmin._id,
      title: 'Pending Registration',
      message: 'Officer Farhana Islam (Cyber Unit) registered and is pending your approval.',
      type: 'ACCOUNT_STATUS',
    });

    await AuditLog.create({
      performedBy: superAdmin._id,
      performedByName: superAdmin.name,
      action: 'SYSTEM_INITIALIZED',
      targetType: 'SYSTEM',
      details: { environment: 'Development Seeder', version: '1.0.0' },
    });

    await TelecomIntegration.create({
      isEnabled: false,
      providerName: 'BTRC National Gateway Interface (Statutory Dispatch Only)',
      apiEndpoint: '',
      apiKeyMasked: '',
      disclaimer: 'Cell tower information is not available through standard browser access. Legal statutory warrant is required for operator dispatch.',
    });

    console.log('====================================================');
    console.log('TRACKOPS BD DATABASE SEEDED SUCCESSFULLY!');
    console.log('DEMO ACCOUNTS:');
    console.log('1. SUPER ADMIN: superadmin@trackops.local  /  DemoSuperAdmin@2026');
    console.log('2. ADMIN:       admin@trackops.local       /  DemoAdmin@2026');
    console.log('3. APPROVED:    officer@trackops.local     /  DemoOfficer@2026');
    console.log('4. PENDING:     farhana.applicant@trackops.local / DemoPending@2026');
    console.log('5. SUSPENDED:   hossain.suspended@trackops.local / DemoSuspended@2026');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
