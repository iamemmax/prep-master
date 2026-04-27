import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/dashboard/util/hooks/useCreditBalance", () => ({
  useCreditBalance: vi.fn(),
}));

import { useCreditBalance } from "@/app/dashboard/util/hooks/useCreditBalance";
import CreditBadge from "@/app/dashboard/components/dashboard/CreditBadge";

const mockedUseCreditBalance = vi.mocked(useCreditBalance);

describe("CreditBadge", () => {
  beforeEach(() => {
    mockedUseCreditBalance.mockReset();
  });

  it("renders the remaining credit count", () => {
    mockedUseCreditBalance.mockReturnValue({ remaining: 100, total: 250 });
    render(<CreditBadge />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText(/credits/i)).toBeInTheDocument();
  });

  it("uses an emerald icon when above 50% remaining", () => {
    mockedUseCreditBalance.mockReturnValue({ remaining: 200, total: 250 });
    const { container } = render(<CreditBadge />);
    expect(container.querySelector(".text-emerald-500")).not.toBeNull();
  });

  it("uses an amber icon between 20% and 50% remaining", () => {
    mockedUseCreditBalance.mockReturnValue({ remaining: 100, total: 250 });
    const { container } = render(<CreditBadge />);
    expect(container.querySelector(".text-\\[\\#F7C948\\]")).not.toBeNull();
  });

  it("uses a rose icon at or below 20% remaining (low credit)", () => {
    mockedUseCreditBalance.mockReturnValue({ remaining: 30, total: 250 });
    const { container } = render(<CreditBadge />);
    expect(container.querySelector(".text-rose-500")).not.toBeNull();
  });

  it("includes the remaining/total in the title attribute for accessibility", () => {
    mockedUseCreditBalance.mockReturnValue({ remaining: 100, total: 250 });
    render(<CreditBadge />);
    const badge = screen.getByTitle(/100.+250/i);
    expect(badge).toBeInTheDocument();
  });
});
