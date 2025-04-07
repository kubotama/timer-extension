// src/App.test.tsx
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/Hello from Chrome Extension!/i);
  expect(linkElement).toBeInTheDocument();
});
