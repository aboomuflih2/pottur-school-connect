// Django API Client Configuration
// Centralized client for the Django REST API used by the frontend.
// Uses environment variable VITE_API_BASE_URL when available.

const DEFAULT_API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

class DjangoAPIClient {
  private baseURL: string;

  constructor(baseURL: string = DEFAULT_API_BASE_URL) {
    this.baseURL = baseURL.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const init: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    };
    const res = await fetch(url, init);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status} ${res.statusText} at ${endpoint}: ${text}`);
    }
    // Some endpoints may 204 with no content
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return undefined as unknown as T;
    return res.json();
  }

  // Content APIs
  async getHeroSlides() {
    // GET /api/content/hero-slides/
    const response = await this.request<{results: any[]}>('/content/hero-slides/');
    return response?.results || [];
  }

  async getBreakingNews() {
    // GET /api/content/breaking-news/
    const response = await this.request<{results: any[]}>('/content/breaking-news/');
    const items = response?.results || [];
    return items?.[0] || null;
  }

  async getSchoolStats() {
    // GET /api/content/school-stats/
    const response = await this.request<{results: any[]}>('/content/school-stats/');
    return response?.results || [];
  }

  async getSocialMediaLinks() {
    // GET /api/content/social-media-links/
    const response = await this.request<{results: any[]}>('/content/social-media-links/');
    return response?.results || [];
  }

  async getTestimonials() {
    // GET /api/content/testimonials/
    const response = await this.request<{results: any[]}>('/content/testimonials/');
    return response?.results || [];
  }

  async createContactSubmission(payload: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    // POST /api/content/contact-submissions/
    return this.request<any>('/content/contact-submissions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // News APIs
  async getNewsPosts() {
    // GET /api/news/posts/
    const response = await this.request<{results: any[]}>('/news/posts/');
    return response?.results || [];
  }

  // Events APIs
  async getEvents() {
    // GET /api/events/events/
    const response = await this.request<{results: any[]}>('/events/events/');
    return response?.results || [];
  }

  // Gallery APIs
  async getGalleryPhotos() {
    // GET /api/gallery/photos/
    const response = await this.request<{results: any[]}>('/gallery/photos/');
    return response?.results || [];
  }

  // Academics APIs
  async getAcademicPrograms() {
    // GET /api/academics/programs/
    const response = await this.request<{results: any[]}>('/academics/programs/');
    return response?.results || [];
  }
}

export const djangoAPI = new DjangoAPIClient();
export default djangoAPI;
