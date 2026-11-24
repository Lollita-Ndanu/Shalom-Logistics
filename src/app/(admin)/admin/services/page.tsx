import type { Metadata } from "next";
import AdminRoute from "../AdminRoute";
export const metadata: Metadata = { title: "Services | Admin Panel | Shalom Logistics" };
export default function Page() { return <AdminRoute page="Services" />; }
