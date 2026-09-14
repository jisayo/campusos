// Shared types — imported by apps/web and (future) apps/mobile.
// Keeping these in one package is what lets web and mobile stay in sync
// on the RBAC model without duplicating logic (see docs/ARCHITECTURE.md).

export type RoleType = 'student' | 'rep' | 'lecturer' | 'adviser' | 'admin';

export type OrgNodeType =
  | 'university'
  | 'faculty'
  | 'department'
  | 'programme'
  | 'level'
  | 'course_group'
  | 'club';

export interface OrgNode {
  id: string;
  universityId: string;
  parentId: string | null;
  type: OrgNodeType;
  name: string;
}

export interface Role {
  id: string;
  userId: string;
  scopeOrgNodeId: string | null; // null = tenant-wide
  roleType: RoleType;
}

export interface OrgMembership {
  id: string;
  userId: string;
  orgNodeId: string;
  relationship: 'enrolled' | 'staff' | 'advisee' | 'rep';
  term: string | null;
  status: 'active' | 'past';
}

// Resolved once per request (or cached) — this is what `can()` operates on.
export interface AuthContext {
  userId: string;
  universityId: string;
  status: 'pending' | 'active' | 'suspended';
  roles: Role[];
  memberships: OrgMembership[];
}

// Actions are the vocabulary `can()` is checked against. Keep this list
// explicit and centralized rather than inventing string permissions ad hoc.
export type Action =
  | 'community.post.create'
  | 'community.post.moderate'
  | 'course.resource.manage'
  | 'course.assignment.manage'
  | 'course.announcement.publish'
  | 'user.suspend'
  | 'user.role.manage'
  | 'org.structure.manage'
  | 'report.review';

export const ROLES_GRANTING: Record<Action, RoleType[]> = {
  'community.post.create': ['student', 'rep', 'lecturer', 'adviser', 'admin'],
  'community.post.moderate': ['rep', 'admin'],
  'course.resource.manage': ['lecturer', 'admin'],
  'course.assignment.manage': ['lecturer', 'admin'],
  'course.announcement.publish': ['lecturer', 'admin'],
  'user.suspend': ['admin'],
  'user.role.manage': ['admin'],
  'org.structure.manage': ['admin'],
  'report.review': ['admin'],
};
