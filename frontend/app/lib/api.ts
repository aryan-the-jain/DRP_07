import { GroupMessage, Participant, ReflectionResponse, SupportGroup } from "./types";

export const groupId = 1;
export const participantId = 1;
export const fallbackApiUrl = "http://localhost:9000";

/* The group, participant and group-message endpoints return named objects.
   Group messages name the sender's participant id as `id`, so this wire shape
   differs from GroupMessage and is mapped across in the fetch helper. */
type GroupMessageResponse = {
  id: number; // the sender's participant id
  body: string;
  createdAt: string;
};

/* Private messages are still returned as a positional tuple
   [fromId, toId, body, createdAt] rather than an object. */
type FacilitatorMessageTuple = [
  fromId: number,
  toId: number,
  body: string,
  createdAt: string,
];

function sortMessages(messages: GroupMessage[]) {
  return [...messages].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
  );
}

export async function fetchGroup(apiUrl: string): Promise<SupportGroup> {
  const response = await fetch(`${apiUrl}/groups/${groupId}`);

  if (!response.ok) {
    throw new Error("Could not load the group.");
  }

  return (await response.json()) as SupportGroup;
}

export async function fetchParticipants(apiUrl: string): Promise<Participant[]> {
  const response = await fetch(`${apiUrl}/groups/${groupId}/participants`);

  if (!response.ok) {
    throw new Error("Could not load the group.");
  }

  return (await response.json()) as Participant[];
}

export async function fetchGroupMessages(apiUrl: string): Promise<GroupMessage[]> {
  const response = await fetch(`${apiUrl}/groups/${groupId}/messages`);

  if (!response.ok) {
    throw new Error("Could not load messages.");
  }

  const messages = (await response.json()) as GroupMessageResponse[];
  return sortMessages(
    messages.map(({ id, body, createdAt }) => ({
      senderId: id,
      body,
      createdAt,
    })),
  );
}

export async function fetchFacilitatorMessages(
  apiUrl: string,
): Promise<GroupMessage[]> {
  const response = await fetch(
    `${apiUrl}/groups/${groupId}/${participantId}/facilitator-messages`,
  );

  if (!response.ok) {
    throw new Error("Could not load private messages.");
  }

  const tuples = (await response.json()) as FacilitatorMessageTuple[];
  return sortMessages(
    tuples.map(([fromId, , body, createdAt]) => ({
      senderId: fromId,
      body,
      createdAt,
    })),
  );
}

export async function sendGroupMessage(apiUrl: string, body: string) {
  const response = await fetch(`${apiUrl}/groups/${groupId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ participantId, body }),
  });

  if (!response.ok) {
    throw new Error("Could not send message.");
  }
}

export async function sendFacilitatorMessage(
  apiUrl: string,
  facilitatorId: number,
  body: string,
) {
  const response = await fetch(
    `${apiUrl}/groups/${groupId}/facilitator-messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fromId: participantId, toId: facilitatorId, body }),
    },
  );

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
