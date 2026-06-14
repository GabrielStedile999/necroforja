import { describe, it, expect } from "vitest";
import {
  phaseForCycle,
  nextCycleState,
  challengeOrder,
  scenarioForRoll,
  controlWinner,
  roll2d6,
  TOTAL_CYCLES,
} from "@/lib/campaign-rules";

describe("phaseForCycle", () => {
  it("mapeia ciclos para fases (1-3 GD, 4 Downtime, 5-7 Spark)", () => {
    expect(phaseForCycle(1)).toBe("great_darkness");
    expect(phaseForCycle(3)).toBe("great_darkness");
    expect(phaseForCycle(4)).toBe("downtime");
    expect(phaseForCycle(5)).toBe("spark_of_rebellion");
    expect(phaseForCycle(7)).toBe("spark_of_rebellion");
  });
});

describe("nextCycleState", () => {
  it("avança do ciclo 3 (GD) para 4 (Downtime)", () => {
    expect(nextCycleState(3)).toEqual({
      cycle: 4,
      phase: "downtime",
      finished: false,
    });
  });
  it("não passa do último ciclo e marca finished", () => {
    const r = nextCycleState(TOTAL_CYCLES);
    expect(r.cycle).toBe(TOTAL_CYCLES);
    expect(r.finished).toBe(true);
  });
});

describe("challengeOrder", () => {
  it("ordena ascendente por rating (menor desafia primeiro)", () => {
    const ordered = challengeOrder([
      { id: "a", rating: 445 },
      { id: "b", rating: 310 },
      { id: "c", rating: 390 },
    ]);
    expect(ordered.map((g) => g.id)).toEqual(["b", "c", "a"]);
  });
});

describe("scenarioForRoll", () => {
  it("usa o 1º cenário do par na Great Darkness e o 2º na Spark", () => {
    expect(scenarioForRoll(4, "great_darkness")).toBe(
      "Fall of Badzones Outpost",
    );
    expect(scenarioForRoll(4, "spark_of_rebellion")).toBe("Parley Showdown");
    expect(scenarioForRoll(6, "great_darkness")).toBe("Gunk War");
    expect(scenarioForRoll(8, "spark_of_rebellion")).toBe("Street Fight");
  });
  it("extremos delegam a escolha por nº de Sympathisers", () => {
    expect(scenarioForRoll(2, "great_darkness")).toMatch(/MAIS/);
    expect(scenarioForRoll(12, "great_darkness")).toMatch(/MENOS/);
  });
});

describe("controlWinner", () => {
  it("vitória/recusa do desafiante → desafiante", () => {
    expect(controlWinner("challenger_win", "A", "B")).toBe("A");
    expect(controlWinner("declined", "A", "B")).toBe("A");
  });
  it("vitória do defensor → defensor; empate → ninguém", () => {
    expect(controlWinner("challenged_win", "A", "B")).toBe("B");
    expect(controlWinner("draw", "A", "B")).toBeNull();
  });
});

describe("roll2d6", () => {
  it("fica entre 2 e 12", () => {
    for (let i = 0; i < 200; i++) {
      const r = roll2d6();
      expect(r).toBeGreaterThanOrEqual(2);
      expect(r).toBeLessThanOrEqual(12);
    }
  });
  it("é determinístico com rng fixo", () => {
    expect(roll2d6(() => 0)).toBe(2);
    expect(roll2d6(() => 0.999)).toBe(12);
  });
});
