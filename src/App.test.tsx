import "@testing-library/jest-dom";

import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import App from "./App";

describe("App Component", () => {
  it("renders the heading", () => {
    render(<App />);
    const headingElement = screen.getByText(/Hello from Chrome Extension!/i);
    expect(headingElement).toBeInTheDocument();
  });
});
