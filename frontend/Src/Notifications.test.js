import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Notifications from "../pages/Notifications";

describe("Notifications — Tests", () => {

  test("renders notifications page", () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );
    expect(screen.getByText(/🔔 Notifications/i)).toBeInTheDocument();
  });

  test("shows unread count badge", () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );
    const unreadElements = screen.getAllByText(/unread/i);
    expect(unreadElements.length).toBeGreaterThan(0);
  });

  // ── FIX: use getAllByText for all 3 tabs
  // because Read matches "Mark as Read" and "✓ Read" too ──
  test("filter tabs exist", () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );
    // ── Check All tab exists ──
    const allTabElements = screen.getAllByText(/All \(\d+\)/i);
    expect(allTabElements.length).toBeGreaterThan(0);

    // ── Check Unread tab exists ──
    const unreadTabElements = screen.getAllByText(/Unread \(\d+\)/i);
    expect(unreadTabElements.length).toBeGreaterThan(0);

    // ── Check Read tab exists ──
    const readTabElements = screen.getAllByText(/^Read \(\d+\)$/i);
    expect(readTabElements.length).toBeGreaterThan(0);
  });

  test("mark as read button exists", () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );
    const markBtns = screen.getAllByText(/✓ Mark as Read/i);
    expect(markBtns.length).toBeGreaterThan(0);
  });

  test("clicking mark as read updates notification", () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );
    const markBtn = screen.getAllByText(/✓ Mark as Read/i)[0];
    fireEvent.click(markBtn);
    expect(screen.getAllByText(/✓ Read/i).length).toBeGreaterThan(0);
  });

  test("mark all read button works", () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );
    const markAllBtn = screen.getByText(/✓ Mark All as Read/i);
    fireEvent.click(markAllBtn);
    expect(screen.queryByText(/\d+ unread/i)).not.toBeInTheDocument();
  });

  test("back button exists", () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );
    expect(screen.getByText("← Back")).toBeInTheDocument();
  });

});