
export type Subject = 'Medicine' | 'Surgery' | 'ENT' | 'OBG' | 'Pediatrics';
export type Severity = 'Complicated' | 'Moderate' | 'Normal';

export interface LabResult {
  parameter: string;
  actual: string;
  unit: string;
  status: 'Normal' | 'High' | 'Low';
  specimen?: string;
  biologicalReferences?: string;
  method?: string;
}

export interface ImagingArtifact {
  title: string;
  patientData: string;
  monaiAnalysis: string; // Used for "Neural Highlights"
  imageUrl?: string;
}

export interface VideoArtifact {
  title: string;
  videoUrl: string;
  description?: string;
}

export interface DailyNote {
  day: string;
  date: string;
  vitals: string;
  medicines: string[];
  fluids: string;
  testResults: string;
  clinicalProgress: string;
}

export interface ClinicalCase {
  id: string;
  diseaseName: string;
  subject: Subject;
  superSpeciality: string;
  disease: string;
  severity: Severity;
  createdAt: string;
  patientDetails: {
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    weightKg: number;
    heightCm: number;
  };
  outpatientSummary: string;
  inpatientSummary: string;
  intensiveData: {
    department: string;
    provisionalDiagnosisOnAdmission: string;
    finalDiagnosis: string;
    previousHealthHistory: string; 
    labReports: {
      bmp: LabResult[];
      cbc: LabResult[];
      labImages?: ImagingArtifact[];
    };
    imaging: {
      xray?: ImagingArtifact;
      ct?: ImagingArtifact;
      mri?: ImagingArtifact;
      gallery?: ImagingArtifact[];
      videos?: VideoArtifact[];
    };
    clinicalNotes: DailyNote[];
    flowchart?: {
      nodes: { id: string; label: string; type: 'symptom' | 'test' | 'diagnosis' | 'treatment' }[];
      edges: { from: string; to: string; label?: string }[];
    };
    secondOpinion: {
      missedChecklist: string[];
      suggestions: string;
      confidenceScore: number;
    };
  };
}
