import {
  Doodle,
  GroupMessage,
  MeditationPlaylist,
  Participant,
  ReflectionResponse,
  SupportGroup,
  SupportLink,
} from "./types";

export const groupId = 1;
export const participantId = 1;
export const fallbackApiUrl = "http://localhost:9000";

function sortMessages(messages: GroupMessage[]) {
  return [...messages].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime() || first.id - second.id,
  );
}

export async function fetchGroup(apiUrl: string): Promise<SupportGroup> {
  const response = await fetch(`${apiUrl}/groups/${groupId}`);

  if (!response.ok) {
    throw new Error("Could not load Friday Group.");
  }

  return response.json();
}

export async function fetchParticipants(apiUrl: string): Promise<Participant[]> {
  const response = await fetch(`${apiUrl}/groups/${groupId}/participants`);

  if (!response.ok) {
    throw new Error("Could not load Friday Group.");
  }

  return response.json();
}

export async function fetchGroupMessages(apiUrl: string): Promise<GroupMessage[]> {
  const response = await fetch(`${apiUrl}/groups/${groupId}/messages`);

  if (!response.ok) {
    throw new Error("Could not load messages.");
  }

  return sortMessages(await response.json());
}

type FacilitatorMessageResponse = {
  fromId: number;
  toId: number;
  body: string;
  createdAt: string;
};

export async function fetchFacilitatorMessages(
  apiUrl: string,
): Promise<GroupMessage[]> {
  const response = await fetch(
    `${apiUrl}/groups/${groupId}/${participantId}/facilitator-messages`,
  );

  if (!response.ok) {
    throw new Error("Could not load private messages.");
  }

  // The facilitator endpoint returns { fromId, toId, body, createdAt }; map the
  // sender (fromId) onto `id` so it matches the shape MessageList expects.
  const messages = (await response.json()) as FacilitatorMessageResponse[];
  return sortMessages(
    messages.map(({ fromId, body, createdAt }) => ({
      id: fromId,
      body,
      createdAt,
    })),
  );
}

export async function sendMessage(
  apiUrl: string,
  endpoint: "messages" | "facilitator-messages",
  body: string,
  facilitatorId?: number,
) {
  // The backend expects { participantId, body } for the group chat and
  // { fromId, toId, body } for a private message to the facilitator.
  const payload =
    endpoint === "messages"
      ? { participantId, body }
      : { fromId: participantId, toId: facilitatorId, body };

  const response = await fetch(`${apiUrl}/groups/${groupId}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Could not send message.");
  }
}

export type ReflectionInput = {
  privateNote: string;
  facilitatorNote: string;
  freeWriting: string;
  shareGuided: boolean;
  shareFreeWriting: boolean;
};

/* Upserts the current participant's reflection. The backend stores every
   section and marks guided / free writing as shared independently, so this
   resolves only when the write actually persisted. */
export async function saveReflection(
  apiUrl: string,
  reflection: ReflectionInput,
): Promise<ReflectionResponse> {
  const response = await fetch(`${apiUrl}/groups/${groupId}/reflections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      participantId,
      privateNote: reflection.privateNote || null,
      facilitatorNote: reflection.facilitatorNote || null,
      freeWriting: reflection.freeWriting || null,
      shareGuided: reflection.shareGuided,
      shareFreeWriting: reflection.shareFreeWriting,
    }),
  });

  if (!response.ok) {
    throw new Error(
      "We couldn't save your reflection. Please check your connection and try again.",
    );
  }

  return response.json();
}

export async function fetchSupportLinks(
  apiUrl: string,
): Promise<SupportLink[]> {
  const response = await fetch(`${apiUrl}/groups/${groupId}/support-links`);

  if (!response.ok) {
    throw new Error("Could not load resources.");
  }

  return (await response.json()) as SupportLink[];
}

export async function fetchMeditationPlaylists(
  apiUrl: string,
): Promise<MeditationPlaylist[]> {
  const response = await fetch(
    `${apiUrl}/groups/${groupId}/meditation-playlists`,
  );

  if (!response.ok) {
    throw new Error("Could not load playlists.");
  }

  return (await response.json()) as MeditationPlaylist[];
}

export async function saveDoodle(
  apiUrl: string,
  imageData: string,
  shareWithFacilitator: boolean,
): Promise<Doodle> {
  const response = await fetch(`${apiUrl}/groups/${groupId}/doodles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      participantId,
      imageData,
      sharedWithFacilitator: shareWithFacilitator,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not keep your doodle.");
  }

  return response.json();
}

export async function fetchDoodles(apiUrl: string): Promise<Doodle[]> {
  const response = await fetch(
    `${apiUrl}/groups/${groupId}/participants/${participantId}/doodles`,
  );

  if (!response.ok) {
    throw new Error("Could not load your doodles.");
  }

  return (await response.json()) as Doodle[];
}

export async function fetchLatestReflection(
  apiUrl: string,
): Promise<ReflectionResponse | null> {
  try {
    const response = await fetch(
      `${apiUrl}/groups/${groupId}/participants/${participantId}/reflection`,
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ReflectionResponse | null;
  } catch {
    return null;
  }
}
