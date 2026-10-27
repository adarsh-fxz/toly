import { describe, expect, it } from "vitest";
import { describeWindow, isAvailableAt, kathmanduClock } from "./availability";

// 2026-10-27 is a Tuesday. Kathmandu is UTC+05:45.
const at = (utc: string) => new Date(utc);
const weekdayAfternoons = {
  availableDays: [1, 2, 3, 4, 5],
  availableFrom: "14:00",
  availableUntil: "17:30",
};

describe("kathmanduClock", () => {
  it("applies the +05:45 offset", () => {
    expect(kathmanduClock(at("2026-10-27T08:15:00Z"))).toEqual({
      day: 2,
      time: "14:00",
    });
  });

  it("rolls the weekday over at local midnight", () => {
    expect(kathmanduClock(at("2026-10-27T18:20:00Z")).day).toBe(3);
  });
});

describe("isAvailableAt", () => {
  it("allows inside the window", () => {
    expect(isAvailableAt(weekdayAfternoons, at("2026-10-27T08:15:00Z"))).toBe(
      true,
    );
  });

  it("refuses at the end time", () => {
    expect(isAvailableAt(weekdayAfternoons, at("2026-10-27T11:45:00Z"))).toBe(
      false,
    );
  });

  it("refuses on an excluded day", () => {
    expect(isAvailableAt(weekdayAfternoons, at("2026-10-25T09:00:00Z"))).toBe(
      false,
    );
  });

  it("allows any time when no hours are set", () => {
    const anyTime = {
      availableDays: [0, 1, 2, 3, 4, 5, 6],
      availableFrom: null,
      availableUntil: null,
    };
    expect(isAvailableAt(anyTime, at("2026-10-27T20:00:00Z"))).toBe(true);
  });
});

describe("describeWindow", () => {
  it("joins days and hours", () => {
    expect(describeWindow(weekdayAfternoons)).toBe("Weekdays, 14:00 to 17:30");
  });
});
