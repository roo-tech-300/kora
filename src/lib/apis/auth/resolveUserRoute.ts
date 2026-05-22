import type { CurrentUserProfile } from "./getCurrentUserProfile";

type ResolvableUser = Pick<CurrentUserProfile, "role" | "status"> | null | undefined;

const normalizeValue = (value?: string | null) => value?.trim().toLowerCase() ?? "";

export const resolveUserRoute = (user: ResolvableUser) => {
  if (!user) {
    return "/login";
  }

  const role = normalizeValue(user.role);
  const status = normalizeValue(user.status);
  const isAdmin = role === "admin";
  const isLecturer = role === "lecturer";
  const isAccepted = status === "accepted";

  if ((isAdmin || isLecturer) && !isAccepted) {
    return "/pending";
  }

  if (isAdmin && isAccepted) {
    return "/admin";
  }

  if (isLecturer && isAccepted) {
    return "/teacher";
  }

  return "/login";
};
