import { supabase } from "./supabase.js";
import { content } from "./content.js";

export async function readRoutine() {
  const [groups, records, topics] = await Promise.all([
    supabase("routine_groups?select=id,title,subtitle,sort_order&order=sort_order.asc"),
    supabase("routine_records?select=task_id,completed,timestamp&order=timestamp.asc"),
    supabase("routine_topics?select=id,group_id,title,hint,sort_order&order=sort_order.asc"),
  ]);
  const topicsByGroup = new Map();
  topics.forEach((topic) => {
    const list = topicsByGroup.get(topic.group_id) || [];
    list.push({ id: topic.id, title: topic.title, hint: topic.hint || "" });
    topicsByGroup.set(topic.group_id, list);
  });
  return {
    ...content,
    routine: {
      heading: "Daily routine",
      subheading: "Check tasks as you complete them. Progress is saved securely in Supabase.",
      groups: groups.map((group) => ({
        id: group.id,
        title: group.title,
        subtitle: group.subtitle || "",
        tasks: topicsByGroup.get(group.id) || [],
      })),
    },
    records: records.map((record) => ({
      taskId: record.task_id,
      completed: record.completed,
      timestamp: record.timestamp,
    })),
  };
}
