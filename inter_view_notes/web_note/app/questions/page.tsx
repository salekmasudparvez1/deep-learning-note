import { currentUser } from "@/lib/auth";
import { QuestionsPanel } from "@/components/questions-panel";
import { redirect } from "next/navigation";
export default async function QuestionsPage() { if (!(await currentUser())) redirect("/auth"); return <div className="wrap"><QuestionsPanel /></div>; }
