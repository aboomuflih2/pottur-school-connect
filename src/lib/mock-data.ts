// Mock data for testing when Django API returns empty results

export const mockHeroSlides = [
  {
    id: 1,
    title: "Welcome to Modern Higher Secondary School",
    subtitle: "Excellence in Education Since 1985",
    image_url: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20school%20building%20with%20students%20walking%20in%20courtyard%20bright%20sunny%20day&image_size=landscape_16_9",
    button_text: "Learn More",
    button_link: "/about",
    is_active: true,
    order_index: 1
  },
  {
    id: 2,
    title: "Admissions Open for 2024-25",
    subtitle: "Join our community of learners",
    image_url: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=students%20studying%20in%20modern%20classroom%20with%20teacher%20bright%20educational%20environment&image_size=landscape_16_9",
    button_text: "Apply Now",
    button_link: "/admissions",
    is_active: true,
    order_index: 2
  }
];

export const mockBreakingNews = {
  message: "🎉 Congratulations to our students for excellent results in the state board examinations!",
  link_url: "/news",
  link_text: "Read More",
  is_external: false,
  is_active: true
};

export const mockSchoolStats = [
  {
    id: 1,
    label: "Students",
    value: "1200+",
    icon: "users",
    is_active: true,
    display_order: 1
  },
  {
    id: 2,
    label: "Teachers",
    value: "85+",
    icon: "graduation-cap",
    is_active: true,
    display_order: 2
  },
  {
    id: 3,
    label: "Years of Excellence",
    value: "39+",
    icon: "award",
    is_active: true,
    display_order: 3
  },
  {
    id: 4,
    label: "Success Rate",
    value: "98%",
    icon: "trophy",
    is_active: true,
    display_order: 4
  }
];

export const mockSocialLinks = [
  {
    id: 1,
    platform: "Facebook",
    url: "https://facebook.com/modernhsspotur",
    icon: "facebook",
    is_active: true,
    display_order: 1
  },
  {
    id: 2,
    platform: "Instagram",
    url: "https://instagram.com/modernhsspotur",
    icon: "instagram",
    is_active: true,
    display_order: 2
  },
  {
    id: 3,
    platform: "YouTube",
    url: "https://youtube.com/modernhsspotur",
    icon: "youtube",
    is_active: true,
    display_order: 3
  }
];

export const mockTestimonials = [
  {
    id: 1,
    name: "Aisha Rahman",
    role: "Alumni - Class of 2020",
    content: "Modern HSS provided me with excellent education and values that shaped my career. The teachers are dedicated and the environment is nurturing.",
    image_url: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20young%20woman%20smiling%20portrait%20graduation%20photo&image_size=square",
    rating: 5,
    is_active: true,
    status: "approved"
  },
  {
    id: 2,
    name: "Mohammed Farhan",
    role: "Parent",
    content: "I'm impressed with the quality of education and the personal attention given to each student. My daughter has shown remarkable improvement.",
    image_url: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=middle%20aged%20man%20smiling%20professional%20portrait&image_size=square",
    rating: 5,
    is_active: true,
    status: "approved"
  },
  {
    id: 3,
    name: "Fatima Ali",
    role: "Current Student - Plus One",
    content: "The teachers here are amazing and always ready to help. The school has great facilities and a friendly atmosphere.",
    image_url: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=young%20student%20girl%20smiling%20school%20uniform%20portrait&image_size=square",
    rating: 5,
    is_active: true,
    status: "approved"
  }
];

export const mockNews = [
  {
    id: 1,
    title: "Annual Sports Day Celebration",
    excerpt: "Our annual sports day was a grand success with students showcasing their athletic talents across various events.",
    featured_image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=school%20sports%20day%20students%20running%20track%20field%20colorful%20event&image_size=landscape_4_3",
    publication_date: "2024-01-15",
    is_published: true
  },
  {
    id: 2,
    title: "Science Exhibition 2024",
    excerpt: "Students presented innovative science projects demonstrating their creativity and scientific understanding.",
    featured_image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=students%20science%20exhibition%20projects%20displays%20school%20hall&image_size=landscape_4_3",
    publication_date: "2024-01-10",
    is_published: true
  },
  {
    id: 3,
    title: "Cultural Program Success",
    excerpt: "Our students performed beautifully in the annual cultural program, showcasing diverse talents in music, dance, and drama.",
    featured_image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=school%20cultural%20program%20students%20performing%20stage%20colorful%20costumes&image_size=landscape_4_3",
    publication_date: "2024-01-05",
    is_published: true
  }
];

export const mockAcademicPrograms = [
  {
    id: 1,
    name: "Lower Primary (LKG - 4th)",
    description: "Foundation years focusing on basic literacy, numeracy, and social skills development.",
    icon_url: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20children%20books%20pencils%20educational%20toys%20icon&image_size=square",
    is_active: true,
    display_order: 1
  },
  {
    id: 2,
    name: "Upper Primary (5th - 7th)",
    description: "Building strong academic foundations with introduction to specialized subjects.",
    icon_url: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=school%20textbooks%20calculator%20globe%20educational%20materials%20icon&image_size=square",
    is_active: true,
    display_order: 2
  },
  {
    id: 3,
    name: "High School (8th - 10th)",
    description: "Comprehensive curriculum preparing students for board examinations and future studies.",
    icon_url: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=graduation%20cap%20diploma%20books%20academic%20achievement%20icon&image_size=square",
    is_active: true,
    display_order: 3
  },
  {
    id: 4,
    name: "Higher Secondary (11th - 12th)",
    description: "Specialized streams in Science, Commerce, and Humanities for career preparation.",
    icon_url: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=university%20building%20academic%20excellence%20higher%20education%20icon&image_size=square",
    is_active: true,
    display_order: 4
  }
];