"use client";

import { use } from "react";
import { GroupDetailPage } from "../../components/GroupDetail";

export default function Page({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  return <GroupDetailPage groupId={Number(groupId)} />;
}
