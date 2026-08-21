export type UserInfo = {
  name: string;
  avatar?: string;
};

export type Activity = {
  _id: string;
  action:
  | "login"
  | "create"
  | "update"
  | "delete"
  | "restore";
  description?: string;
  createdAt?: string;
  admin?: UserInfo;
  targetUser?: UserInfo;
};

export type ActionFilter = "all" | Activity["action"];