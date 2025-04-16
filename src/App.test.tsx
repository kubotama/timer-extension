import "@testing-library/jest-dom";

import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import App from "./App";

describe("App Component", () => {
  it("renders the heading", () => {
    render(<App />);
    const headingElement = screen.getByText(/開始/i);
    expect(headingElement).toBeInTheDocument();
  });
});
