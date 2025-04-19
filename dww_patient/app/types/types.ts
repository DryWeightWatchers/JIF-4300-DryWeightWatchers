export type Role = 'patient' | 'provider';

export type Weight_Unit = 'imperial' | 'metric';

export interface User {
  id: number; // assuming your API/serializer includes the primary key
  first_name: string;
  last_name: string;
  phone?: string | null;
  email: string;
  shareable_id?: string | null;
  role: Role;
  //unit_preference?: Weight_Unit //for after unit pref PR goes thru
  verification_token?: string | null;
  is_verified: boolean;
}

export interface Provider extends User {
    shareable_id: string;
    role: 'provider';
}

export interface Patient extends User {
    //TODO: Currently, these two interfaces only extend because shareable_id should not be contained in User in dww_backend/models.py
    //  Obviously, this is because only providers have a shareable_id. This should be moved to another model and stored in a separate table.
    //  Until then, the Provider interface is a band-aid fix to assist in correct strict typings, as TypeScript cries murder if we suggest that
    //  shareable_id can be null.
    //  Depending on how this is fixed, all screens should either exclusively import User or exclusively import Provider/Patient.

    //  Affected screens include: ProviderList.tsx
}