import { WeightRecord } from './types'; 


export const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, '');  // remove non-numeric characters
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;  // return as is if formatting fails
};


/**
 * Returns the avg daily change in weight over the last two measurements, if they were within the last week. 
 * Patients are supposed to weigh themselves every day, but they may not. 
 * Server currently ensures the last two returned measurements are at least 1 day apart. 
 */
export const avgDailyWeightChange = (lastWeight: WeightRecord | null, prevWeight: WeightRecord | null) => {
    const dayInMs = 24 * 60 * 60 * 1000 
    const weekInMs = 7 * dayInMs; 
    const now = new Date(); 

    // return null if either record doesn't exist in the past week 
    if (
        lastWeight === null || 
        prevWeight === null || 
        now.getTime() - lastWeight.timestamp.getTime() > weekInMs || 
        now.getTime() - prevWeight.timestamp.getTime() > weekInMs 
    ) { 
        return null; 
    } 

    const diffMs = lastWeight.timestamp.getTime() - prevWeight.timestamp.getTime() 
    if (diffMs <= 0) { return null; } 

    const diffDays = diffMs / dayInMs; 
    const avgChange = (lastWeight.weight - prevWeight.weight) / diffDays 
    return parseFloat(avgChange.toFixed(2));  // round to two decimals 
}