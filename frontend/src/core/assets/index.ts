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
    doctorIcon: require('../../../assets/doctor-icon.png'),
    patient: require('../../../assets/patient-image.png'),
    patientIcon: require('../../../assets/patient-icon.png'),
    stethoscope: require('../../../assets/Stetescope.png'),
    booking: require('../../../assets/Booking_Icon.png'),
    heartBeep: require('../../../assets/heart-beep-element.png'),
    heartLine: require('../../../assets/heart-line-health-icons.png'),
    healthcare: require('../../../assets/healthcare.png'),
    business: require('../../../assets/business.png'),
    findDoctor: require('../../../assets/find-doctor-icon.png'),
  },
  icons: {
    document: require('../../../assets/document.png'),
    home: require('../../../assets/home-icon.png'),
    navHome: require('../../../assets/nav-bar/nav-home-icon.png'),
    navHomeSelected: require('../../../assets/nav-bar/nav-home-selected-icon.png'),
    medicalRecord: require('../../../assets/medical-record-icon.png'),
    notificationBell: require('../../../assets/notification-bell-icon.png'),
    notificationBell3d: require('../../../assets/3d-notification-bell-icon.png'),
    prescription: require('../../../assets/prescription-icon.png'),
    search: require('../../../assets/search-icon.png'),
    user: require('../../../assets/user.png'),
    video: require('../../../assets/video-icon.png'),
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
} as const;



export default assets;
