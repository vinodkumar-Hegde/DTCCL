
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

export const analyzeClinicalCaseMultiModal = async (files: { base64: string; mimeType: string }[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const parts = files.map(f => ({
      inlineData: {
        data: f.base64,
        mimeType: f.mimeType
      }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          ...parts,
          {
            text: `Perform a Comprehensive Clinical Audit of these medical documents and images. 
            Your goal is a ZERO-LOSS extraction. Capture every vital sign, laboratory value, and clinical observation.
            
            EXTRACT THE FOLLOWING:
            1. Patient Profile: Age, Gender. (CRITICAL: Anonymize all summaries. Replace actual patient names with "the patient" or "the subject").
            2. Categorization: Based on content, identify the primary medical specialty (Medicine, Surgery, Pediatrics, ENT, OBG).
            3. Super Speciality: Identify the specific sub-specialty (e.g., Cardiology, Nephrology).
            4. Disease Identification: The specific clinical diagnosis or provisional condition.
            5. In-depth Narrative: A full summary of the clinical journey. (Highlight key medical terms, diagnoses, and critical values using **bold**).
            6. Clinical Context: A concise, point-wise summary of the patient's previous health history and context. (Return as a bulleted list using '-' for each point).
            7. Lab Ledger: Every single test result found across ALL documents and images. 
               (CRITICAL: Many lab reports are uploaded as IMAGES or mentioned in text. You MUST perform deep OCR and text extraction to capture Parameter, Value, Unit, Specimen, Biological References, and Method). 
               (CRITICAL: If Specimen, Ref. Range, or Method are not explicitly mentioned, you MUST provide a professional guess based on medical standards and append "(AI Guess)" to the value).
               (CRITICAL: For 'status', determine if the result is 'Normal', 'High', or 'Low' based on the result and reference range).
            8. Longitudinal Progress: Daily notes or chronological events.
            8. AI Clinical Reasoning: Your professional analysis of the case complexity and potential missed diagnostic indicators. (Highlight key insights using **bold**).
            9. Flowchart Data: Generate a logical sequence of the clinical journey (Symptoms -> Tests -> Diagnosis -> Treatment).
            
            Strictly follow the provided JSON schema. Ensure the JSON is complete and valid. Do not truncate the output.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 65536, // Significantly increase limit to prevent truncation
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, // Use low thinking for faster extraction
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            age: { type: Type.NUMBER },
            gender: { type: Type.STRING },
            subject: { 
              type: Type.STRING, 
              description: "Must be one of: Medicine, Surgery, Pediatrics, ENT, OBG" 
            },
            superSpeciality: { type: Type.STRING },
            diseaseName: { type: Type.STRING },
            provisionalDiagnosis: { type: Type.STRING },
            finalDiagnosis: { type: Type.STRING },
            clinicalHistorySummary: { type: Type.STRING },
            inPatientRecordSummary: { type: Type.STRING },
            deepAnalysisReasoning: { type: Type.STRING },
            investigations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  testName: { type: Type.STRING },
                  result: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  specimen: { type: Type.STRING },
                  biologicalReferences: { type: Type.STRING },
                  method: { type: Type.STRING }
                },
                required: ["testName", "result"]
              }
            },
            progress: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  date: { type: Type.STRING },
                  vitals: { type: Type.STRING },
                  medicines: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  fluids: { type: Type.STRING },
                  testResults: { type: Type.STRING },
                  clinicalProgress: { type: Type.STRING }
                }
              }
            },
            flowchart: {
              type: Type.OBJECT,
              properties: {
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["symptom", "test", "diagnosis", "treatment"] }
                    }
                  }
                },
                edges: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      label: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          required: ["diseaseName", "subject", "inPatientRecordSummary", "deepAnalysisReasoning", "flowchart"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.warn("Initial JSON parse failed in Multi-Modal Audit, attempting repair:", parseError);
      // Basic repair for truncated JSON: try to close open strings and braces
      let repairedText = text;
      // If it ends in the middle of a string, close it
      if (repairedText.lastIndexOf('"') > repairedText.lastIndexOf('}')) {
        repairedText += '"}';
      }
      // Add missing closing braces/brackets
      const openBraces = (repairedText.match(/\{/g) || []).length;
      const closeBraces = (repairedText.match(/\}/g) || []).length;
      const openBrackets = (repairedText.match(/\[/g) || []).length;
      const closeBrackets = (repairedText.match(/\]/g) || []).length;
      
      for (let i = 0; i < openBrackets - closeBrackets; i++) repairedText += ']';
      for (let i = 0; i < openBraces - closeBraces; i++) repairedText += '}';
      
      try {
        return JSON.parse(repairedText);
      } catch (secondError) {
        console.error("JSON repair failed for Multi-Modal Audit:", secondError);
        throw parseError;
      }
    }
  } catch (error) {
    console.error("Multi-Modal Audit Extraction Failed:", error);
    return null;
  }
};

export const queryCaseSheet = async (clinicalCase: any, query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Strip base64 image data to avoid exceeding token limits
    const clinicalCaseForAi = JSON.parse(JSON.stringify(clinicalCase));
    if (clinicalCaseForAi.intensiveData?.imaging?.images) {
      clinicalCaseForAi.intensiveData.imaging.images = clinicalCaseForAi.intensiveData.imaging.images.map((img: any) => {
        const { imageUrl, ...rest } = img;
        return { ...rest, hasImage: !!imageUrl };
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: `You are a clinical data extractor. Use the following case data to answer the user's question precisely.
            If the information is not in the data, say "Information not found in case sheet."
            
            CASE DATA:
            ${JSON.stringify(clinicalCaseForAi)}
            
            USER QUESTION:
            ${query}`
          }
        ]
      },
      config: {}
    });
    return response.text;
  } catch (error) {
    console.error("Dynamic Query Failed:", error);
    return "Failed to fetch information from case sheet.";
  }
};

export const analyzeMedicalImage = async (base64Data: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Analyze this medical radiograph or artifact. Act as an advanced neural diagnostic engine utilizing Google Gemma and MONAI frameworks. Provide a professional observation of the pathology, its correlation to common clinical patterns, and a confidence score. Be precise and use medical terminology." }
        ]
      },
      config: {}
    });
    return response.text;
  } catch (error) {
    console.error("Imaging Analysis Failed:", error);
    return "Analysis engine timeout. Please check image clarity.";
  }
};

export const validateClinicalData = async (data: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Strip base64 image data to avoid exceeding token limits
    const dataForAi = JSON.parse(JSON.stringify(data));
    if (dataForAi.intensiveData?.imaging?.images) {
      dataForAi.intensiveData.imaging.images = dataForAi.intensiveData.imaging.images.map((img: any) => {
        const { imageUrl, ...rest } = img;
        return { ...rest, hasImage: !!imageUrl };
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: `Act as the Google Health API Clinical Validator. 
            Validate the following clinical data against international medical standards (WHO, ICD-11, HL7).
            Check for:
            1. Data Integrity: Are values within physiological limits?
            2. Clinical Consistency: Do the symptoms match the diagnosis?
            3. Compliance: Is the terminology standard?
            
            Return a JSON object with:
            - status: "Valid", "Warning", or "Invalid"
            - score: 0-100
            - findings: Array of strings explaining the validation results.
            
            DATA:
            ${JSON.stringify(dataForAi)}`
          }
        ]
      },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            score: { type: Type.NUMBER },
            findings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["status", "score", "findings"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Clinical Validation Failed:", error);
    return { status: "Error", score: 0, findings: ["Validation engine unavailable."] };
  }
};

export const generateExamQuestions = async (clinicalCase: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Strip base64 image data to avoid exceeding token limits
    const clinicalCaseForAi = JSON.parse(JSON.stringify(clinicalCase));
    if (clinicalCaseForAi.intensiveData?.imaging?.images) {
      clinicalCaseForAi.intensiveData.imaging.images = clinicalCaseForAi.intensiveData.imaging.images.map((img: any) => {
        const { imageUrl, ...rest } = img;
        return { ...rest, hasImage: !!imageUrl };
      });
    }
    if (clinicalCaseForAi.intensiveData?.imaging?.videos) {
      clinicalCaseForAi.intensiveData.imaging.videos = clinicalCaseForAi.intensiveData.imaging.videos.map((vid: any) => {
        const { videoUrl, ...rest } = vid;
        return { ...rest, hasVideo: !!videoUrl };
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: `Act as a Medical Professor at a top University. Based on the provided clinical case, generate a comprehensive set of exam questions for medical students.
            
            SECTION 1: UNIVERSITY EXAM QUESTIONS
            Generate at least 10-15 questions covering:
            - Pathophysiology
            - Clinical Presentation
            - Differential Diagnosis
            - Diagnostic Investigations (and interpretation of specific values in this case)
            - Management Protocols (Medical and Surgical)
            - Complications and Prognosis
            
            SECTION 2: CASE ANALYSIS FOR PRACTICE
            Generate a simplified case analysis scenario based on this case. 
            Include:
            - A brief "Practice Case" description (slightly modified from the original to test application of knowledge).
            - 3-5 specific analysis questions for the doctor to solve.
            - The correct "Clinical Reasoning" or "Solution" for each analysis question.
            
            Return the response as a JSON object following the schema.`
          },
          {
            text: `CASE DATA: ${JSON.stringify(clinicalCaseForAi)}`
          }
        ]
      },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            section1: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["title", "questions"]
            },
            section2: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                practiceCase: { type: Type.STRING },
                analysisQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      hint: { type: Type.STRING },
                      solution: { type: Type.STRING }
                    },
                    required: ["question", "solution"]
                  }
                }
              },
              required: ["title", "practiceCase", "analysisQuestions"]
            }
          },
          required: ["section1", "section2"]
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Exam Question Generation Failed:", error);
    return null;
  }
};
