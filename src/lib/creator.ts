export type CreatorBadge = {
  key: string;
  label: string;
  description: string;
};

/**
 * Every badge here is derived from real, checkable account state — nothing
 * is manually granted or fabricated. If a signal isn't backed by real data
 * yet (e.g. identity verification), it isn't represented as a badge.
 */
export function computeCreatorBadges(input: {
  emailVerified: boolean;
  isFoundingMember: boolean;
  listedProjectCount: number;
  reviewCount: number;
  averageRating: number | null;
  articleCount: number;
  followerCount: number;
}): CreatorBadge[] {
  const badges: CreatorBadge[] = [];

  if (input.emailVerified) {
    badges.push({
      key: "verified",
      label: "Verified",
      description: "This creator has confirmed their email address.",
    });
  }

  if (input.isFoundingMember) {
    badges.push({
      key: "founding-member",
      label: "Founding member",
      description: "Joined Forge through an early invite.",
    });
  }

  if (input.listedProjectCount >= 3) {
    badges.push({
      key: "prolific-publisher",
      label: "Prolific publisher",
      description: `Has listed ${input.listedProjectCount} projects in the marketplace.`,
    });
  }

  if (input.averageRating !== null && input.averageRating >= 4.5 && input.reviewCount >= 3) {
    badges.push({
      key: "top-rated",
      label: "Top rated",
      description: `Averages ${input.averageRating.toFixed(1)} stars across ${input.reviewCount} reviews.`,
    });
  }

  if (input.articleCount >= 1) {
    badges.push({
      key: "community-mentor",
      label: "Community mentor",
      description: "Has published a guide in the Library to help other builders.",
    });
  }

  if (input.followerCount >= 10) {
    badges.push({
      key: "rising-creator",
      label: "Rising creator",
      description: `Followed by ${input.followerCount} builders.`,
    });
  }

  return badges;
}

export const REPORT_REASONS = [
  "Spam or scam",
  "Inappropriate content",
  "Intellectual property concern",
  "Impersonation",
  "Something else",
];
