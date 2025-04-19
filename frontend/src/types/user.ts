import { UpdateProfileFormData } from "@/_auth/schema/formSchema";

export interface User {
    _id: string;
    id?: string;
    username: string;
    email: string;
    gender: string;
    isVerified: boolean;
    role?: string; 
    photo: string; 
  }
  
  export interface SignupData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender: string;
  }

  export type VerificationResponse = {
    success: boolean;
    message?: string; // Optional message property
  };
  
  
  export interface LoginData {
    email: string;
    password: string;
  }

  export interface resetPasswordData {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }

  export interface UpdateProfileParams {
    username?: string;
    oldPassword?: string;
    newPassword?: string;
    image?: File | string;
  }

  export interface UpdateProfileResponse {
    user: User;
    message: string;
  }
  

  export interface UserStore {
    user: User | null; 
    success: boolean;
    loading: boolean;
    error: string | null;
    checkingAuth: boolean; 
    attempts: number;
    signup: (data: SignupData) => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    verifyEmail: (token: string) => Promise<VerificationResponse>;
    checkAuth: () => Promise<void>; 
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (data: resetPasswordData) => Promise<void>;
    refreshToken: () => Promise<any>;
    updateProfile: (data: UpdateProfileFormData) => Promise<void>
  }