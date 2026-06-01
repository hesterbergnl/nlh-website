import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./LoginPage";

const signInMock = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  signIn: { email: (args: unknown) => signInMock(args) },
  signOut: vi.fn(),
  useSession: () => ({ data: null }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

beforeEach(() => signInMock.mockReset());

describe("LoginPage", () => {
  it("submits email + password", async () => {
    signInMock.mockResolvedValue({ error: null, data: {} });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), "me@example.com");
    await user.type(screen.getByLabelText(/password/i), "hunter2");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(signInMock).toHaveBeenCalledWith({
      email: "me@example.com",
      password: "hunter2",
    });
  });
});
