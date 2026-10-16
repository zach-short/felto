import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";

import { gradeRow, handRow, labelOf, type Grade, type KeyRow } from "./grade";
import { gtoKey, type GtoAction } from "./key";

// Rows written out by hand (rule Q3, PLAN.md phase 6, step 3): the grade of each is worked here
// from the dials of E1 and Zach's answers of board item 41, never read from the grader's output.
const REACHED = { reach: 0.12, handReach: 0.0045 };
const FOLD_CALL_3BET: GtoAction[] = ["fold", "call", "3bet"];

function row(strategy: number[], ev: number[], at: Partial<KeyRow> = {}): KeyRow {
  return { actions: FOLD_CALL_3BET, ...REACHED, strategy, ev, ...at };
}

function graded(grade: Grade) {
  if (grade.kind !== "graded") throw new Error(`expected a graded decision, got ${grade.kind}`);
  return grade;
}

describe("the dials the grader reads", () => {
  it("hold E1's values and Zach's answers of board item 41", () => {
    expect(DIALS.gtoGoodFrequency).toBe(0.1);
    expect(DIALS.gtoMistakeCostBb).toBe(0.15);
    expect(DIALS.gtoEqualEvBb).toBe(0.0025);
    expect(DIALS.reachFloor).toBe(0.0001);
    expect(DIALS.gtoNeverHeldReach).toBe(0.000001);
  });
});

describe("a decision at a reached row the actor holds", () => {
  it("calls a correct mixed play good, at no cost", () => {
    const grade = graded(gradeRow(row([0, 0.3, 0.7], [-1, 2.11, 2.11]), "call"));
    expect(grade).toMatchObject({ basis: "mix", frequency: 0.3, costBb: 0, label: "good" });
    expect(grade.mix).toEqual([
      { action: "fold", frequency: 0, ev: -1 },
      { action: "call", frequency: 0.3, ev: 2.11 },
      { action: "3bet", frequency: 0.7, ev: 2.11 },
    ]);
  });

  it("calls an action at 0 that costs more than 0.15 bb a mistake", () => {
    const grade = graded(gradeRow(row([0, 0.3, 0.7], [-1, 2.11, 2.11]), "fold"));
    expect(grade.label).toBe("mistake");
    expect(grade.costBb).toBeCloseTo(3.11, 10);
  });

  it("gives no label between the two: under 0.10 of the time and 0.15 bb or less", () => {
    expect(graded(gradeRow(row([0.05, 0.25, 0.7], [1.98, 2.0, 2.1]), "fold")).label).toBeNull();
    expect(graded(gradeRow(row([0, 0.3, 0.7], [1.99, 2.0, 2.11]), "fold")).label).toBeNull();
  });

  it("puts each edge on the side the dials name", () => {
    expect(labelOf(0.1, 1)).toBe("good");
    expect(labelOf(0.0999, 1)).toBe("mistake");
    expect(labelOf(0, 0.15)).toBeNull();
    expect(labelOf(0, 0.1501)).toBe("mistake");
    expect(labelOf(0, 0.0025)).toBe("good");
    expect(labelOf(0, 0.0026)).toBeNull();
  });

  it("puts a cost the key writes on a dial on the dial's side, after the subtraction", () => {
    // Two rows of the key on 2026-10-16: -22.0 less -22.0025 is 0.002500000000001279 unrounded,
    // and -1.0 less -1.15 is 0.1499999999999999.
    const band = graded(gradeRow({ ...row([1, 0], [-22.0, -22.0025]), actions: ["fold", "call"] }, "call"));
    expect(band).toMatchObject({ costBb: 0.0025, label: "good" });
    const line = graded(gradeRow({ ...row([1, 0], [-1.0, -1.15]), actions: ["fold", "call"] }, "call"));
    expect(line).toMatchObject({ costBb: 0.15, label: null });
  });

  it("calls an action within 0.0025 bb of the best good at any frequency (answer (a))", () => {
    const grade = graded(gradeRow(row([0, 0.98, 0.02], [-1, 2.0, 1.998]), "3bet"));
    expect(grade).toMatchObject({ frequency: 0.02, label: "good" });
    expect(grade.costBb).toBeCloseTo(0.002, 10);
  });

  it("lets good win when an action at 0.10 or more costs above 0.15 bb (answer (c))", () => {
    expect(graded(gradeRow(row([0, 0.2, 0.8], [-1, 1.5, 2.0]), "call")).label).toBe("good");
  });

  it("refuses an action the node does not have", () => {
    expect(() => gradeRow(row([0, 0.3, 0.7], [-1, 2, 2]), "5bet")).toThrow("5bet is not an action of this node");
  });
});

describe("a decision at a node the solver never reaches (KEY-SPEC.md 7.1)", () => {
  it("shows no EV and no cost under reachFloor, and keeps the frequencies", () => {
    const grade = gradeRow(row([0, 0.3, 0.7], [-1, 0.5, 2.11], { reach: 0.00009 }), "fold");
    expect(grade).toEqual({
      kind: "unreached",
      chosen: "fold",
      mix: [
        { action: "fold", frequency: 0, ev: null },
        { action: "call", frequency: 0.3, ev: null },
        { action: "3bet", frequency: 0.7, ev: null },
      ],
    });
  });

  it("grades a node reached exactly at the floor", () => {
    expect(gradeRow(row([0, 0.3, 0.7], [-1, 0.5, 2.11], { reach: 0.0001 }), "fold").kind).toBe("graded");
  });
});

describe("a decision at a row the actor never holds (KEY-SPEC.md 10, item 1; answer (b))", () => {
  const UNIFORM = [1 / 3, 1 / 3, 1 / 3];

  it("hides the uniform mix and labels by cost alone", () => {
    const grade = graded(gradeRow(row(UNIFORM, [-2.5, -4.05, -9.9], { handReach: 0 }), "call"));
    expect(grade).toMatchObject({ basis: "cost", frequency: null, label: "mistake" });
    expect(grade.costBb).toBeCloseTo(1.55, 10);
    expect(grade.mix.map((line) => line.frequency)).toEqual([null, null, null]);
    expect(grade.mix.map((line) => line.ev)).toEqual([-2.5, -4.05, -9.9]);
  });

  it("never calls an action good for its uniform frequency", () => {
    expect(graded(gradeRow(row(UNIFORM, [-2.5, -2.6, -9.9], { handReach: 0 }), "call")).label).toBeNull();
    expect(graded(gradeRow(row(UNIFORM, [-2.5, -2.6, -9.9], { handReach: 0 }), "fold")).label).toBe("good");
  });

  it("puts the line at 1e-6: a hand held at 1e-6 is graded by its mix", () => {
    expect(graded(gradeRow(row(UNIFORM, [-2.5, -2.6, -9.9], { handReach: 0.000001 }), "call")).label).toBe("good");
    expect(graded(gradeRow(row(UNIFORM, [-2.5, -2.6, -9.9], { handReach: 0.00000099 }), "call")).basis).toBe("cost");
  });

  it("hides the frequencies at an unreached node too", () => {
    const grade = gradeRow(row(UNIFORM, [-2.5, -2.6, -9.9], { reach: 0, handReach: 0 }), "call");
    expect(grade.kind === "unreached" && grade.mix.every((line) => line.frequency === null && line.ev === null)).toBe(true);
  });
});

// Real rows of the bundled key, with the numbers each test expects written out from
// app/src/gto/data/key.json (read with python3, 2026-10-16) and HANDOFF.md step 57.
describe("rows of the key", () => {
  function realGrade(id: string, held: Parameters<typeof handRow>[1], chosen: GtoAction): Grade {
    const node = gtoKey().nodes.get(id);
    if (node === undefined) throw new Error(`no node ${id}`);
    return gradeRow(handRow(node, held), chosen);
  }

  it("grades HJ's call of CO's 5-bet with QQ a mistake of 0.4552 bb, and its fold good", () => {
    const id = "UTG:fold/HJ:open/CO:3bet/HJ:4bet/CO:5bet";
    const call = graded(realGrade(id, "QQ", "call"));
    expect(call).toMatchObject({ basis: "mix", frequency: 0.0004, label: "mistake" });
    expect(call.costBb).toBeCloseTo(0.4552, 6);
    expect(graded(realGrade(id, "QQ", "fold"))).toMatchObject({ frequency: 0.9996, costBb: 0, label: "good" });
  });

  it("grades CO's 72o facing BTN's 3-bet by cost alone, its uniform row hidden", () => {
    const id = "UTG:fold/HJ:fold/CO:open/BTN:3bet";
    const call = graded(realGrade(id, "72o", "call"));
    expect(call).toMatchObject({ basis: "cost", frequency: null, label: "mistake" });
    expect(call.costBb).toBeCloseTo(1.5546, 6);
    expect(graded(realGrade(id, "72o", "4bet")).costBb).toBeCloseTo(7.4382, 6);
    expect(graded(realGrade(id, "72o", "fold"))).toMatchObject({ costBb: 0, label: "good" });
  });

  it("shows no EV loss at UTG facing the big blind's 5-bet, the one node under reachFloor", () => {
    const id = "UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold/BB:3bet/UTG:4bet/BB:5bet";
    expect(gtoKey().nodes.get(id)?.reach).toBe(0.000087);
    const fold = realGrade(id, "KK", "fold");
    expect(fold.kind).toBe("unreached");
    expect(fold.kind === "unreached" && fold.mix.map((line) => line.frequency)).toEqual([0.6636, 0.3364]);
  });

  it("calls UTG's mixed open of 44 good either way: 0.4023 at an EV equal to the fold", () => {
    expect(graded(realGrade("root", "44", "open"))).toMatchObject({ frequency: 0.4023, costBb: 0, label: "good" });
    expect(graded(realGrade("root", "44", "fold"))).toMatchObject({ frequency: 0.5977, costBb: 0, label: "good" });
  });

  it("calls good the actions under 0.10 within the noise band (answer (a))", () => {
    const call = graded(realGrade("UTG:open/HJ:3bet/UTG:4bet/HJ:5bet", "QQ", "call"));
    expect(call).toMatchObject({ frequency: 0.0957, label: "good" });
    expect(call.costBb).toBeCloseTo(0.0009, 6);
    const fourBet = graded(realGrade("UTG:open/HJ:3bet", "KJs", "4bet"));
    expect(fourBet).toMatchObject({ frequency: 0.077, label: "good" });
    expect(fourBet.costBb).toBeCloseTo(0.0007, 6);
  });

  it("finds no reached, held row where an action at 0.10 or more costs above 0.15 bb", () => {
    const key = gtoKey();
    const clashes = [...key.nodes.values()].flatMap((node) =>
      key.hands.flatMap((held, h) => {
        const best = Math.max(...node.ev[h]);
        const reached = node.reach >= DIALS.reachFloor && node.handReach[h] >= DIALS.gtoNeverHeldReach;
        return node.strategy[h].flatMap((frequency, a) =>
          reached && frequency >= DIALS.gtoGoodFrequency && best - node.ev[h][a] > DIALS.gtoMistakeCostBb ? [`${node.id} ${held}`] : [],
        );
      }),
    );
    expect(clashes).toEqual([]);
  });
});
