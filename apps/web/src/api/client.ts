import type {
  CreatePlotInput,
  UpdatePlotInput,
  CreateBedInput,
  UpdateBedInput,
} from '@allotment/domain';

// Use environment variable in production, fallback to /api for local dev with proxy
const API_BASE =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : '/api');

interface PlotResponse {
  id: string;
  name: string;
  units: string;
  boundaryType: string;
  boundary: { width: number; height: number };
  createdAt: string;
  updatedAt: string;
  beds: BedResponse[];
}

interface BedResponse {
  id: string;
  plotId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Plot endpoints
export async function fetchPlots(): Promise<PlotResponse[]> {
  return request('/plots');
}

export async function fetchPlot(id: string): Promise<PlotResponse> {
  return request(`/plots/${id}`);
}

export async function createPlot(data: CreatePlotInput): Promise<PlotResponse> {
  return request('/plots', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePlot(
  id: string,
  data: UpdatePlotInput
): Promise<PlotResponse> {
  return request(`/plots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePlot(id: string): Promise<void> {
  return request(`/plots/${id}`, {
    method: 'DELETE',
  });
}

// Bed endpoints
export async function createBed(
  plotId: string,
  data: CreateBedInput
): Promise<BedResponse> {
  return request(`/plots/${plotId}/beds`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBed(
  id: string,
  data: UpdateBedInput
): Promise<BedResponse> {
  return request(`/beds/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBed(id: string): Promise<void> {
  return request(`/beds/${id}`, {
    method: 'DELETE',
  });
}
