import type { Metadata } from "next";
import AdminRoute from "../AdminRoute";
export const metadata: Metadata = { title: "Subscribers | Admin Panel | Shalom Logistics" };
export default function Page() { return <AdminRoute page="Subscribers" />; }
