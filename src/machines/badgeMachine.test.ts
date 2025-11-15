import { createActor } from "xstate";
import badgeMachine from "./badgeMachine";
import type { Badge, BadgeProgress } from "../models/Badge";
import { BadgeType, BadgeCategory } from "../models/Badge";
import { vi } from "vitest";

vi.mock("#/core/Orchestrator", () => ({
  orchestrator: {
    sendToMachine: vi.fn(),
  },
}));

vi.mock("../service/badge-service.service", () => ({
  BadgeService: {
    calculateBadgeStats: vi.fn(() => ({
      totalBadges: 1,
      earnedBadges: 1,
      progressBadges: 0,
    })),
    evaluateUserBadges: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("BadgeMachine", () => {
  it("should initialize with default context", () => {
    const actor = createActor(badgeMachine);
    actor.start();

    const context = actor.getSnapshot().context;
    expect(context.badges).toEqual([]);
    expect(context.progress).toEqual([]);
    expect(context.isEvaluating).toBe(false);
    expect(context.evaluationError).toBeNull();
  });

  it("should handle DATA_LOADED event", () => {
    const actor = createActor(badgeMachine);
    actor.start();

    const mockBadges: Badge[] = [
      {
        id: "1",
        doctorId: "doctor1",
        badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
        earnedAt: "2023-01-01T00:00:00Z",
        isActive: true,
        lastEvaluatedAt: "2023-01-01T00:00:00Z"
      }
    ];

    const mockProgress: BadgeProgress[] = [
      {
        badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
        badgeName: "Test Badge",
        category: BadgeCategory.QUALITY_OF_CARE,
        rarity: "RARE",
        description: "Test Description",
        icon: "🏆",
        color: "#4CAF50",
        criteria: "Test criteria",
        earned: false,
        progressPercentage: 50,
        statusMessage: "Test Status"
      }
    ];

    actor.send({ type: "DATA_LOADED", userBadges: mockBadges, userBadgeProgress: mockProgress });

    const context = actor.getSnapshot().context;
    expect(context.badges).toEqual(mockBadges);
    expect(context.progress).toEqual(mockProgress);
  });

  it("should reset data on SET_AUTH when userRole changes", () => {
    const actor = createActor(badgeMachine);
    actor.start();

  
    actor.send({
      type: "SET_AUTH",
      accessToken: "token1",
      userId: "user1",
      userRole: "DOCTOR"
    });

  
    const mockBadges: Badge[] = [{
      id: "1",
      doctorId: "doctor1",
      badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
      earnedAt: "2023-01-01T00:00:00Z",
      isActive: true,
      lastEvaluatedAt: "2023-01-01T00:00:00Z"
    }];
    actor.send({ type: "DATA_LOADED", userBadges: mockBadges, userBadgeProgress: [] });

    let context = actor.getSnapshot().context;
    expect(context.badges).toEqual(mockBadges);

  
    actor.send({
      type: "SET_AUTH",
      accessToken: "token2",
      userId: "user2",
      userRole: "PATIENT"
    });

    context = actor.getSnapshot().context;
    expect(context.badges).toEqual([]);
    expect(context.progress).toEqual([]);
  });

  it("should handle evaluation flow", () => {
    const actor = createActor(badgeMachine);
    actor.start();

  
    actor.send({
      type: "SET_AUTH",
      accessToken: "token",
      userId: "user",
      userRole: "PATIENT"
    });

  
    actor.send({ type: "EVALUATE_BADGES" });

    const context = actor.getSnapshot().context;
    expect(context.isEvaluating).toBe(true);
    expect(context.evaluationError).toBeNull();
  });

  it("should handle RESET event", () => {
    const actor = createActor(badgeMachine);
    actor.start();

  
    const mockBadges: Badge[] = [{
      id: "1",
      doctorId: "doctor1",
      badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
      earnedAt: "2023-01-01T00:00:00Z",
      isActive: true,
      lastEvaluatedAt: "2023-01-01T00:00:00Z"
    }];
    actor.send({ type: "DATA_LOADED", userBadges: mockBadges, userBadgeProgress: [] });

  
    actor.send({ type: "RESET" });

    const context = actor.getSnapshot().context;
    expect(context.badges).toEqual([]);
    expect(context.progress).toEqual([]);
    expect(context.isEvaluating).toBe(false);
    expect(context.evaluationError).toBeNull();
  });
});