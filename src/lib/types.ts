export interface User {
      id: string;
      name: string;
      email: string;
      phone: string;
      country: string;
      avatar?: string;
}

export interface VisaApplication {
      id: string;
      countryCode: string;
      countryName: string;
      status: "draft" | "submitted" | "approved" | "rejected" | "processing" | "cancelled";
      submissionDate: string;
      estimatedDecision: string;
      applicantName: string;
      visaType: string;
      notes?: string;
}

export interface Document {
      id: string;
      name: string;
      type: string;
      size: number;
      uploadDate: string;
      status: "pending" | "verified" | "rejected";
}

export interface Notification {
      id: string;
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "error";
      read: boolean;
      createdAt: string;
      actionUrl?: string;
}

export interface BillingPlan {
      id: string;
      name: string;
      price: number;
      features: string[];
      current: boolean;
}

export interface Transaction {
      id: string;
      description: string;
      amount: number;
      date: string;
      status: "completed" | "pending" | "refunded";
      invoice?: string;
}

export interface RecentActivity {
      id: string;
      action: string;
      details: string;
      timestamp: string;
      icon: string;
}
