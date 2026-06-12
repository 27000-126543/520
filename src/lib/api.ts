import type {
  ApiResponse, AuthResponse, LoginRequest, RegisterRequest,
  Organization, CreateOrganizationRequest, Spy, UpgradeSpyRequest,
  Mission, MissionExecution, AcceptMissionRequest, MissionActionRequest,
  MarketListing, CreateListingRequest, IntelScroll, Guild, Building,
  WeeklyReport, RankingEntry, RankingType, Announcement, DonateMaterialRequest
} from '../../shared/types';

const API_BASE = '/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data as T;
};

export const authAPI = {
  login: (data: LoginRequest) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => handleResponse<ApiResponse<AuthResponse>>(r)),

  register: (data: RegisterRequest) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => handleResponse<ApiResponse<AuthResponse>>(r)),

  me: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<any>>(r))
};

export const organizationAPI = {
  get: () =>
    fetch(`${API_BASE}/organization`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Organization>>(r)),

  create: (data: CreateOrganizationRequest) =>
    fetch(`${API_BASE}/organization`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<ApiResponse<Organization>>(r)),

  update: (data: Partial<Organization>) =>
    fetch(`${API_BASE}/organization`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<ApiResponse<Organization>>(r))
};

export const spyAPI = {
  getAll: () =>
    fetch(`${API_BASE}/spies`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Spy[]>>(r)),

  get: (id: string) =>
    fetch(`${API_BASE}/spies/${id}`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Spy>>(r)),

  recruit: () =>
    fetch(`${API_BASE}/spies/recruit`, {
      method: 'POST',
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Spy>>(r)),

  upgrade: (id: string, skill: UpgradeSpyRequest['skill']) =>
    fetch(`${API_BASE}/spies/${id}/upgrade`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ skill })
    }).then(r => handleResponse<ApiResponse<Spy>>(r))
};

export const missionAPI = {
  getAll: () =>
    fetch(`${API_BASE}/missions`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Mission[]>>(r)),

  get: (id: string) =>
    fetch(`${API_BASE}/missions/${id}`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Mission>>(r)),

  refresh: () =>
    fetch(`${API_BASE}/missions/refresh`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Mission[]>>(r)),

  getExecutions: () =>
    fetch(`${API_BASE}/missions/executions`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<MissionExecution[]>>(r)),

  getExecution: (id: string) =>
    fetch(`${API_BASE}/missions/executions/${id}`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<MissionExecution>>(r)),

  calculateSuccess: (id: string, spyIds: string[]) =>
    fetch(`${API_BASE}/missions/${id}/calculate`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ spyIds })
    }).then(r => handleResponse<ApiResponse<{ successRate: number }>>(r)),

  accept: (id: string, spyIds: string[]) =>
    fetch(`${API_BASE}/missions/${id}/accept`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ spyIds })
    }).then(r => handleResponse<ApiResponse<MissionExecution>>(r)),

  handleAction: (executionId: string, eventId: string, action: MissionActionRequest['action']) =>
    fetch(`${API_BASE}/missions/${executionId}/events/${eventId}/action`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action })
    }).then(r => handleResponse<ApiResponse<any>>(r))
};

export const marketAPI = {
  getListings: () =>
    fetch(`${API_BASE}/market/listings`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<MarketListing[]>>(r)),

  getPriceSuggestion: (rarity: string) =>
    fetch(`${API_BASE}/market/price-suggestion/${rarity}`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<[number, number]>>(r)),

  createListing: (data: CreateListingRequest) =>
    fetch(`${API_BASE}/market/listings`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<ApiResponse<MarketListing>>(r)),

  buy: (id: string) =>
    fetch(`${API_BASE}/market/listings/${id}/buy`, {
      method: 'POST',
      headers: headers()
    }).then(r => handleResponse<ApiResponse<any>>(r)),

  cancel: (id: string) =>
    fetch(`${API_BASE}/market/listings/${id}`, {
      method: 'DELETE',
      headers: headers()
    }).then(r => handleResponse<ApiResponse<boolean>>(r)),

  getScrolls: () =>
    fetch(`${API_BASE}/market/scrolls`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<IntelScroll[]>>(r))
};

export const guildAPI = {
  getMyGuild: () =>
    fetch(`${API_BASE}/guild`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Guild>>(r)),

  donate: (buildingId: string, data: DonateMaterialRequest) =>
    fetch(`${API_BASE}/guild/buildings/${buildingId}/donate`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(r => handleResponse<ApiResponse<Building>>(r)),

  upgrade: (buildingId: string) =>
    fetch(`${API_BASE}/guild/buildings/${buildingId}/upgrade`, {
      method: 'POST',
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Building>>(r))
};

export const reportAPI = {
  getWeekly: () =>
    fetch(`${API_BASE}/reports/weekly`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<WeeklyReport>>(r)),

  getRankings: (type: RankingType) =>
    fetch(`${API_BASE}/reports/rankings/${type}`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<RankingEntry[]>>(r)),

  getAnnouncements: () =>
    fetch(`${API_BASE}/reports/announcements`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<Announcement[]>>(r)),

  exportPDF: () =>
    fetch(`${API_BASE}/reports/export`, {
      headers: headers()
    }).then(r => handleResponse<ApiResponse<{ report: string }>>(r))
};
