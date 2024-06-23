import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import CreateCriminal from "./CreateCriminal";

describe.skip("CreateCriminal Component", () => {
  test("renders correctly", () => {
    render(
      <Router>
        <CreateCriminal />
      </Router>,
    );
    const button = screen
      .getAllByText("Create Criminal")
      .find((element) => element.tagName === "BUTTON");
    expect(button).toBeInTheDocument();
  });

  test("submits form data", () => {
    render(
      <Router>
        <CreateCriminal />
      </Router>,
    );
    const nameInput = screen.getByLabelText("Name:");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    const buttons = screen.getAllByText("Create Criminal");
    const submitButton = buttons.find((button) => button.tagName === "BUTTON");

    // Check if submitButton is defined before clicking
    if (submitButton) {
      fireEvent.click(submitButton);
      // Assuming your component shows a message on submit
      expect(
        screen.getByText("Criminal created successfully!"),
      ).toBeInTheDocument();
    } else {
      throw new Error("Submit button not found");
    }
  });
});
