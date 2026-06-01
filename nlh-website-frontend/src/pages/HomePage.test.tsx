import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { HomePage } from "./HomePage";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

function reply(data: unknown, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
}

describe("HomePage", () => {
  it("renders posts returned from the API", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith("/api/site-settings")) {
        return reply({
          id: 1,
          siteTitle: "Nik",
          headline: "builder of things",
          aboutMarkdown: "",
          headshotUrl: null,
          socialLinks: [],
          updatedAt: new Date().toISOString(),
        });
      }
      if (url.includes("/api/posts")) {
        return reply([
          {
            id: 1,
            slug: "hello",
            title: "Hello world",
            description: "first post",
            content: "",
            category: null,
            coverImageUrl: null,
            published: true,
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
      throw new Error(`Unmocked URL ${url}`);
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => expect(screen.getByText("Nik")).toBeInTheDocument());
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText(/builder of things/i)).toBeInTheDocument();
  });

  it("shows empty state when there are no posts", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith("/api/site-settings")) {
        return reply({
          id: 1,
          siteTitle: "Nik",
          headline: "",
          aboutMarkdown: "",
          headshotUrl: null,
          socialLinks: [],
          updatedAt: new Date().toISOString(),
        });
      }
      if (url.includes("/api/posts")) return reply([]);
      throw new Error(`Unmocked URL ${url}`);
    });

    renderWithProviders(<HomePage />);
    await waitFor(() => expect(screen.getByText(/no posts yet/i)).toBeInTheDocument());
  });
});
