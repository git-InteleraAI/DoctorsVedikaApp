/**
 * frontend/src/core/assets/index.ts
 * Enterprise Universal Assets Registry
 */

export const assets = {
  logo: {
    main: require('../../../assets/Logo.png'),
    withName: require('../../../assets/Logo_with_Name_Beside.png'),
    nameLogo: require('../../../assets/DoctorsVedikaNameLogo.png'),
    icon: require('../../../assets/icon.png'),
    adaptiveIcon: require('../../../assets/adaptive-icon.png'),
    splashIcon: require('../../../assets/splash-icon.png'),
    favicon: require('../../../assets/favicon.png'),
    doctorsVedika: require('../../../assets/DoctorsVedika.png'),
  },
  images: {
    doctor: require('../../../assets/doctor-image.png'),
    doctorIcon: require('../../../assets/doctor-image.png'),
    patient: require('../../../assets/patient-image.png'),
    patientIcon: require('../../../assets/patient-image.png'),
    stethoscope: require('../../../assets/Stetescope.png'),
    booking: require('../../../assets/Booking_Icon.png'),
    heartBeep: require('../../../assets/heart-beep-element.png'),
    heartLine: require('../../../assets/heart-line-health-icons.png'),
    healthcare: require('../../../assets/find-doctor-icon.png'),
    business: require('../../../assets/find-doctor-icon.png'),
    findDoctor: require('../../../assets/find-doctor-icon.png'),
  },
  icons: {
    document: require('../../../assets/appointment-booking-icon.png'),
    home: require('../../../assets/nav-bar/nav-home-icon.png'),
    navHome: require('../../../assets/nav-bar/nav-home-icon.png'),
    navHomeSelected: require('../../../assets/nav-bar/nav-home-selected-icon.png'),
    medicalRecord: require('../../../assets/appointment-booking-icon.png'),
    notificationBell: require('../../../assets/3d-notification-bell-icon.png'),
    notificationBell3d: require('../../../assets/3d-notification-bell-icon.png'),
    prescription: require('../../../assets/appointment-booking-icon.png'),
    search: require('../../../assets/find-doctor-icon.png'),
    user: require('../../../assets/nav-bar/nav-profile-icon.png'),
    video: require('../../../assets/nav-bar/nav-video-icon.png'),
    appointmentBooking: require('../../../assets/appointment-booking-icon.png'),
  },
  navBar: {
    home: require('../../../assets/nav-bar/nav-home-icon.png'),
    homeSelected: require('../../../assets/nav-bar/nav-home-selected-icon.png'),
    discover: require('../../../assets/nav-bar/nav-discover-icon.png'),
    discoverSelected: require('../../../assets/nav-bar/nav-discover-selected-icon.png'),
    appointment: require('../../../assets/nav-bar/nav-appointment-icon.png'),
    appointmentSelected: require('../../../assets/nav-bar/nav-appointment-selected-icon.png'),
    video: require('../../../assets/nav-bar/nav-video-icon.png'),
    videoSelected: require('../../../assets/nav-bar/nav-video-selected-icon.png'),
    profile: require('../../../assets/nav-bar/nav-profile-icon.png'),
    profileSelected: require('../../../assets/nav-bar/nav-profile-selected-icon.png'),
  },
  categories: {
    gynecology: require('../../../assets/gynocology-image.png'),
    cardiology: require('../../../assets/heart-image.png'),
    neurology: require('../../../assets/brain-image.png'),
    orthopedics: require('../../../assets/back-bone-image.png'),
    pediatrics: require('../../../assets/baby-image.png'),
  },
  bento: {
    findDoctor: require('../../../assets/home-bento-grid/find-doctor-image.png'),
    educationalVideos: require('../../../assets/home-bento-grid/educational-videos-image.png'),
    healthRecords: require('../../../assets/home-bento-grid/health-record-image.png'),
    prescriptions: require('../../../assets/home-bento-grid/prescription-image.png'),
    reminders: require('../../../assets/home-bento-grid/remainder-image.png'),
    askDoctor: require('../../../assets/home-bento-grid/ask-a-doctor.png'),
  },
} as const;

export default assets;
