export type ActiveTab = "group" | "facilitator" | "quiet";

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
  senderId: number;
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
