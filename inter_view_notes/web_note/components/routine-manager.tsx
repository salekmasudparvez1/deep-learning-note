"use client";

import type { RoutineGroup, RoutineTopic } from "./admin-types";
import { GroupManager } from "./group-manager";
import { TopicManager } from "./topic-manager";

export function RoutineManager({
  groups,
  topics,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onCreateTopic,
  onUpdateTopic,
  onDeleteTopic,
}: {
  groups: RoutineGroup[];
  topics: RoutineTopic[];
  onCreateGroup: (data: Partial<RoutineGroup>) => void;
  onUpdateGroup: (id: string, data: Partial<RoutineGroup>) => void;
  onDeleteGroup: (id: string) => void;
  onCreateTopic: (data: Partial<RoutineTopic>) => void;
  onUpdateTopic: (id: string, data: Partial<RoutineTopic>) => void;
  onDeleteTopic: (id: string) => void;
}) {
  return (
    <div className="routine-manager">
      <GroupManager
        groups={groups}
        onCreate={onCreateGroup}
        onUpdate={onUpdateGroup}
        onDelete={onDeleteGroup}
      />
      <TopicManager
        groups={groups}
        topics={topics}
        onCreate={onCreateTopic}
        onUpdate={onUpdateTopic}
        onDelete={onDeleteTopic}
      />
    </div>
  );
}
