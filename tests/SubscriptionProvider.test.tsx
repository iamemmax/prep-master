import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/app/dashboard/util/hooks/useCreditBalance", () => ({
  useCreditBalance: vi.fn(),
}));

import { useCreditBalance } from "@/app/dashboard/util/hooks/useCreditBalance";
import {
  SubscriptionProvider,
  useSubscription,
} from "@/app/dashboard/components/subscription/SubscriptionProvider";

const mockedUseCreditBalance = vi.mocked(useCreditBalance);

function setBalance(remaining: number, total: number) {
  mockedUseCreditBalance.mockReturnValue({ remaining, total });
}

function ProbeButton() {
  const sub = useSubscription();
  return (
    <>
      <span data-testid="is-low">{String(sub.isLow)}</span>
      <button onClick={sub.openUpgradeModal}>open</button>
      <button data-testid="action-button" onClick={() => undefined}>
        regular action
      </button>
      <button data-testid="opt-out" data-no-paywall onClick={() => undefined}>
        opt out
      </button>
    </>
  );
}

function renderProvider() {
  return render(
    <SubscriptionProvider>
      <ProbeButton />
    </SubscriptionProvider>,
  );
}

describe("SubscriptionProvider", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockedUseCreditBalance.mockReset();
  });

  it("does not show the modal when credits are above the threshold", () => {
    setBalance(200, 250); // 80% remaining
    renderProvider();
    expect(screen.getByTestId("is-low").textContent).toBe("false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("auto-opens the modal when remaining ≤ 20%", () => {
    setBalance(30, 250); // 12% remaining
    renderProvider();
    expect(screen.getByTestId("is-low").textContent).toBe("true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("respects the dismissed flag in sessionStorage and stays closed", () => {
    sessionStorage.setItem("subscription:low-credit-dismissed", "true");
    setBalance(30, 250);
    renderProvider();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("dismissing the auto-popup persists to sessionStorage", async () => {
    setBalance(30, 250);
    renderProvider();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const close = screen.getByRole("button", { name: /close/i });
    await userEvent.click(close);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(sessionStorage.getItem("subscription:low-credit-dismissed")).toBe("true");
  });

  it("intercepts button clicks while low and opens the modal instead", async () => {
    sessionStorage.setItem("subscription:low-credit-dismissed", "true");
    setBalance(30, 250);
    renderProvider();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("action-button"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not intercept buttons marked with data-no-paywall", async () => {
    sessionStorage.setItem("subscription:low-credit-dismissed", "true");
    setBalance(30, 250);
    renderProvider();

    await userEvent.click(screen.getByTestId("opt-out"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not intercept clicks when credits are healthy", async () => {
    setBalance(200, 250);
    renderProvider();

    await userEvent.click(screen.getByTestId("action-button"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("SubscriptionProvider – manual control", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockedUseCreditBalance.mockReset();
  });

  it("openUpgradeModal opens the modal even when credits are healthy", () => {
    setBalance(200, 250);
    function Trigger() {
      const { openUpgradeModal } = useSubscription();
      return <button onClick={openUpgradeModal}>upgrade</button>;
    }
    render(
      <SubscriptionProvider>
        <Trigger />
      </SubscriptionProvider>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => {
      screen.getByRole("button", { name: /upgrade/i }).click();
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
