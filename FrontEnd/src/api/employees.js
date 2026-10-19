import { apiFetch } from "./client";

export async function getEmployees() {
  return apiFetch("/employees");
}
