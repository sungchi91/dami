export interface VirtualSet {
  id: string;
  label: string;
  description: string;
}

export interface AssetType {
  id: string;
  label: string;
  description: string;
  promptTemplate: string;
}

export interface AppConfig {
  assetTypes: AssetType[];
  virtualSets: VirtualSet[];
}

export interface GenerateRequest {
  subject: string;
  assetTier: string;
  virtualSet: string;
  textureFidelity: number;
  productImageBase64?: string;
  productImageMimeType?: string;
}

export interface GenerateResponse {
  imageBase64: string;
  mimeType: string;
  promptUsed: string;
}

export interface AdjustResponse {
  imageBase64: string;
  mimeType: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  assetTier: string;
  virtualSet: string;
  subject: string;
  textureFidelity: number;
  promptUsed: string;
  filePath: string;
}

export interface FormValues {
  subject: string;
  assetTier: string;
  virtualSet: string;
  textureFidelity: number;
  productImageBase64?: string;
  productImageMimeType?: string;
}

export interface StagingImage {
  imageBase64: string;
  mimeType: string;
  promptUsed: string;
}
