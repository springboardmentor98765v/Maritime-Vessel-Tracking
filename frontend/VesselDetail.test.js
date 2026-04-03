import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import VesselDetail from "../pages/VesselDetail";

const renderWithId = (id) => {
  render(
    <MemoryRouter initialEntries={[`/vessel/${id}`]}>
      <Routes>
        <Route path="/vessel/:id" element={<VesselDetail />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("VesselDetail — Tests", () => {

  test("shows loading state initially", () => {
    renderWithId("1");
    expect(screen.getByText(/Loading vessel data/i)).toBeInTheDocument();
  });

  test("shows MSC LUNA details for id 1", async () => {
    renderWithId("1");
    await waitFor(() => {
      expect(screen.getByText("🚢 MSC LUNA")).toBeInTheDocument();
    });
  });

  test("shows OCEAN KING details for id 2", async () => {
    renderWithId("2");
    await waitFor(() => {
      expect(screen.getByText("🚢 OCEAN KING")).toBeInTheDocument();
    });
  });

  test("shows STAR VOYAGER details for id 3", async () => {
    renderWithId("3");
    await waitFor(() => {
      expect(screen.getByText("🚢 STAR VOYAGER")).toBeInTheDocument();
    });
  });

  test("shows PACIFIC DAWN details for id 4", async () => {
    renderWithId("4");
    await waitFor(() => {
      expect(screen.getByText("🚢 PACIFIC DAWN")).toBeInTheDocument();
    });
  });

  test("shows vessel not found for invalid id", async () => {
    renderWithId("999");
    await waitFor(() => {
      expect(screen.getByText(/Vessel not found/i)).toBeInTheDocument();
    });
  });

  test("subscribe button exists", async () => {
    renderWithId("1");
    await waitFor(() => {
      expect(screen.getByText("🔔 Subscribe")).toBeInTheDocument();
    });
  });

  test("clicking subscribe changes button to subscribed", async () => {
    renderWithId("1");
    await waitFor(() => {
      expect(screen.getByText("🔔 Subscribe")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("🔔 Subscribe"));
    await waitFor(() => {
      expect(
        screen.getByText("✅ Already Subscribed")
      ).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test("shows event history table", async () => {
    renderWithId("1");
    await waitFor(() => {
      expect(screen.getByText("📋 Event History")).toBeInTheDocument();
    });
  });

  test("back button exists", async () => {
    renderWithId("1");
    await waitFor(() => {
      expect(screen.getByText("← Back")).toBeInTheDocument();
    });
  });

});