import React from "react";
import moment from "moment-timezone";
import nock from "nock";

import PersistedModels from "metabase/entities/persisted-models";
import { ModelCacheRefreshStatus } from "metabase-types/api";
import { getMockModelCacheInfo } from "metabase-types/api/mocks/models";

import {
  fireEvent,
  renderWithProviders,
  waitFor,
  screen,
} from "__support__/ui";
import { ORDERS } from "__support__/sample_database_fixture";

import ModelCacheManagementSection from "./ModelCacheManagementSection";

type SetupOpts = Partial<ModelCacheRefreshStatus> & {
  waitForSectionAppearance?: boolean;
};

async function setup({
  waitForSectionAppearance = true,
  ...cacheInfo
}: SetupOpts = {}) {
  const question = ORDERS.question();
  const model = question.setCard({
    ...question.card(),
    id: 1,
    name: "Order model",
    dataset: true,
  });

  const modelCacheInfo = getMockModelCacheInfo({
    ...cacheInfo,
    card_id: model.id(),
    card_name: model.displayName(),
  });

  const onRefreshMock = jest
    .spyOn(PersistedModels.objectActions, "refreshCache")
    .mockReturnValue({ type: "__MOCK__" });

  nock(/.*/).get(`/api/persist/card/${model.id()}`).reply(200, modelCacheInfo);

  if (!waitForSectionAppearance) {
    jest.spyOn(PersistedModels, "Loader").mockImplementation(props => {
      const { children } = props as any;
      return children({ persistedModel: cacheInfo });
    });
  }

  const utils = renderWithProviders(
    <ModelCacheManagementSection model={model} />,
  );

  if (waitForSectionAppearance) {
    await waitFor(() => utils.queryByTestId("model-cache-section"));
  }

  return {
    ...utils,
    modelCacheInfo,
    onRefreshMock,
  };
}

describe("ModelCacheManagementSection", () => {
  afterEach(() => {
    nock.cleanAll();
    jest.resetAllMocks();
  });

  it("doesn't show up in 'off' state", async () => {
    await setup({ state: "off" });
    expect(screen.queryByTestId("model-cache-section")).not.toBeInTheDocument();
  });

  it("doesn't show up in 'deletable' state", async () => {
    await setup({ state: "deletable" });
    expect(screen.queryByTestId("model-cache-section")).not.toBeInTheDocument();
  });

  it("displays 'creating' state correctly", async () => {
    await setup({ state: "creating" });
    expect(
      await screen.findByText("Waiting to create the first model cache"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("refresh icon")).not.toBeInTheDocument();
  });

  it("displays 'refreshing' state correctly", async () => {
    await setup({ state: "refreshing" });
    expect(
      await screen.findByText("Refreshing model cache"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("refresh icon")).not.toBeInTheDocument();
  });

  it("displays 'persisted' state correctly", async () => {
    const { modelCacheInfo } = await setup({ state: "persisted" });
    const expectedTimestamp = moment(modelCacheInfo.refresh_end).fromNow();
    expect(
      await screen.findByText(`Model last cached ${expectedTimestamp}`),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("refresh icon")).toBeInTheDocument();
  });

  it("triggers refresh from 'persisted' state", async () => {
    const { modelCacheInfo, onRefreshMock } = await setup({
      state: "persisted",
    });
    fireEvent.click(await screen.findByLabelText("refresh icon"));
    expect(onRefreshMock).toHaveBeenCalledWith(modelCacheInfo);
  });

  it("displays 'error' state correctly", async () => {
    const { modelCacheInfo } = await setup({ state: "error" });
    const expectedTimestamp = moment(modelCacheInfo.refresh_end).fromNow();

    expect(
      await screen.findByText("Failed to update model cache"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Last attempt ${expectedTimestamp}`),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("refresh icon")).toBeInTheDocument();
  });

  it("triggers refresh from 'error' state", async () => {
    const { modelCacheInfo, onRefreshMock } = await setup({ state: "error" });
    fireEvent.click(await screen.findByLabelText("refresh icon"));
    expect(onRefreshMock).toHaveBeenCalledWith(modelCacheInfo);
  });
});
