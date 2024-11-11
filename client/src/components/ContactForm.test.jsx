import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ContactForm from "./ContactForm";

test("renders ContactForm component", () => {
  render(<ContactForm />);
  expect(screen.getByText(/submit/i)).toBeInTheDocument();
});
