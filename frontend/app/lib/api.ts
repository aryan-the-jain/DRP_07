import { GroupMessage, Participant, ReflectionResponse, SupportGroup } from "./types";

export const groupId = 1;
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
    throw new Error("Could not load Monday Group.");
  }

  return response.json();
}

export async function fetchParticipants(apiUrl: string): Promise<Participant[]> {
  const response = await fetch(`${apiUrl}/groups/${groupId}/participants`);

  if (!response.ok) {
    throw new Error("Could not load Monday Group.");
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

export async function fetchFacilitatorMessages(
  apiUrl: string,
): Promise<GroupMessage[]> {
  const response = await fetch(
    `${apiUrl}/groups/${groupId}/facilitator-messages`,
  );

  if (!response.ok) {
    throw new Error("Could not load private messages.");
  }

  return sortMessages(await response.json());
}

export async function sendMessage(
  apiUrl: string,
  endpoint: "messages" | "facilitator-messages",
  body: string,
) {
  const response = await fetch(`${apiUrl}/groups/${groupId}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      senderName: "You",
      senderInitials: "Y",
      body,
    }),
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
        "We couldn't share this with the facilitator yet. Your text is still here.",
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
    const response = await fetch(`${apiUrl}/groups/${groupId}/reflections`);
    if (response.ok) {
      return response.json();
    }
    return null;
  } catch {
    return null;
  }
}
