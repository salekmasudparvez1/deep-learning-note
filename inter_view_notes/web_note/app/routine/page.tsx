import { currentUser } from "@/lib/auth";
import { RoutinePanel } from "@/components/routine-panel";
import { redirect } from "next/navigation";
export default async function RoutinePage() { if (!(await currentUser())) redirect("/auth"); return <div className="wrap"><RoutinePanel /></div>; }
