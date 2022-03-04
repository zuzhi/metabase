import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMockCollection,
  createMockTimeline,
  createMockTimelineEvent,
} from "metabase-types/api/mocks";
import TimelineDetailsModal, {
  TimelineDetailsModalProps,
} from "./TimelineDetailsModal";

describe("TimelineDetailsModal", () => {
  it("should search a list of events", async () => {
    const props = getProps({
      timeline: createMockTimeline({
        events: [
          createMockTimelineEvent({ name: "RC1" }),
          createMockTimelineEvent({ name: "RC2" }),
          createMockTimelineEvent({ name: "Release" }),
        ],
      }),
    });

    render(<TimelineDetailsModal {...props} />);

    userEvent.type(screen.getByPlaceholderText("Search for an event"), "RC");
    await waitFor(() => {
      expect(screen.getByText("RC1")).toBeInTheDocument();
      expect(screen.getByText("RC2")).toBeInTheDocument();
      expect(screen.queryByText("Release")).not.toBeInTheDocument();
    });

    userEvent.type(screen.getByPlaceholderText("Search for an event"), "1");
    await waitFor(() => {
      expect(screen.getByText("RC1")).toBeInTheDocument();
      expect(screen.queryByText("RC2")).not.toBeInTheDocument();
    });
  });
});

const getProps = (
  opts?: Partial<TimelineDetailsModalProps>,
): TimelineDetailsModalProps => ({
  timeline: createMockTimeline(),
  collection: createMockCollection(),
  ...opts,
});
