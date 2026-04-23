import axios from 'axios';
import type {
  AppConfig,
  GenerateRequest,
  GenerateResponse,
  AdjustResponse,
  HistoryEntry,
  StagingImage,
} from '../types';

const http = axios.create({ baseURL: '/api' });

export async function fetchConfig(): Promise<AppConfig> {
  const { data } = await http.get<AppConfig>('/config');
  return data;
}

export async function generateImage(req: GenerateRequest): Promise<GenerateResponse> {
  const { data } = await http.post<GenerateResponse>('/generate', req);
  return data;
}

export async function adjustImage(
  current: StagingImage,
  adjustment: string,
): Promise<AdjustResponse> {
  const { data } = await http.post<AdjustResponse>('/adjust', {
    imageBase64: current.imageBase64,
    mimeType: current.mimeType,
    adjustment,
  });
  return data;
}

export async function approveImage(
  image: StagingImage,
  formValues: GenerateRequest,
): Promise<HistoryEntry> {
  const { data } = await http.post<HistoryEntry>('/approve', {
    imageBase64: image.imageBase64,
    mimeType: image.mimeType,
    subject: formValues.subject,
    assetTier: formValues.assetTier,
    virtualSet: formValues.virtualSet,
    textureFidelity: formValues.textureFidelity,
    promptUsed: image.promptUsed,
  });
  return data;
}

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const { data } = await http.get<HistoryEntry[]>('/history');
  return data;
}
