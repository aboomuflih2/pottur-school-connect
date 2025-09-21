import {
  mockHeroSlides,
  mockBreakingNews,
  mockSchoolStats,
  mockSocialLinks,
  mockTestimonials,
  mockNews,
  mockAcademicPrograms,
  mockBoardMembers,
  mockEvents,
  mockGalleryPhotos,
} from './mock-data';

const API_BASE_URL = 'http://localhost:8000/api';

class DjangoAPIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    } catch (error) {
      console.warn(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth
  async login(credentials: any) {
    return this.request('/auth/login/', { method: 'POST', body: JSON.stringify(credentials) });
  }

  // Content
  async getHeroSlides() { return this.request('/content/hero-slides/'); }
  async createHeroSlide(slideData: any) { return this.request('/content/hero-slides/', { method: 'POST', body: JSON.stringify(slideData) }); }
  async updateHeroSlide(slideId: string, slideData: any) { return this.request(`/content/hero-slides/${slideId}/`, { method: 'PUT', body: JSON.stringify(slideData) }); }
  async deleteHeroSlide(slideId: string) { return this.request(`/content/hero-slides/${slideId}/`, { method: 'DELETE' }); }
  async getBreakingNews() { return this.request('/content/breaking-news/'); }
  async createBreakingNews(newsData: any) { return this.request('/content/breaking-news/', { method: 'POST', body: JSON.stringify(newsData) }); }
  async updateBreakingNews(newsId: string, newsData: any) { return this.request(`/content/breaking-news/${newsId}/`, { method: 'PUT', body: JSON.stringify(newsData) }); }
  async deleteBreakingNews(newsId: string) { return this.request(`/content/breaking-news/${newsId}/`, { method: 'DELETE' }); }
  async getSchoolStats() { return this.request('/content/school-stats/'); }
  async updatePageContent(pageKey: string, contentData: any) { return this.request(`/content/page-content/${pageKey}/`, { method: 'PUT', body: JSON.stringify(contentData) }); }
  async updateStaffCounts(staffCountsId: string, staffCountsData: any) { return this.request(`/content/staff-counts/${staffCountsId}/`, { method: 'PUT', body: JSON.stringify(staffCountsData) }); }
  async getSocialMediaLinks() { return this.request('/content/social-media-links/'); }
  async createSocialMediaLink(linkData: any) { return this.request('/content/social-media-links/', { method: 'POST', body: JSON.stringify(linkData) }); }
  async updateSocialMediaLink(linkId: string, linkData: any) { return this.request(`/content/social-media-links/${linkId}/`, { method: 'PUT', body: JSON.stringify(linkData) }); }
  async deleteSocialMediaLink(linkId: string) { return this.request(`/content/social-media-links/${linkId}/`, { method: 'DELETE' }); }
  async getTestimonials() { return this.request('/content/testimonials/'); }
  async updateTestimonial(testimonialId: string, testimonialData: any) { return this.request(`/content/testimonials/${testimonialId}/`, { method: 'PUT', body: JSON.stringify(testimonialData) }); }
  async deleteTestimonial(testimonialId: string) { return this.request(`/content/testimonials/${testimonialId}/`, { method: 'DELETE' }); }
  async getBoardMembers() { return this.request('/content/board-members/'); }
  async createBoardMember(memberData: any) { return this.request('/content/board-members/', { method: 'POST', body: JSON.stringify(memberData) }); }
  async updateBoardMember(memberId: string, memberData: any) { return this.request(`/content/board-members/${memberId}/`, { method: 'PUT', body: JSON.stringify(memberData) }); }
  async deleteBoardMember(memberId: string) { return this.request(`/content/board-members/${memberId}/`, { method: 'DELETE' }); }

  // Leadership Messages
  async getLeadershipMessages() { return this.request('/content/leadership-messages/'); }
  async createLeadershipMessage(messageData: any) { return this.request('/content/leadership-messages/', { method: 'POST', body: JSON.stringify(messageData) }); }
  async updateLeadershipMessage(messageId: string, messageData: any) { return this.request(`/content/leadership-messages/${messageId}/`, { method: 'PUT', body: JSON.stringify(messageData) }); }
  async deleteLeadershipMessage(messageId: string) { return this.request(`/content/leadership-messages/${messageId}/`, { method: 'DELETE' }); }

  // File Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/content/file-uploads/', { method: 'POST', body: formData });
  }
  async deleteFile(fileId: string) { return this.request(`/content/file-uploads/${fileId}/`, { method: 'DELETE' }); }

  // Contact Page
  async getContactPageContent() { return this.request('/content/contact-page-content/'); }
  async getContactAddresses() { return this.request('/content/contact-addresses/'); }
  async createContactAddress(addressData: any) { return this.request('/content/contact-addresses/', { method: 'POST', body: JSON.stringify(addressData) }); }
  async updateContactAddress(addressId: string, addressData: any) { return this.request(`/content/contact-addresses/${addressId}/`, { method: 'PUT', body: JSON.stringify(addressData) }); }
  async deleteContactAddress(addressId: string) { return this.request(`/content/contact-addresses/${addressId}/`, { method: 'DELETE' }); }
  async getContactLocations() { return this.request('/content/contact-locations/'); }
  async createContactLocation(locationData: any) { return this.request('/content/contact-locations/', { method: 'POST', body: JSON.stringify(locationData) }); }
  async updateContactLocation(locationId: string, locationData: any) { return this.request(`/content/contact-locations/${locationId}/`, { method: 'PUT', body: JSON.stringify(locationData) }); }
  async deleteContactLocation(locationId: string) { return this.request(`/content/contact-locations/${locationId}/`, { method: 'DELETE' }); }

  // News
  async getNewsPosts() { return this.request('/news/posts/'); }
  async createNewsPost(postData: any) { return this.request('/news/posts/', { method: 'POST', body: JSON.stringify(postData) }); }
  async updateNewsPost(postId: string, postData: any) { return this.request(`/news/posts/${postId}/`, { method: 'PUT', body: JSON.stringify(postData) }); }
  async deleteNewsPost(postId: string) { return this.request(`/news/posts/${postId}/`, { method: 'DELETE' }); }
  async getNewsComments(postId: string) { return this.request(`/news/posts/${postId}/comments/`); }
  async getAllNewsComments() { return this.request('/news/comments/'); }
  async updateNewsComment(commentId: string, commentData: any) { return this.request(`/news/comments/${commentId}/`, { method: 'PUT', body: JSON.stringify(commentData) }); }
  async deleteNewsComment(commentId: string) { return this.request(`/news/comments/${commentId}/`, { method: 'DELETE' }); }

  // Jobs
  async getJobPositions() { return this.request('/jobs/positions/'); }
  async getJobApplications() { return this.request('/jobs/applications/'); }
  async createJobApplication(applicationData: any) { return this.request('/jobs/applications/', { method: 'POST', body: applicationData }); }
  async deleteJobApplication(applicationId: string) { return this.request(`/jobs/applications/${applicationId}/`, { method: 'DELETE' }); }

  // Academics
  async getDepartments() { return this.request('/academics/departments/'); }
  async getPrograms() { return this.request('/academics/programs/'); }
  async getCourses() { return this.request('/academics/courses/'); }
  async getFaculty() { return this.request('/academics/faculty/'); }
  async createProgram(programData: any) { return this.request('/academics/programs/', { method: 'POST', body: JSON.stringify(programData) }); }
  async updateProgram(programId: string, programData: any) { return this.request(`/academics/programs/${programId}/`, { method: 'PUT', body: JSON.stringify(programData) }); }
  async deleteProgram(programId: string) { return this.request(`/academics/programs/${programId}/`, { method: 'DELETE' }); }

  // Admissions
  async getKgStdApplications() { return this.request('/admissions/kg-std-applications/'); }
  async getPlusOneApplications() { return this.request('/admissions/plus-one-applications/'); }
  async getAdmissionForms() { return this.request('/admissions/forms/'); }
  async updateAdmissionForm(formType: string, data: any) { return this.request(`/admissions/forms/${formType}/`, { method: 'PUT', body: JSON.stringify(data) }); }
  async getKgStdApplication(id: string) { return this.request(`/admissions/kg-std-applications/${id}/`); }
  async getPlusOneApplication(id: string) { return this.request(`/admissions/plus-one-applications/${id}/`); }
  async updateKgStdApplication(id: string, data: any) { return this.request(`/admissions/kg-std-applications/${id}/`, { method: 'PUT', body: JSON.stringify(data) }); }
  async updatePlusOneApplication(id: string, data: any) { return this.request(`/admissions/plus-one-applications/${id}/`, { method: 'PUT', body: JSON.stringify(data) }); }
  async getInterviewSubjectTemplates(formType: string) { return this.request(`/admissions/interview-subject-templates/?form_type=${formType}`); }
  async getInterviewSubjects(applicationId: string) { return this.request(`/admissions/interview-subjects/?application_id=${applicationId}`); }
  async saveInterviewSubjects(applicationId: string, subjects: any) { return this.request(`/admissions/interview-subjects/save_marks/`, { method: 'POST', body: JSON.stringify({ application_id: applicationId, subjects }) }); }

  // Gallery
  async getGalleryPhotos() { return this.request('/gallery/photos/'); }
  async createGalleryPhoto(photoData: any) { return this.request('/gallery/photos/', { method: 'POST', body: JSON.stringify(photoData) }); }
  async updateGalleryPhoto(photoId: string, photoData: any) { return this.request(`/gallery/photos/${photoId}/`, { method: 'PUT', body: JSON.stringify(photoData) }); }
  async deleteGalleryPhoto(photoId: string) { return this.request(`/gallery/photos/${photoId}/`, { method: 'DELETE' }); }

  // Events
  async getEvents() {
    try {
      const response = await this.request<any[]>('/events/');
      return response.length > 0 ? response : mockEvents;
    } catch (error) {
      console.warn('Using mock events data');
      return mockEvents;
    }
  }
  async createEvent(eventData: any) { return this.request('/events/', { method: 'POST', body: JSON.stringify(eventData) }); }
  async updateEvent(eventId: string, eventData: any) { return this.request(`/events/${eventId}/`, { method: 'PUT', body: JSON.stringify(eventData) }); }
  async deleteEvent(eventId: string) { return this.request(`/events/${eventId}/`, { method: 'DELETE' }); }

  // Utils
  async getApplicationStatus(applicationNumber: string, mobileNumber: string) { return this.request('/utils/get-application-status/', { method: 'POST', body: JSON.stringify({ applicationNumber, mobileNumber }) }); }
  async generateApplicationPdf(applicationNumber: string, applicationType: string, mobileNumber: string) { return this.request('/utils/generate-application-pdf/', { method: 'POST', body: JSON.stringify({ applicationNumber, applicationType, mobileNumber }) }); }
  async generateInterviewLetter(applicationNumber: string, applicationType: string, mobileNumber: string) { return this.request('/utils/generate-interview-letter/', { method: 'POST', body: JSON.stringify({ applicationNumber, applicationType, mobileNumber }) }); }
  async generateMarkList(applicationNumber: string, applicationType: string, mobileNumber: string) { return this.request('/utils/generate-mark-list/', { method: 'POST', body: JSON.stringify({ applicationNumber, applicationType, mobileNumber }) }); }
}

export const djangoAPI = new DjangoAPIClient();
export default djangoAPI;