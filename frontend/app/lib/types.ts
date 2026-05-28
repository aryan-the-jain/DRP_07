export type ActiveTab = "group" | "facilitator" | "quiet";

export type SupportGroup = {
  id: number;
  name: string;
  facilitatorName: string;
  scheduledDurationMinutes: number;
  createdAt: string;
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
};
