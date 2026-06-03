import {
  GroupMessage,
  OnboardingPayload,
  OnboardingResponse,
  Participant,
  ReflectionResponse,
  SupportGroup,
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

export async function saveReflection(
  apiUrl: string,
  privateNote: string,
  facilitatorNote: string,
): Promise<ReflectionResponse> {
  try {
    const response = await fetch(`${apiUrl}/groups/${groupId}/reflections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        privateNote: privateNote || null,
        facilitatorNote: facilitatorNote || null,
      }),
    });

    if (!response.ok) {
      throw new Error(
        "We couldn't save your reflection. Please check your connection and try again.",
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch") {
      throw error;
    }

    throw new Error(
      "We couldn't save your reflection. Please check your connection and try again.",
    );
  }
}

export async function fetchOnboarding(
  apiUrl: string,
): Promise<OnboardingResponse | null> {
  const response = await fetch(
    `${apiUrl}/participants/${participantId}/onboarding`,
  );

  if (!response.ok) {
    throw new Error("Could not load your saved answers.");
  }

  // Backend returns the saved object or JSON null (no prior survey answers).
  return response.json();
}

export async function saveOnboarding(
  apiUrl: string,
  payload: OnboardingPayload,
): Promise<OnboardingResponse> {
  const response = await fetch(
    `${apiUrl}/participants/${participantId}/onboarding`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(
      "We couldn't save your answers just now. Please check your connection and try again.",
    );
  }

  return response.json();
}

export async function shareReflection(apiUrl: string, reflectionId: number) {
  try {
    const response = await fetch(`${apiUrl}/reflections/${reflectionId}/share`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        "We couldn't share this with the facilitator yet.  Your text is still here.",
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch") {
      throw error;
    }

    throw new Error(
      "We couldn't share this with the facilitator yet. Your text is still here.",
    );
  }
}

export async function fetchLatestReflection(
  apiUrl: string,
): Promise<ReflectionResponse | null> {
  try {
    // const response = await fetch(`${apiUrl}/groups/${groupId}/reflections`);
    // if (response.ok) {
    //   return response.json();
    // }
    return null;
  } catch {
    return null;
  }
}
