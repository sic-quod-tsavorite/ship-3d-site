export interface Vessel {
  _id: string;
  name: string;
  description: string;
  image: string;
  object: string;
  category: string;
}

export interface VesselFormData {
  name: string;
  description: string;
  imageFile: File | null;
  objectFile: File | null;
  category: string;
}

export interface VesselUpdateData extends VesselFormData {
  _id: string;
}

export interface VesselResponse {
  vessel?: Vessel;
  vessels?: Vessel[];
  message?: string;
}

export interface VesselErrorResponse {
  error: string;
  message?: string;
}
