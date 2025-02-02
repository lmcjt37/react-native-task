import React from "react";
import renderer from "react-test-renderer";

import { EventDetails } from "../../src/components/EventDetails";
import { LikedContext } from "../../src/contexts/likedContext";
import { event } from "../fixtures/events";

describe("EventDetails", () => {
  const wrapper = (props) => {
    const contextValue = {
      ids: [],
    };

    return (
      <LikedContext.Provider value={contextValue}>
        <EventDetails {...props} />
      </LikedContext.Provider>
    );
  };

  test("renders event info correctly", () => {
    const mockHandler = () => {
      console.log("onEventLike called");
    };
    const props = { event, eventLike: true, onEventLike: mockHandler };
    const json = renderer.create(wrapper(props)).toJSON();
    expect(json).toMatchSnapshot();
  });
});
