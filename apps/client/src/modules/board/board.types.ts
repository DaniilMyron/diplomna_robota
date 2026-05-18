export type BoardTeam = {
  id: string;
  name: string;
  members: BoardTeamMember[];
  canManageMembership: boolean;
};

export type BoardTeamMember = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};
