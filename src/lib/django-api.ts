// Django API Client Configuration
import {
  mockHeroSlides,
  mockBreakingNews,
  mockSchoolStats,
  mockSocialLinks,
  mockTestimonials,
  mockNews,
  mockAcademicPrograms
} from './mock-data';

const API_BASE_URL = 'http://localhost:8000/api';

class DjangoAPIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.warn(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Hero Slides API
  async getHeroSlides() {
    try {
      const response = await this.request<{results: any[]}>('/content/hero-slides/');
      return response.results.length > 0 ? response.results : mockHeroSlides;
    } catch (error) {
      console.warn('Using mock hero slides data');
      return mockHeroSlides;
    }
  }

  // Breaking News API
  async getBreakingNews() {
    try {
      const response = await this.request<{results: any[]}>('/content/breaking-news/');
      return response.results.length > 0 ? response.results[0] : mockBreakingNews;
    } catch (error) {
      console.warn('Using mock breaking news data');
      return mockBreakingNews;
    }
  }

  // School Stats API
  async getSchoolStats() {
    try {
      const response = await this.request<{results: any[]}>('/content/school-stats/');
      return response.results.length > 0 ? response.results : mockSchoolStats;
    } catch (error) {
      console.warn('Using mock school stats data');
      return mockSchoolStats;
    }
  }

  // Social Media Links API
  async getSocialMediaLinks() {
    try {
      const response = await this.request<{results: any[]}>('/content/social-media-links/');
      return response.results.length > 0 ? response.results : mockSocialLinks;
    } catch (error) {
      console.warn('Using mock social links data');
      return mockSocialLinks;
    }
  }

  // Testimonials API
  async getTestimonials() {
    try {
      const response = await this.request<{results: any[]}>('/content/testimonials/');
      return response.results.length > 0 ? response.results : mockTestimonials;
    } catch (error) {
      console.warn('Using mock testimonials data');
      return mockTestimonials;
    }
  }

  // News API
  async getNews() {
    try {
      const response = await this.request<{results: any[]}>('/news/articles/');
      return response.results.length > 0 ? response.results : mockNews;
    } catch (error) {
      console.warn('Using mock news data');
      return mockNews;
    }
  }

  // News API methods
  async getLatestNews(limit: number = 3) {
    return this.request(`/news/?limit=${limit}`);
  }

  // Academic Programs API
  async getAcademicPrograms() {
    try {
      const response = await this.request<{results: any[]}>('/academics/programs/');
      return response.results.length > 0 ? response.results : mockAcademicPrograms;
    } catch (error) {
      console.warn('Using mock academic programs data');
      return mockAcademicPrograms;
    }
  }

  // Events API methods
  async getEvents() {
    return this.request('/events/');
  }

  // Gallery API methods
  async getGalleryImages() {
    return this.request('/gallery/');
  }

  // Admissions API methods
  async submitApplication(data: any) {
    return this.request('/admissions/applications/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const djangoAPI = new DjangoAPIClient();
export default djangoAPI;