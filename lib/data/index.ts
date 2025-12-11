import healthFactsData from "./healthFacts.json";
import milestonesData from "./milestones.json";
import motivationalQuotesData from "./motivationalQuotes.json";
import type { HealthFact, Milestone, MotivationalQuote } from "./types";

export const healthFacts: HealthFact[] = healthFactsData;
export const milestones: Milestone[] = milestonesData;
export const motivationalQuotes: MotivationalQuote[] = motivationalQuotesData;

export type { HealthFact, Milestone, MotivationalQuote };

export const getRandomHealthFact = (): HealthFact => {
  return healthFacts[Math.floor(Math.random() * healthFacts.length)];
};

export const getRandomQuote = (): MotivationalQuote => {
  return motivationalQuotes[
    Math.floor(Math.random() * motivationalQuotes.length)
  ];
};

export const getMilestonesByType = (type: string): Milestone[] => {
  return milestones.filter((milestone) => milestone.type === type);
};
