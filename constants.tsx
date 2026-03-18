
import React from 'react';
import { ClinicalCase } from './types';

export const MOCK_CASES: ClinicalCase[] = [];

export const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  Medicine: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Surgery: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758L5 19m14-14L5 19" /></svg>,
  ENT: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>,
  OBG: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
  Pediatrics: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
};

export const SUBJECT_HIERARCHY: Record<string, string[]> = {
  Medicine: ['Cardiology', 'Neurology', 'Nephrology', 'Gastroenterology', 'Pulmonology', 'Endocrinology', 'Oncology', 'Rheumatology', 'Hematology', 'Infectious Diseases'],
  Surgery: ['General Surgery', 'Neurosurgery', 'Plastic Surgery', 'Cardiothoracic Surgery', 'Urology', 'Pediatric Surgery', 'Surgical Oncology', 'Vascular Surgery'],
  ENT: ['Otology', 'Rhinology', 'Laryngology', 'Head and Neck Surgery', 'Pediatric Otolaryngology'],
  OBG: ['Obstetrics', 'Gynecology', 'Reproductive Endocrinology', 'Gynecologic Oncology', 'Maternal-Fetal Medicine'],
  Pediatrics: ['Neonatology', 'Pediatric Cardiology', 'Pediatric Neurology', 'Pediatric Nephrology', 'Pediatric Gastroenterology'],
};
