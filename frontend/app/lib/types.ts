export type ActiveTab = "group" | "facilitator" | "quiet";

export type ReflectionShareSelection = {
  guidedAnswers: boolean;
  freeWriting: boolean;
};

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

export type SupportLink = {
  id: number;
  title: string;
  url: string;
  description: string | null;
};

export type ReflectionResponse = {
  id: number;
  groupId: number;
  participantId: number;
  privateNote: string | null;
  facilitatorNote: string | null;
  freeWriting: string | null;
  sharedGuided: boolean;
  sharedGuidedAt: string | null;
  sharedFreeWriting: boolean;
  sharedFreeWritingAt: string | null;
  createdAt: string;
};
