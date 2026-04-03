import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MapPage from "../pages/MapPage";

// ── Mock Leaflet — does not work in Jest ──
jest.mock("leaflet", () => ({
  divIcon: jest.fn(() => ({})),
  Icon: { Default: { prototype: {}, mergeOptions: jest.fn() } },
}));

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
}));

jest.mock("react-leaflet-markercluster", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

describe("MapPage — Filter Tests", () => {

  test("renders filter sidebar", () => {
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );
    expect(screen.getByText("🔍 Filter Vessels")).toBeInTheDocument();
  });

  test("renders vessel type dropdown", () => {
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );
    expect(screen.getByDisplayValue("All")).toBeInTheDocument();
  });

  test("filter by Container shows 1 vessel", async () => {
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );
    const select = screen.getByDisplayValue("All");
    fireEvent.change(select, { target: { value: "Container" } });
    await waitFor(() => {
      expect(screen.getByText(/1 vessels found/i)).toBeInTheDocument();
    });
  });

  test("reset filters shows all vessels", async () => {
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );
    const select = screen.getByDisplayValue("All");
    fireEvent.change(select, { target: { value: "Tanker" } });
    const resetBtn = screen.getByText("Reset Filters");
    fireEvent.click(resetBtn);
    await waitFor(() => {
      expect(screen.getByText(/4 vessels found/i)).toBeInTheDocument();
    });
  });

  test("no results message shows when filter has no match", async () => {
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );
    const flagInput = screen.getByPlaceholderText("e.g. India");
    fireEvent.change(flagInput, { target: { value: "ZZZZZZ" } });
    await waitFor(() => {
      expect(
        screen.getByText(/No vessels match your filters/i)
      ).toBeInTheDocument();
    });
  });

});