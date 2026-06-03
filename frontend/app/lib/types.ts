export enum ActiveTab {
  Group = "group",
  Facilitator = "facilitator",
  Quiet = "quiet",
}

export type SupportGroup = {
  name: string;
  facilitatorName: string;
  scheduledDurationMinutes: number;
};

export type Participant = {
  id: number;
  displayName: string;
  initials: string;
  country: string;
  aboutMe: string;
  funFact: string;
  role: string;
};

export type GroupMessage = {
  id: number;
  body: string;
  createdAt: string;
};

export type ReflectionResponse = {
  id: number;
  groupId: number;
  privateNote: string | null;
  facilitatorNote: string | null;
  sharedWithFacilitator: boolean;
  createdAt: string;
  sharedAt: string | null;
};

export enum OnboardingStatus {
  Draft = "draft",
  Complete = "complete",
}

export type OnboardingPayload = {
  callName: string;
  pronouns: string | null;
  age: number | null;
  funFact: string;
  hobbies: string | null;
  culturalBackground: string | null;
  griefRecency: string | null;
  whoLost: string | null;
  status: OnboardingStatus;
};

// Mirrors the backend `ReturnOnboarding`. `hobbies` is a JSON-encoded string[].
export type OnboardingResponse = { participantId: number } & OnboardingPayload;
