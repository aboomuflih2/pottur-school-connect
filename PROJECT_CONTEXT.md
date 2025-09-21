# Pottur School Connect - Project Context

## Project Overview
Pottur School Connect is a comprehensive school management system built with modern web technologies. The platform serves as a central hub for school administration, student management, and communication between stakeholders.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Django (DRF + JWT + PostgreSQL)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **UI Components**: Custom components with Lucide React icons
- **Development**: Node.js 22.18.0, npm

## Current Features

### Admin Dashboard
- **Job Applications Management**: View, filter, and manage job applications
- **Contact Forms**: Handle inquiries and contact submissions
- **Academic Programs**: Manage school programs and courses
- **Student Admissions**: Process and track admission applications
- **User Management**: Admin user authentication and authorization
- **Leadership Management**: Manage board members and leadership team

### Public Features
- **Careers Page**: Job application submission with CV upload
- **Contact Forms**: General inquiries and communication
- **Academic Information**: Program details and course information
- **Responsive Design**: Mobile-friendly interface
- **Leadership Section**: Display board members with profile modals

## Database Schema (Django)

### Key Tables
- `job_applications`: Stores job application data with CV file references
  - Columns: id, full_name, email, phone, designation, experience, cv_file_path, created_at
  - RLS: Authenticated users can insert/view/update/delete
- `contact_forms`: General contact submissions
- `academic_programs`: School programs and courses
- `admission_forms`: Student admission applications
- `accounts_user`: Django custom user (email-based)
- `board_members`: Leadership team members with profiles and positions
- `social_links`: Social media links for board members

### Media Storage
- Django `MEDIA_ROOT` used for file uploads
- File/Image fields on models (e.g., jobs documents, news images)

## Environment Configuration

### Development Setup
- Django dev server on http://localhost:8001 (configurable)
- Vite dev server on http://localhost:8080
- PostgreSQL configured via env in `backend/.env`

### Required Environment Variables
- Database credentials
- Storage configuration
- Authentication settings
 - API base URL for frontend (VITE_API_BASE_URL)

## Project Structure
```
src/
├── components/
│   ├── admin/           # Admin dashboard components
│   │   ├── AdminLayout.tsx
│   │   ├── NewsForm.tsx
│   │   ├── GalleryUpload.tsx
│   │   ├── EventForm.tsx
│   │   ├── MemberForm.tsx
│   │   ├── LeadershipManager.tsx
│   │   └── ...
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── public/          # Public-facing components
│       ├── LeadershipSection.tsx
│       ├── MemberProfileModal.tsx
│       └── ...
├── pages/               # Page components
│   ├── Home.tsx
│   ├── About.tsx
│   ├── News.tsx
│   ├── Gallery.tsx
│   ├── Events.tsx
│   ├── Admissions.tsx
│   ├── Contact.tsx
│   └── admin/           # Admin pages
│       ├── Dashboard.tsx
│       ├── NewsManager.tsx
│       ├── GalleryManager.tsx
│       ├── about/
│       │   └── Leadership.tsx
│       └── ...
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useNews.ts
│   ├── useGallery.ts
│   ├── useBoardMembers.ts
│   └── ...
├── types/               # TypeScript type definitions
│   ├── auth.ts
│   ├── news.ts
│   ├── gallery.ts
│   ├── board-members.ts
│   └── ...
├── utils/               # Utility functions
│   ├── django-api.ts
│   ├── auth.ts
│   └── ...
└── styles/              # CSS and styling
    └── globals.css

backend/
├── pottur_backend/         # Django project
├── accounts/ events/ news/ # Apps
└── ...
```

## Feature Details

### Director Board Section
The Director Board feature provides comprehensive management of leadership team members:

**Database Tables:**
- `board_members`: Stores member profiles, positions, bio, and metadata
- `social_links`: Stores social media links associated with board members

**Frontend Components:**
- `LeadershipSection`: Public display of board members with responsive grid
- `MemberProfileModal`: Detailed member profile popup with social links
- `LeadershipManager`: Admin interface for CRUD operations
- `MemberForm`: Form component for adding/editing members

**Key Features:**
- Responsive grid layout for member display
- Profile photo upload via Django media (or URLs)
- Dynamic social media links (LinkedIn, Twitter, Email, Website)
- Admin dashboard integration
- RLS policies for secure data access
- Sample data seeding for development

## Development Guidelines

### Code Quality
- Use TypeScript for type safety
- Follow React best practices with hooks
- Keep components under 300 lines
- Use Tailwind for styling (no custom CSS)
- Implement responsive design by default

### Database Operations
- Use Django REST API endpoints for all interactions
- Use JWT auth; respect permissions per viewset
- Handle file uploads via model File/Image fields
- Use proper error handling and validation

### State Management
- Use Zustand for global state
- Keep local state minimal with useState
- Implement proper loading and error states

## Deployment
- Target platform: Vercel (configured)
- Build command: `npm run build`
- Environment variables must be configured in deployment platform

## Common Issues & Solutions

### Database Schema Mismatches
- Always verify column names match between migrations and frontend code
- Use `full_name` instead of `name` for consistency
- Check RLS policies if data access issues occur

### File Upload Issues
- Ensure storage buckets exist and have proper policies
- Verify file size limits and allowed file types
- Check authentication status for upload permissions

## Key Files to Reference
- `src/lib/django-api.ts`: Django API client
- `src/hooks/useAuth.ts`: Authentication hook
- `src/hooks/useBoardMembers.ts`: Board members management hook
- `src/components/admin/AdminLayout.tsx`: Admin dashboard layout
- `src/components/admin/MemberForm.tsx`: Board member form component
- `src/components/admin/LeadershipManager.tsx`: Leadership management interface
- `src/components/public/LeadershipSection.tsx`: Public leadership display
- `src/components/public/MemberProfileModal.tsx`: Member profile modal
- `src/pages/admin/Dashboard.tsx`: Main admin dashboard
- `src/pages/admin/about/Leadership.tsx`: Leadership management page
- `src/types/board-members.ts`: Board member type definitions
- `src/hooks/useJobApplications.ts`: Job application data management
 
- `.env`: Environment configuration
- `src/pages/Careers.tsx`: Job application form
- Admin dashboard components for data display

---

**Last Updated**: Created as central reference document
**Maintainer**: Development Team
**Version**: 1.0.0
