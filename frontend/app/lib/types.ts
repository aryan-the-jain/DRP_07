export type ActiveTab = "group" | "facilitator" | "quiet";

export type SupportGroup = {
  name: string;
  day: string;
  time: string;
  scheduledDurationMinutes: number;
};

export type Participant = {
  id: number;
  groupId: number;
  displayName: string;
  initials: string;
  aboutMe: string;
  funFact: string;
  role: string;
  createdAt: string;
};

export type GroupMessage = {
  id: number;
  groupId: number;
  senderName: string;
  senderRole: string;
  body: string;
  messageType: string;
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
