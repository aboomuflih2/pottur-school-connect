import pkg from 'pg';
const { Client } = pkg;

// Direct PostgreSQL connection
const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function insertSeedData() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Insert admission forms
    const admissionForms = [
      {
        student_name: 'John Doe',
        parent_name: 'Jane Doe',
        email: 'jane.doe@email.com',
        phone: '+1234567890',
        address: '123 Main Street, City, State',
        grade: '5th Grade',
        previous_school: 'Elementary School ABC',
        status: 'pending'
      },
      {
        student_name: 'Alice Smith',
        parent_name: 'Bob Smith',
        email: 'bob.smith@email.com',
        phone: '+1987654321',
        address: '456 Oak Avenue, City, State',
        grade: '3rd Grade',
        previous_school: 'Primary School XYZ',
        status: 'approved'
      }
    ];

    for (const form of admissionForms) {
      await client.query(
        `INSERT INTO admission_forms (student_name, parent_name, email, phone, address, grade, previous_school, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [form.student_name, form.parent_name, form.email, form.phone, form.address, form.grade, form.previous_school, form.status]
      );
    }
    console.log('Admission forms inserted successfully');

    // Insert news posts
    const newsPosts = [
      {
        title: 'Welcome to New Academic Year 2024',
        content: 'We are excited to welcome all students and families to the new academic year. This year brings new opportunities, challenges, and exciting learning experiences.',
        excerpt: 'Welcome message for the new academic year with exciting opportunities ahead.',
        featured_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=school%20building%20with%20students%20walking%20in%20bright%20sunny%20day&image_size=landscape_16_9',
        category: 'announcements',
        tags: '{"academic year", "welcome", "students"}',
        is_published: true,
        published_at: 'NOW()'
      },
      {
        title: 'Science Fair 2024 Results',
        content: 'Congratulations to all participants in our annual Science Fair. The creativity and innovation displayed by our students was truly remarkable.',
        excerpt: 'Annual Science Fair results showcasing student creativity and innovation.',
        featured_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=science%20fair%20with%20students%20presenting%20projects%20colorful%20displays&image_size=landscape_16_9',
        category: 'events',
        tags: '{"science fair", "results", "innovation"}',
        is_published: true,
        published_at: 'NOW()'
      }
    ];

    for (const post of newsPosts) {
      await client.query(
        `INSERT INTO news_posts (title, content, excerpt, featured_image, category, tags, is_published, published_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [post.title, post.content, post.excerpt, post.featured_image, post.category, post.tags, post.is_published, new Date()]
      );
    }
    console.log('News posts inserted successfully');

    // Insert hero slides
    const heroSlides = [
      {
        title: 'Excellence in Education',
        subtitle: 'Nurturing young minds for a brighter future',
        image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20school%20campus%20with%20happy%20students%20learning%20outdoors&image_size=landscape_16_9',
        button_text: 'Learn More',
        button_url: '/about',
        order_index: 1,
        is_active: true
      },
      {
        title: 'Join Our Community',
        subtitle: 'Discover the difference quality education makes',
        image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=diverse%20group%20of%20students%20collaborating%20in%20classroom%20bright%20atmosphere&image_size=landscape_16_9',
        button_text: 'Apply Now',
        button_url: '/admissions',
        order_index: 2,
        is_active: true
      }
    ];

    for (const slide of heroSlides) {
      await client.query(
        `INSERT INTO hero_slides (title, subtitle, image_url, button_text, button_url, order_index, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [slide.title, slide.subtitle, slide.image_url, slide.button_text, slide.button_url, slide.order_index, slide.is_active]
      );
    }
    console.log('Hero slides inserted successfully');

    console.log('All seed data inserted successfully!');
  } catch (error) {
    console.error('Error inserting seed data:', error);
  } finally {
    await client.end();
  }
}

insertSeedData();