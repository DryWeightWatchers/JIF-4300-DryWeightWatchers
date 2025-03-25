

//// supporting types 

export type WeightRecord = {
    timestamp: Date; 
    weight: number; 
}; 

export type PatientNote = {
    timestamp: Date; 
    note: string; 
}; 

export type PatientInfo = {
    patient?: number;
    height?: string;
    date_of_birth?: string; // optional + string for input binding
    sex?: string;
    medications?: string;
    other_info?: string;
    last_updated?: Date | null;
};



//// types for interacting with Django API 

// add_patient_note View 
export type PatientNoteAPI = {
    patient: number; 
    note_type: string; 
    timestamp: Date; 
    note: string; 
}; 

// add_patient_info View 
export type PatientInfoAPI = Omit<PatientInfo, 'last_updated'>;

// get_patient_data View 
export type Patient = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    latest_weight: number;
    latest_weight_timestamp: Date;
    weight_history?: WeightRecord[];
    notes?: PatientNote[];
    patient_info?: PatientInfo; 
}; 



//// prop types for child components of PatientDetails 

export type PatientInfoSectionProps = {
    patientInfo?: PatientInfo;
    csrfToken: string;
    email: string; 
    latestWeight?: number; 
    weightLastUpdated?: Date; 
}; 

export type PatientNotesSectionProps = {
    selectedDay: Date;
    weightHistory?: WeightRecord[];
    notes?: PatientNote[];
    addNoteText: string;
    setAddNoteText: (text: string) => void;
    handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export type ChartCalendarVizProps = {
    weightHistory: WeightRecord[];
    onDataPointSelect: (day: Date) => void;
}; 